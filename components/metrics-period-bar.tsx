'use client';

import { useMemo, useState, useCallback } from 'react';

export type MetricsPeriodPreset = 'today' | 'week' | 'month' | 'all';

export type MetricsPeriodState = {
  preset: MetricsPeriodPreset;
  dateFrom: string;
  dateTo: string;
  /** Custom range overrides preset when a complete From–To is set */
  isCustom: boolean;
  rangeError: string | null;
  apiParams: {
    period?: MetricsPeriodPreset;
    date_from?: string;
    date_to?: string;
  };
  setPreset: (p: MetricsPeriodPreset) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  clearCustomRange: () => void;
};

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Daily=today; Weekly=last 8 days; Monthly=last 30 days; All=unbounded. */
export function getMetricsDateRange(preset: MetricsPeriodPreset): { from: string; to: string } {
  const to = utcToday();
  if (preset === 'all') return { from: '', to: '' };
  if (preset === 'today') return { from: to, to };
  if (preset === 'week') {
    const d = new Date(`${to}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    return { from: d.toISOString().slice(0, 10), to };
  }
  const d = new Date(`${to}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 29);
  return { from: d.toISOString().slice(0, 10), to };
}

export function describeMetricsPeriod(
  period: Pick<MetricsPeriodState, 'preset' | 'isCustom' | 'dateFrom' | 'dateTo'>,
): string {
  if (period.isCustom) {
    return `Custom — from ${period.dateFrom} to ${period.dateTo}`;
  }
  const range = getMetricsDateRange(period.preset);
  if (period.preset === 'today') {
    return `Daily — today (${range.to})`;
  }
  if (period.preset === 'week') {
    return `Weekly — last 8 days from ${range.from} to ${range.to}`;
  }
  if (period.preset === 'month') {
    return `Monthly — last 30 days from ${range.from} to ${range.to}`;
  }
  return 'All Time — all available periods';
}

export function useMetricsPeriod(
  defaultPreset: MetricsPeriodPreset = 'all',
): MetricsPeriodState {
  const [preset, setPreset] = useState<MetricsPeriodPreset>(defaultPreset);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const selectPreset = useCallback((p: MetricsPeriodPreset) => {
    setPreset(p);
    setDateFrom('');
    setDateTo('');
  }, []);

  const clearCustomRange = useCallback(() => {
    setDateFrom('');
    setDateTo('');
  }, []);

  const rangeError = useMemo(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return 'From date must be on or before To date';
    }
    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      return 'Select both From and To to apply a custom range';
    }
    return null;
  }, [dateFrom, dateTo]);

  const isCustom = Boolean(dateFrom && dateTo && !rangeError);

  const apiParams = useMemo(() => {
    if (dateFrom && dateTo && !rangeError) {
      return { date_from: dateFrom, date_to: dateTo };
    }
    // Incomplete or invalid custom input — keep last valid preset query
    return { period: preset };
  }, [preset, dateFrom, dateTo, rangeError]);

  return {
    preset,
    dateFrom,
    dateTo,
    isCustom,
    rangeError,
    apiParams,
    setPreset: selectPreset,
    setDateFrom,
    setDateTo,
    clearCustomRange,
  };
}

const PRESETS: { key: MetricsPeriodPreset; label: string }[] = [
  { key: 'today', label: 'Daily' },
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
  { key: 'all', label: 'All Time' },
];

type MetricsPeriodBarProps = {
  period: MetricsPeriodState;
  className?: string;
  hint?: string;
};

export function MetricsPeriodBar({
  period,
  className = '',
  hint,
}: Readonly<MetricsPeriodBarProps>) {
  const activeCaption = describeMetricsPeriod(period);

  return (
    <div className={`flex flex-col gap-3 ${className}`.trim()}>
      <div className="flex flex-col items-start gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Preset
        </span>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-1">
          {PRESETS.map((p) => {
            const active = !period.isCustom && period.preset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => period.setPreset(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Custom range
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={period.dateFrom}
            max={period.dateTo || undefined}
            onChange={(e) => period.setDateFrom(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            aria-label="From date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={period.dateTo}
            min={period.dateFrom || undefined}
            onChange={(e) => period.setDateTo(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            aria-label="To date"
          />
          {(period.dateFrom || period.dateTo) && (
            <button
              type="button"
              onClick={period.clearCustomRange}
              className="text-xs font-medium text-muted-foreground hover:text-foreground underline"
            >
              Clear range
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          Active range:{' '}
          <span className="font-semibold text-foreground">{activeCaption}</span>
        </span>
        {hint && <span>{hint}</span>}
        {period.rangeError && (
          <span className="text-amber-700 font-medium">{period.rangeError}</span>
        )}
      </div>
    </div>
  );
}
