import type { SetupState } from "./types";
import { defaultSetup, ensureSetup } from "./defaults";

export interface SerializedState {
  a: SetupState;
  b: SetupState;
  compare: boolean;
}

const STORAGE_KEY = "8hp-swap-calculator-v1";

export function encodeState(s: SerializedState): string {
  return btoa(JSON.stringify(s));
}

export function decodeState(encoded: string): SerializedState | null {
  try {
    return JSON.parse(atob(encoded)) as SerializedState;
  } catch {
    return null;
  }
}

export function stateToSearchParams(s: SerializedState): string {
  return `?s=${encodeURIComponent(encodeState(s))}`;
}

function migrateSerializedState(s: SerializedState): SerializedState {
  return {
    a: ensureSetup(s.a),
    b: ensureSetup(s.b),
    compare: Boolean(s.compare),
  };
}

export function loadFromUrl(): SerializedState | null {
  const q = new URLSearchParams(window.location.search).get("s");
  if (!q) return null;
  const d = decodeState(decodeURIComponent(q));
  if (!d) return null;
  return migrateSerializedState(d);
}

export function saveLocal(s: SerializedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadLocal(): SerializedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SerializedState;
    return migrateSerializedState(parsed);
  } catch {
    return null;
  }
}

export function defaultSerialized(): SerializedState {
  return {
    a: defaultSetup(),
    b: defaultSetup(),
    compare: false,
  };
}
