import { create } from "zustand";
import type { GearRatios, SetupState } from "../lib/types";
import { defaultSerialized, loadLocal, loadFromUrl, type SerializedState } from "../lib/serialize";
import { getPresetById, defaultCustomRatios } from "../lib/zf8hpPresets";

export interface CalculatorStore {
  setupA: SetupState;
  setupB: SetupState;
  compare: boolean;
  hydrated: boolean;

  setSetupA: (p: Partial<SetupState> | ((s: SetupState) => SetupState)) => void;
  setSetupB: (p: Partial<SetupState> | ((s: SetupState) => SetupState)) => void;
  setCompare: (v: boolean) => void;
  patchSetupARatios: (p: Partial<GearRatios>) => void;
  patchSetupBRatios: (p: Partial<GearRatios>) => void;
  hydrate: (s: SerializedState) => void;
  reset: () => void;
  markHydrated: () => void;
}

function applyPartial(
  current: SetupState,
  p: Partial<SetupState> | ((s: SetupState) => SetupState)
): SetupState {
  return typeof p === "function" ? p(current) : { ...current, ...p };
}

function initialSerialized(): SerializedState {
  if (typeof window === "undefined") return defaultSerialized();
  return loadFromUrl() ?? loadLocal() ?? defaultSerialized();
}

const initial = initialSerialized();

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  setupA: initial.a,
  setupB: initial.b,
  compare: initial.compare,
  hydrated: true,

  setSetupA: (p) => set({ setupA: applyPartial(get().setupA, p) }),
  setSetupB: (p) => set({ setupB: applyPartial(get().setupB, p) }),
  setCompare: (v) => set({ compare: v }),

  patchSetupARatios: (p) => {
    const s = get().setupA;
    const base = s.customRatios ?? getPresetById(s.presetId)?.ratios ?? defaultCustomRatios();
    set({ setupA: { ...s, customRatios: { ...base, ...p } } });
  },

  patchSetupBRatios: (p) => {
    const s = get().setupB;
    const base = s.customRatios ?? getPresetById(s.presetId)?.ratios ?? defaultCustomRatios();
    set({ setupB: { ...s, customRatios: { ...base, ...p } } });
  },

  hydrate: (loaded) =>
    set({
      setupA: loaded.a,
      setupB: loaded.b,
      compare: loaded.compare,
    }),

  reset: () => {
    const d = defaultSerialized();
    set({
      setupA: d.a,
      setupB: d.b,
      compare: d.compare,
      hydrated: true,
    });
  },

  markHydrated: () => set({ hydrated: true }),
}));

export function getSerializedSnapshot(): SerializedState {
  const z = useCalculatorStore.getState();
  return {
    a: z.setupA,
    b: z.setupB,
    compare: z.compare,
  };
}
