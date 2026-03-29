import type { SetupState } from "./types";

export const defaultSetup = (): SetupState => ({
  presetId: "8hp70",
  customRatios: null,
  finalDrive: 3.55,
  transferCase: { enabled: false, ratio: 2.72 },
  tire: {
    mode: "diameter_in",
    diameterIn: 31.5,
    widthMm: 315,
    aspect: 70,
    rimIn: 17,
    revsPerMile: 660,
  },
  rpm: { idle: 700, cruise: 2200, redline: 6500 },
  shiftReferenceRpm: 6500,
  speedUnit: "mph",
  precision: 2,
  showReverse: false,
});

/** Merge partial saved state with current defaults (new fields, old localStorage). */
export function ensureSetup(setup: Partial<SetupState> | undefined): SetupState {
  const d = defaultSetup();
  if (!setup) return d;
  const rpm = { ...d.rpm, ...setup.rpm };
  return {
    ...d,
    ...setup,
    transferCase: { ...d.transferCase, ...setup.transferCase },
    tire: { ...d.tire, ...setup.tire },
    rpm,
    shiftReferenceRpm: setup.shiftReferenceRpm ?? rpm.redline ?? d.shiftReferenceRpm,
  };
}
