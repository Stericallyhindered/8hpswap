import type { DrivetrainResult, GearCalcRow, GearRatios, SetupState } from "./types";
import { circumferenceInches, resolveTireDiameterIn } from "./tire";
import { getPresetById } from "./zf8hpPresets";

const FORWARD_KEYS: (keyof GearRatios)[] = [
  "g1",
  "g2",
  "g3",
  "g4",
  "g5",
  "g6",
  "g7",
  "g8",
];

export function getActiveRatios(setup: SetupState): GearRatios {
  if (setup.customRatios) return setup.customRatios;
  const p = getPresetById(setup.presetId);
  return p?.ratios ?? getPresetById("8hp70")!.ratios;
}

/** Transfer case reduction applied to engine→axle (1.0 when disabled or invalid). */
export function getTransferCaseMultiplier(setup: SetupState): number {
  const tc = setup.transferCase;
  if (!tc?.enabled) return 1;
  const r = tc.ratio;
  if (!Number.isFinite(r) || r <= 0) return 1;
  return r;
}

/** mph from engine RPM, total ratio, revs/mile */
export function mphFromRpm(rpm: number, totalRatio: number, revsPerMile: number): number {
  if (totalRatio <= 0 || revsPerMile <= 0) return 0;
  return (rpm * 60) / (totalRatio * revsPerMile);
}

export function kphFromMph(mph: number): number {
  return mph * 1.609344;
}

export function mphFromKph(kph: number): number {
  return kph / 1.609344;
}

/** engine RPM from road speed (mph) */
export function rpmFromMph(mph: number, totalRatio: number, revsPerMile: number): number {
  if (totalRatio <= 0 || revsPerMile <= 0) return 0;
  return (mph * totalRatio * revsPerMile) / 60;
}

export function displaySpeed(mph: number, unit: SetupState["speedUnit"]): number {
  return unit === "kph" ? kphFromMph(mph) : mph;
}

export function computeDrivetrain(setup: SetupState): DrivetrainResult {
  const ratios = getActiveRatios(setup);
  const { diameterIn, revsPerMile } = resolveTireDiameterIn(setup.tire);
  const circ = circumferenceInches(diameterIn);
  const fd = setup.finalDrive;
  const tc = getTransferCaseMultiplier(setup);

  const transForward = FORWARD_KEYS.map((k) => ratios[k]);
  const ratioSpread = transForward[0] / transForward[7];

  const rows: GearCalcRow[] = transForward.map((tr, i) => {
    const overall = tr * fd * tc;
    const distIn = circ / overall;
    return {
      gear: i + 1,
      transRatio: tr,
      overall,
      distancePerRevIn: distIn,
      distancePerRevFt: distIn / 12,
      distancePerRevM: distIn * 0.0254,
    };
  });

  const firstOverall = transForward[0] * fd * tc;
  const eighthOverall = transForward[7] * fd * tc;

  const cruiseRpmAt70 = rpmFromMph(70, eighthOverall, revsPerMile);
  const cruiseRpmAt80 = rpmFromMph(80, eighthOverall, revsPerMile);

  const redline = setup.rpm.redline;
  const redlineSpeedFirstMph = mphFromRpm(redline, firstOverall, revsPerMile);
  const redlineSpeedEighthMph = mphFromRpm(redline, eighthOverall, revsPerMile);

  /** RPM in lower gear before upshift (user may set 6500 vs 9000 independently of chart redline). */
  const shiftRef =
    setup.shiftReferenceRpm > 0 ? setup.shiftReferenceRpm : redline;

  /** Upshift at same road speed: engine RPM scales by (new overall / old overall). */
  const shiftDrops: { from: number; to: number; pctDrop: number; rpmAfter: number }[] = [];
  for (let i = 0; i < transForward.length - 1; i++) {
    const rFrom = transForward[i] * fd * tc;
    const rTo = transForward[i + 1] * fd * tc;
    const rpmAfter = (shiftRef * rTo) / rFrom;
    const pctDrop = shiftRef > 0 ? ((shiftRef - rpmAfter) / shiftRef) * 100 : 0;
    shiftDrops.push({ from: i + 1, to: i + 2, pctDrop, rpmAfter });
  }

  return {
    tireDiameterIn: diameterIn,
    circumferenceIn: circ,
    revsPerMile,
    ratioSpread,
    transferCaseMultiplier: tc,
    rows,
    firstOverall,
    eighthOverall,
    cruiseRpmAt70,
    cruiseRpmAt80,
    redlineSpeedFirstMph,
    redlineSpeedEighthMph,
    shiftDrops,
  };
}

export function reverseRow(setup: SetupState): GearCalcRow {
  const ratios = getActiveRatios(setup);
  const tr = ratios.reverse;
  const tc = getTransferCaseMultiplier(setup);
  const overall = tr * setup.finalDrive * tc;
  const { diameterIn } = resolveTireDiameterIn(setup.tire);
  const circ = circumferenceInches(diameterIn);
  const distIn = circ / overall;
  return {
    gear: "R",
    transRatio: tr,
    overall,
    distancePerRevIn: distIn,
    distancePerRevFt: distIn / 12,
    distancePerRevM: distIn * 0.0254,
  };
}
