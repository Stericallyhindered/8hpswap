import type { SetupState } from "./types";
import {
  computeDrivetrain,
  getActiveRatios,
  getTransferCaseMultiplier,
  mphFromRpm,
  rpmFromMph,
} from "./drivetrain";
import { resolveTireDiameterIn } from "./tire";

const FORWARD = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"] as const;

export function rpmSpeedSeries(setup: SetupState, steps = 40) {
  const { revsPerMile } = resolveTireDiameterIn(setup.tire);
  const ratios = getActiveRatios(setup);
  const fd = setup.finalDrive;
  const tc = getTransferCaseMultiplier(setup);
  const redline = setup.rpm.redline;

  return FORWARD.map((key, i) => {
    const tr = ratios[key];
    const total = tr * fd * tc;
    const pts: { rpm: number; mph: number }[] = [];
    for (let s = 0; s <= steps; s++) {
      const rpm = (redline * s) / steps;
      pts.push({ rpm, mph: mphFromRpm(rpm, total, revsPerMile) });
    }
    return { gear: i + 1, points: pts };
  });
}

export function speedRpmSeries(setup: SetupState, maxMph = 180, steps = 45) {
  const { revsPerMile } = resolveTireDiameterIn(setup.tire);
  const ratios = getActiveRatios(setup);
  const fd = setup.finalDrive;
  const tc = getTransferCaseMultiplier(setup);

  return FORWARD.map((key, i) => {
    const tr = ratios[key];
    const total = tr * fd * tc;
    const pts: { mph: number; rpm: number }[] = [];
    for (let s = 0; s <= steps; s++) {
      const mph = (maxMph * s) / steps;
      pts.push({ mph, rpm: rpmFromMph(mph, total, revsPerMile) });
    }
    return { gear: i + 1, points: pts };
  });
}

export function highwaySeries(setup: SetupState) {
  const { revsPerMile } = resolveTireDiameterIn(setup.tire);
  const ratios = getActiveRatios(setup);
  const fd = setup.finalDrive;
  const tc = getTransferCaseMultiplier(setup);
  const keys = ["g6", "g7", "g8"] as const;
  const labels = [6, 7, 8];
  const mphPts = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

  return keys.map((key, j) => {
    const tr = ratios[key];
    const total = tr * fd * tc;
    const points = mphPts.map((mph) => ({
      mph,
      rpm: rpmFromMph(mph, total, revsPerMile),
    }));
    return { gear: labels[j], points };
  });
}

export function compareRpmAtSpeed(setupA: SetupState, setupB: SetupState, speeds: number[]) {
  const da = computeDrivetrain(setupA);
  const db = computeDrivetrain(setupB);
  return speeds.map((mph) => ({
    mph,
    rpmA: rpmFromMph(mph, da.eighthOverall, da.revsPerMile),
    rpmB: rpmFromMph(mph, db.eighthOverall, db.revsPerMile),
  }));
}
