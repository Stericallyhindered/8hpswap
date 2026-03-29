import type { TireState } from "./types";

const MM_PER_IN = 25.4;

/** Overall diameter in inches from metric tire e.g. 315/75R16 */
export function diameterFromMetric(widthMm: number, aspect: number, rimIn: number): number {
  const sidewallMm = (widthMm * aspect) / 100;
  const dMm = 2 * sidewallMm + rimIn * MM_PER_IN;
  return dMm / MM_PER_IN;
}

export function revsPerMileFromDiameter(diameterIn: number): number {
  if (diameterIn <= 0) return 0;
  return 63360 / (Math.PI * diameterIn);
}

export function circumferenceInches(diameterIn: number): number {
  return Math.PI * diameterIn;
}

export function resolveTireDiameterIn(t: TireState): {
  diameterIn: number;
  revsPerMile: number;
} {
  let diameterIn = t.diameterIn;
  let rpm = t.revsPerMile;

  if (t.mode === "metric") {
    diameterIn = diameterFromMetric(t.widthMm, t.aspect, t.rimIn);
    rpm = revsPerMileFromDiameter(diameterIn);
  } else if (t.mode === "revs_per_mile") {
    if (rpm > 0) diameterIn = 63360 / (Math.PI * rpm);
  } else {
    rpm = revsPerMileFromDiameter(diameterIn);
  }

  return { diameterIn, revsPerMile: rpm };
}
