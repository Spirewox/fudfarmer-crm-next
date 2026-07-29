import type { AppUser } from '@/types/api';

const WHOAMI_CACHE_KEY = 'fudfarmer_whoami';

export function readWhoAmICache(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(WHOAMI_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppUser;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWhoAmICache(user: AppUser): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(WHOAMI_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Ignore quota / private-mode failures
  }
}

export function clearWhoAmICache(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(WHOAMI_CACHE_KEY);
  } catch {
    // Ignore
  }
}
