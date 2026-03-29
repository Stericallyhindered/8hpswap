import type { GearRatios, TransmissionPreset } from "./types";

/** Reference ratios — OEM calibrations vary; verify for your hardware. */
const presets: TransmissionPreset[] = [
  {
    id: "8hp45",
    slug: "8hp45",
    name: "8HP45",
    ratios: {
      g1: 4.714,
      g2: 3.143,
      g3: 2.106,
      g4: 1.667,
      g5: 1.285,
      g6: 1.0,
      g7: 0.839,
      g8: 0.667,
      reverse: 3.295,
    },
    notes: "Common in lighter RWD applications; verify calibration.",
    examples: "Various ZF8HP RWD",
  },
  {
    id: "8hp50",
    slug: "8hp50",
    name: "8HP50",
    ratios: {
      g1: 4.5,
      g2: 3.0,
      g3: 2.0,
      g4: 1.6,
      g5: 1.25,
      g6: 1.0,
      g7: 0.85,
      g8: 0.68,
      reverse: 3.2,
    },
    notes: "Reference set; OEM ratios can differ.",
    examples: "Some diesel / truck calibrations",
  },
  {
    id: "8hp51",
    slug: "8hp51",
    name: "8HP51",
    ratios: {
      g1: 4.71,
      g2: 3.14,
      g3: 2.11,
      g4: 1.67,
      g5: 1.29,
      g6: 1.0,
      g7: 0.84,
      g8: 0.67,
      reverse: 3.3,
    },
    notes: "Reference set; verify against your TCU file.",
    examples: "Various swaps",
  },
  {
    id: "8hp70",
    slug: "8hp70",
    name: "8HP70",
    ratios: {
      g1: 4.714,
      g2: 3.143,
      g3: 2.106,
      g4: 1.667,
      g5: 1.285,
      g6: 1.0,
      g7: 0.839,
      g8: 0.667,
      reverse: 3.295,
    },
    notes: "Widely used BMW-style stack (reference).",
    examples: "BMW N55/N63 and similar",
  },
  {
    id: "8hp75",
    slug: "8hp75",
    name: "8HP75",
    ratios: {
      g1: 4.71,
      g2: 3.14,
      g3: 2.11,
      g4: 1.67,
      g5: 1.29,
      g6: 1.0,
      g7: 0.84,
      g8: 0.67,
      reverse: 3.3,
    },
    notes: "Heavy-duty truck variant (reference).",
    examples: "RAM et al. (verify)",
  },
  {
    id: "8hp76",
    slug: "8hp76",
    name: "8HP76",
    ratios: {
      g1: 4.08,
      g2: 2.94,
      g3: 2.05,
      g4: 1.61,
      g5: 1.28,
      g6: 1.0,
      g7: 0.84,
      g8: 0.67,
      reverse: 3.2,
    },
    notes: "Taller 1st reference; verify application.",
    examples: "Some truck / HD",
  },
  {
    id: "8hp90",
    slug: "8hp90",
    name: "8HP90",
    ratios: {
      g1: 6.06,
      g2: 3.08,
      g3: 2.07,
      g4: 1.65,
      g5: 1.28,
      g6: 1.0,
      g7: 0.84,
      g8: 0.67,
      reverse: 4.0,
    },
    notes: "Very short 1st (reference); HD applications.",
    examples: "Heavy trucks (verify)",
  },
  {
    id: "8hp95",
    slug: "8hp95",
    name: "8HP95",
    ratios: {
      g1: 5.5,
      g2: 3.0,
      g3: 2.0,
      g4: 1.6,
      g5: 1.25,
      g6: 1.0,
      g7: 0.85,
      g8: 0.68,
      reverse: 3.8,
    },
    notes: "Reference stack for largest units.",
    examples: "HD / specialty (verify)",
  },
];

export function getPresets(): TransmissionPreset[] {
  return presets;
}

export function getPresetById(id: string): TransmissionPreset | undefined {
  return presets.find((p) => p.id === id);
}

export const defaultCustomRatios = (): GearRatios => ({
  ...getPresetById("8hp70")!.ratios,
});
