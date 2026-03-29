import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DrivetrainResult } from "../lib/types";

type Unit = "ft" | "m";

type Props = {
  precision: number;
  resultA: DrivetrainResult;
  resultB?: DrivetrainResult;
  compare: boolean;
};

function pickDist(row: DrivetrainResult["rows"][0], unit: Unit): number {
  return unit === "m" ? row.distancePerRevM : row.distancePerRevFt;
}

export function TravelPerRevPanel({ precision: p, resultA, resultB, compare }: Props) {
  const [chartUnit, setChartUnit] = useState<Unit>("ft");
  const [showHelp, setShowHelp] = useState(false);

  const rowsA = resultA.rows;
  const rowsB = resultB?.rows;

  const shortestIdx = useMemo(() => {
    let min = Infinity;
    let idx = 0;
    rowsA.forEach((r, i) => {
      if (r.distancePerRevFt < min) {
        min = r.distancePerRevFt;
        idx = i;
      }
    });
    return idx;
  }, [rowsA]);

  const tallestIdx = useMemo(() => {
    let max = -Infinity;
    let idx = 0;
    rowsA.forEach((r, i) => {
      if (r.distancePerRevFt > max) {
        max = r.distancePerRevFt;
        idx = i;
      }
    });
    return idx;
  }, [rowsA]);

  const chartData = useMemo(() => {
    return rowsA.map((r, i) => {
      const g = typeof r.gear === "number" ? r.gear : String(r.gear);
      const base: Record<string, string | number> = {
        gear: `G${g}`,
        a: pickDist(r, chartUnit),
      };
      if (compare && rowsB && rowsB[i]) {
        base.b = pickDist(rowsB[i], chartUnit);
      }
      return base;
    });
  }, [rowsA, rowsB, compare, chartUnit]);

  const unitLabel = chartUnit === "ft" ? "ft/engine rev" : "m/engine rev";

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 p-4 shadow-xl shadow-violet-950/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/95">
              Effective travel per engine revolution
            </h2>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] font-medium text-zinc-400 hover:border-violet-500/40 hover:text-violet-200"
            >
              {showHelp ? "Hide how to read" : "How to read this graph"}
            </button>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Each bar is <strong className="text-zinc-200">how far the vehicle rolls forward</strong> for{" "}
            <strong className="text-zinc-200">one full crankshaft revolution</strong> in that gear — in{" "}
            <span className="text-violet-400/90">feet or meters per engine rev</span> (no slip). It does{" "}
            <em>not</em> show mph by itself; it shows the gearing “lever” from tire + ratios.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            <span className="font-mono text-zinc-300">
              distance/rev = tire circumference ÷ (trans gear × axle × transfer case)
            </span>
            . Same RPM in two different gears produces different mph; this chart only answers “distance per
            crank rev” per gear. Use <strong className="text-zinc-400">Gear lookup — RPM ↔ road speed</strong>{" "}
            below for mph at a chosen RPM (or RPM at a chosen mph).
          </p>
          {showHelp && (
            <ul className="mt-3 space-y-2 rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-3 text-[11px] leading-relaxed text-zinc-400">
              <li>
                <strong className="text-zinc-300">Y-axis (ft/engine rev or m/rev):</strong> If a bar lines up
                near <strong className="text-zinc-200">2</strong>, that gear moves about{" "}
                <strong className="text-zinc-200">2 ft</strong> per engine revolution (or the meter equivalent).
                Higher bar = more road per rev = taller gearing in that gear.
              </li>
              <li>
                <strong className="text-zinc-300">Why G1 → G8 usually rises:</strong> Higher gears have less
                reduction, so each crank revolution does more work at the tire — more distance per rev.
              </li>
              <li>
                <strong className="text-zinc-300">Speed link:</strong> road speed scales with{" "}
                <span className="font-mono text-violet-500/90">RPM × (distance per engine rev)</span>, then
                unit conversion (e.g. ft/min → mph). Steady-state; no converter or tire slip in these numbers.
              </li>
            </ul>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setChartUnit("ft")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              chartUnit === "ft"
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Chart: ft/rev
          </button>
          <button
            type="button"
            onClick={() => setChartUnit("m")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              chartUnit === "m"
                ? "border-violet-500/50 bg-violet-500/15 text-violet-200"
                : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Chart: m/rev
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-2 py-1 text-rose-200/90">
          Shortest travel — G{rowsA[shortestIdx]?.gear}: max torque multiplication
        </span>
        <span className="rounded-lg border border-fuchsia-500/25 bg-fuchsia-500/5 px-2 py-1 text-fuchsia-200/90">
          Longest travel — G{rowsA[tallestIdx]?.gear}: cruise efficiency (tall gear)
        </span>
      </div>

      <div className="mb-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="gear" stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 10 }}
              label={{
                value: unitLabel,
                angle: -90,
                position: "insideLeft",
                fill: "#71717a",
                fontSize: 10,
              }}
            />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
              formatter={(v: number) => [
                `${v.toFixed(chartUnit === "ft" ? 4 : 5)} ${chartUnit === "ft" ? "ft" : "m"}`,
                "",
              ]}
            />
            <Legend />
            <Bar dataKey="a" name="Setup A" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={48} />
            {compare && rowsB && (
              <Bar dataKey="b" name="Setup B" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={48} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60">
        <table className="w-full min-w-[480px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="py-2 pl-3 pr-2">Gear</th>
              <th className="py-2 pr-2">in/rev</th>
              <th className="py-2 pr-2">ft/rev</th>
              <th className="py-2 pr-2">m/rev</th>
              {compare && rowsB && (
                <>
                  <th className="py-2 pr-2 text-amber-200/80">B ft/rev</th>
                  <th className="py-2 pr-2">Δ ft</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="font-mono text-zinc-200">
            {rowsA.map((r, i) => {
              const rb = rowsB?.[i];
              const deltaFt =
                compare && rb ? r.distancePerRevFt - rb.distancePerRevFt : null;
              return (
                <tr
                  key={String(r.gear)}
                  className={`border-b border-zinc-800/50 ${
                    i === shortestIdx ? "bg-rose-500/5" : i === tallestIdx ? "bg-fuchsia-500/5" : ""
                  }`}
                >
                  <td className="py-1.5 pl-3 pr-2 font-semibold text-zinc-100">{r.gear}</td>
                  <td className="py-1.5 pr-2">{r.distancePerRevIn.toFixed(p)}</td>
                  <td className="py-1.5 pr-2 text-violet-300/90">{r.distancePerRevFt.toFixed(p)}</td>
                  <td className="py-1.5 pr-2">{r.distancePerRevM.toFixed(Math.min(4, p + 2))}</td>
                  {compare && rb && (
                    <>
                      <td className="py-1.5 pr-2 text-amber-200/90">
                        {rb.distancePerRevFt.toFixed(p)}
                      </td>
                      <td className="py-1.5 pr-2 text-zinc-400">
                        {deltaFt !== null
                          ? `${deltaFt >= 0 ? "+" : ""}${deltaFt.toFixed(p)}`
                          : "—"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
        Assumes no torque converter slip, no tire slip, steady-state. Real-world values vary slightly.
      </p>
    </div>
  );
}
