import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DrivetrainResult } from "../lib/types";
import type { SetupState } from "../lib/types";
import { kphFromMph, mphFromKph, mphFromRpm, rpmFromMph } from "../lib/drivetrain";

type Props = {
  setup: SetupState;
  result: DrivetrainResult;
  setupB?: SetupState;
  resultB?: DrivetrainResult;
  compare: boolean;
};

const SPEED_PRESETS_MPH = [45, 55, 60, 65, 70, 75, 80, 85, 90, 100] as const;
const RPM_PRESETS = [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6500] as const;

const GEAR_BAR = ["#4c1d95", "#5b21b6", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function displayToMph(value: number, unit: SetupState["speedUnit"]): number {
  return unit === "kph" ? mphFromKph(value) : value;
}

function mphToDisplay(mph: number, unit: SetupState["speedUnit"]): number {
  return unit === "kph" ? kphFromMph(mph) : mph;
}

function FancyTooltip({
  active,
  payload,
  label,
  valueSuffix,
  decimals = 2,
}: {
  active?: boolean;
  payload?: Array<{ name?: unknown; value?: unknown; color?: string; dataKey?: unknown }>;
  label?: string;
  valueSuffix: string;
  decimals?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-600/80 bg-zinc-900/95 px-3 py-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={String(p.dataKey ?? p.name)}
          className="flex items-center justify-between gap-6 font-mono text-sm"
        >
          <span style={{ color: p.color }}>{p.name != null ? String(p.name) : ""}</span>
          <span className="tabular-nums text-zinc-100">
            {typeof p.value === "number"
              ? p.value.toFixed(decimals)
              : typeof p.value === "string"
                ? p.value
                : String(p.value ?? "")}{" "}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black/40 p-4 shadow-[0_0_40px_-12px_rgba(124,58,237,0.22)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-purple-900/20 blur-2xl" />
      <div className="relative">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-400/95">
          {title}
        </h3>
        <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">{subtitle}</p>
        <div className="mt-3 h-[280px] w-full">{children}</div>
      </div>
    </div>
  );
}

export function GearRpmMphExplorer({ setup, result, setupB, resultB, compare }: Props) {
  const uid = useId().replace(/:/g, "");
  const grad = {
    speedA: `lk-spA-${uid}`,
    speedB: `lk-spB-${uid}`,
    rpmA: `lk-rpA-${uid}`,
    rpmB: `lk-rpB-${uid}`,
  };

  const p = setup.precision;
  const su = setup.speedUnit;
  const spdLabel = su === "mph" ? "mph" : "km/h";

  const [refRpm, setRefRpm] = useState(String(setup.rpm.cruise));
  const [refSpeedDisplay, setRefSpeedDisplay] = useState<number>(() =>
    su === "mph" ? 70 : Math.round(kphFromMph(70))
  );

  const rpmVal = Math.max(0, num(refRpm));
  const speedMph = Math.max(0, displayToMph(refSpeedDisplay, su));

  const atRpmRows = useMemo(() => {
    return result.rows.map((row) => {
      const mph = mphFromRpm(rpmVal, row.overall, result.revsPerMile);
      return {
        gear: row.gear,
        label: `G${row.gear}`,
        mph,
        display: mphToDisplay(mph, su),
      };
    });
  }, [result.rows, result.revsPerMile, rpmVal, su]);

  const atSpeedRows = useMemo(() => {
    return result.rows.map((row) => {
      const rpm = rpmFromMph(speedMph, row.overall, result.revsPerMile);
      return { gear: row.gear, label: `G${row.gear}`, rpm };
    });
  }, [result.rows, result.revsPerMile, speedMph]);

  const atRpmRowsB = useMemo(() => {
    if (!compare || !resultB) return null;
    return resultB.rows.map((row) => {
      const mph = mphFromRpm(rpmVal, row.overall, resultB.revsPerMile);
      return {
        gear: row.gear,
        label: `G${row.gear}`,
        display: mphToDisplay(mph, setupB!.speedUnit),
      };
    });
  }, [compare, resultB, rpmVal, setupB]);

  const atSpeedRowsB = useMemo(() => {
    if (!compare || !resultB) return null;
    return resultB.rows.map((row) => ({
      gear: row.gear,
      label: `G${row.gear}`,
      rpm: rpmFromMph(speedMph, row.overall, resultB.revsPerMile),
    }));
  }, [compare, resultB, speedMph]);

  const chartSpeedAtRpm = useMemo(() => {
    return atRpmRows.map((row, i) => ({
      name: row.label,
      gear: row.label,
      A: row.display,
      ...(compare && atRpmRowsB ? { B: atRpmRowsB[i]?.display ?? 0 } : {}),
    }));
  }, [atRpmRows, atRpmRowsB, compare]);

  const chartRpmAtSpeed = useMemo(() => {
    return atSpeedRows.map((row, i) => ({
      name: row.label,
      gear: row.label,
      A: row.rpm,
      ...(compare && atSpeedRowsB ? { B: atSpeedRowsB[i]?.rpm ?? 0 } : {}),
    }));
  }, [atSpeedRows, atSpeedRowsB, compare]);

  const bSpdLabel = setupB?.speedUnit === "mph" ? "mph" : "km/h";

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black/50 p-4 shadow-xl">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/95">
        Gear lookup — RPM ↔ road speed
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
        Classic “road speed at RPM” / “RPM at road speed” views as live charts. Adjust the reference RPM or
        speed — bars update instantly. Same tire, axle, and TC as your setup. Steady-state, no slip.
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        {/* Speed at RPM */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[160px] flex-1">
              <span className="text-[11px] font-medium text-zinc-500">Engine RPM (same in every gear)</span>
              <input
                type="number"
                min={0}
                step={50}
                value={refRpm}
                onChange={(e) => setRefRpm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 shadow-inner"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-1">
            {RPM_PRESETS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRefRpm(String(r))}
                className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] transition ${
                  num(refRpm) === r
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_12px_-4px_rgba(124,58,237,0.35)]"
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <ChartShell
            title="Road speed by gear"
            subtitle={`At ${rpmVal.toFixed(0)} RPM crank speed — theoretical ${spdLabel} in each forward gear.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSpeedAtRpm} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} barGap={4}>
                <defs>
                  <linearGradient id={grad.speedA} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#5b21b6" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id={grad.speedB} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="gear" stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  label={{
                    value: spdLabel,
                    angle: -90,
                    position: "insideLeft",
                    fill: "#71717a",
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <FancyTooltip
                      active={active}
                      payload={payload}
                      label={label}
                      valueSuffix={spdLabel}
                      decimals={Math.min(3, Math.max(0, p))}
                    />
                  )}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="A"
                  name="Setup A"
                  fill={`url(#${grad.speedA})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                >
                  {!compare &&
                    chartSpeedAtRpm.map((_, i) => (
                      <Cell key={i} fill={GEAR_BAR[i % GEAR_BAR.length]} opacity={0.92} />
                    ))}
                </Bar>
                {compare && (
                  <Bar
                    dataKey="B"
                    name="Setup B"
                    fill={`url(#${grad.speedB})`}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </ChartShell>

          <div className="overflow-x-auto rounded-xl border border-zinc-800/60 bg-zinc-950/40">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-1.5 pl-2">Gear</th>
                  <th className="py-1.5">A ({spdLabel})</th>
                  {compare && atRpmRowsB && <th className="py-1.5 text-amber-200/80">B ({bSpdLabel})</th>}
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-300">
                {atRpmRows.map((row, i) => (
                  <tr key={String(row.gear)} className="border-b border-zinc-800/40">
                    <td className="py-1 pl-2">{row.gear}</td>
                    <td className="py-1 text-violet-300/90">{row.display.toFixed(p)}</td>
                    {compare && atRpmRowsB && (
                      <td className="py-1 text-amber-200/70">
                        {atRpmRowsB[i]?.display.toFixed(setupB!.precision)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RPM at speed */}
        <div className="space-y-4">
          <label>
            <span className="text-[11px] font-medium text-zinc-500">
              Road speed ({spdLabel}) — same speed in every gear column
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={refSpeedDisplay}
              onChange={(e) => setRefSpeedDisplay(num(e.target.value))}
              className="mt-1 w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm shadow-inner"
            />
          </label>
          <div className="flex flex-wrap gap-1">
            {(su === "mph"
              ? [...SPEED_PRESETS_MPH]
              : SPEED_PRESETS_MPH.map((m) => Math.round(kphFromMph(m)))
            ).map((v, idx) => (
              <button
                key={`${su}-${idx}-${v}`}
                type="button"
                onClick={() => setRefSpeedDisplay(v)}
                className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] transition ${
                  Math.abs(refSpeedDisplay - v) < 0.5
                    ? "border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_12px_-4px_rgba(124,58,237,0.35)]"
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <ChartShell
            title="Engine RPM by gear"
            subtitle={`At ${mphToDisplay(speedMph, su).toFixed(0)} ${spdLabel} — RPM needed in each gear (theoretical).`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRpmAtSpeed} margin={{ top: 8, right: 8, left: 4, bottom: 4 }} barGap={4}>
                <defs>
                  <linearGradient id={grad.rpmA} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.88} />
                  </linearGradient>
                  <linearGradient id={grad.rpmB} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0.88} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="gear" stroke="#71717a" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  label={{ value: "RPM", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <FancyTooltip
                      active={active}
                      payload={payload}
                      label={label}
                      valueSuffix="RPM"
                      decimals={0}
                    />
                  )}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="A"
                  name="Setup A"
                  fill={`url(#${grad.rpmA})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                >
                  {!compare &&
                    chartRpmAtSpeed.map((_, i) => (
                      <Cell key={i} fill={GEAR_BAR[i % GEAR_BAR.length]} opacity={0.92} />
                    ))}
                </Bar>
                {compare && (
                  <Bar
                    dataKey="B"
                    name="Setup B"
                    fill={`url(#${grad.rpmB})`}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </ChartShell>

          <div className="overflow-x-auto rounded-xl border border-zinc-800/60 bg-zinc-950/40">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-1.5 pl-2">Gear</th>
                  <th className="py-1.5">A RPM</th>
                  {compare && atSpeedRowsB && <th className="py-1.5 text-amber-200/80">B RPM</th>}
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-300">
                {atSpeedRows.map((row, i) => (
                  <tr key={String(row.gear)} className="border-b border-zinc-800/40">
                    <td className="py-1 pl-2">{row.gear}</td>
                    <td className="py-1 text-violet-300/90">{row.rpm.toFixed(0)}</td>
                    {compare && atSpeedRowsB && (
                      <td className="py-1 text-amber-200/70">{atSpeedRowsB[i]?.rpm.toFixed(0)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
