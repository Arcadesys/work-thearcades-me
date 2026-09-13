'use client';

import { useSyncExternalStore } from 'react';

/**
 * AUTO defers to the operating system; LIGHT and DARK pin a palette and are
 * remembered for this browser. AUTO is the absence of a stored choice rather
 * than a third stored value, so clearing the override and going back to
 * following the system is the same operation.
 */
export type ThemeMode = 'auto' | 'light' | 'dark';

/** Shared with the bootstrap script in app/layout.tsx — keep the two in step. */
export const THEME_STORAGE_KEY = 'theme';

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const LIGHT_QUERY = '(prefers-color-scheme: light)';

function prefersLight(): boolean {
  try {
    return window.matchMedia(LIGHT_QUERY).matches;
  } catch {
    return false;
  }
}

/**
 * `data-theme` is the resolved palette the stylesheet keys off; `data-theme-mode`
 * is the reader's choice, which the stylesheet reads to fill in the selected
 * pill. Writing both here keeps the switch and the bootstrap script agreeing on
 * the same two attributes.
 */
function stamp(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.dataset.theme = mode === 'auto' ? (prefersLight() ? 'light' : 'dark') : mode;
}

/*
 * The mode lives on <html>, written by the bootstrap script before React
 * exists, so it is external state React reads rather than state React owns.
 * useSyncExternalStore is the sanctioned way to read it: it takes the server
 * snapshot during hydration and swaps in the real one immediately after, so
 * there is no markup mismatch and no setState-in-effect.
 */
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  const onSystemChange = () => {
    // Only AUTO tracks the system; a pinned palette must not drift under a
    // reader who deliberately pinned it.
    if (getSnapshot() === 'auto') stamp('auto');
    emit();
  };

  let query: MediaQueryList | null = null;
  try {
    query = window.matchMedia(LIGHT_QUERY);
    query.addEventListener('change', onSystemChange);
  } catch {
    // Without matchMedia there is no system signal to follow; the stored
    // choice, or the dark default, still applies.
  }

  return () => {
    listeners.delete(onStoreChange);
    query?.removeEventListener('change', onSystemChange);
  };
}

function getSnapshot(): ThemeMode {
  const stamped = document.documentElement.dataset.themeMode;
  return stamped === 'light' || stamped === 'dark' ? stamped : 'auto';
}

/** The server cannot know the reader's choice, so it renders the default. */
function getServerSnapshot(): ThemeMode {
  return 'auto';
}

function choose(mode: ThemeMode) {
  stamp(mode);
  try {
    if (mode === 'auto') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Private windows and blocked site data refuse storage. The choice still
    // applies to this page; it just will not outlive it.
  }
  emit();
}

export function ThemeSwitch() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="theme-switch" role="group" aria-label="Colour theme">
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className="theme-option"
          data-mode={value}
          aria-pressed={mode === value}
          onClick={() => choose(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
