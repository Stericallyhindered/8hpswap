import { rpmSpeedSeries, speedRpmSeries } from "./chartData";
import type { SetupState } from "./types";

export function mergedRpmMph(setup: SetupState) {
  const series = rpmSpeedSeries(setup);
  const maxLen = series[0]?.points.length ?? 0;
  const rows: Record<string, number>[] = [];
  for (let i = 0; i < maxLen; i++) {
    const row: Record<string, number> = { rpm: series[0].points[i].rpm };
    for (const s of series) {
      row[`g${s.gear}`] = s.points[i].mph;
    }
    rows.push(row);
  }
  return rows;
}

export function mergedMphRpm(setup: SetupState) {
  const series = speedRpmSeries(setup);
  const maxLen = series[0]?.points.length ?? 0;
  const rows: Record<string, number>[] = [];
  for (let i = 0; i < maxLen; i++) {
    const row: Record<string, number> = { mph: series[0].points[i].mph };
    for (const s of series) {
      row[`g${s.gear}`] = s.points[i].rpm;
    }
    rows.push(row);
  }
  return rows;
}
