import { useMemo, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SetupState } from "../lib/types";
import { computeDrivetrain, displaySpeed, mphFromRpm } from "../lib/drivetrain";
import { mergedMphRpm, mergedRpmMph } from "../lib/chartMerge";
import { highwaySeries } from "../lib/chartData";
import { compareRpmAtSpeed } from "../lib/chartData";

const GEAR_COLORS = [
  "#4c1d95",
  "#5b21b6",
  "#6d28d9",
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#e9d5ff",
];

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-3 shadow-xl">
      <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {title}
      </h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

type Props = {
  primary: SetupState;
  secondary?: SetupState | null;
  compare: boolean;
};

export function ChartsSection({ primary, secondary, compare }: Props) {
  const redline = primary.rpm.redline;
  const dA = useMemo(() => computeDrivetrain(primary), [primary]);

  const rpmMphA = useMemo(() => mergedRpmMph(primary), [primary]);
  const mphRpmA = useMemo(() => mergedMphRpm(primary), [primary]);

  const compareLine = useMemo(() => {
    const b = secondary ?? primary;
    return compareRpmAtSpeed(primary, b, [50, 60, 70, 80, 90, 100]);
  }, [primary, secondary]);

  const barOverall = useMemo(
    () =>
      dA.rows.map((r, i) => ({
        name: `${i + 1}`,
        overall: r.overall,
      })),
    [dA.rows]
  );

  const barRedline = useMemo(
    () =>
      dA.rows.map((r, i) => ({
        name: `${i + 1}`,
        mph: displaySpeed(mphFromRpm(primary.rpm.redline, r.overall, dA.revsPerMile), primary.speedUnit),
      })),
    [dA.rows, dA.revsPerMile, primary]
  );

  const highwayMerged = useMemo(() => {
    const h = highwaySeries(primary);
    if (!h[0]) return [];
    return h[0].points.map((pt, i) => ({
      mph: pt.mph,
      g6: h[0].points[i]?.rpm ?? 0,
      g7: h[1].points[i]?.rpm ?? 0,
      g8: h[2].points[i]?.rpm ?? 0,
    }));
  }, [primary]);

  const shiftData = useMemo(
    () =>
      dA.shiftDrops.map((s) => ({
        name: `${s.from}→${s.to}`,
        pct: Math.round(s.pctDrop * 10) / 10,
      })),
    [dA.shiftDrops]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Road speed vs RPM (by gear)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rpmMphA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="rpm" stroke="#71717a" tick={{ fontSize: 10 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
              labelStyle={{ color: "#e4e4e7" }}
            />
            <Legend />
            {Array.from({ length: 8 }, (_, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`g${i + 1}`}
                stroke={GEAR_COLORS[i]}
                dot={false}
                strokeWidth={1.5}
                name={`${i + 1}`}
              />
            ))}
            <ReferenceLine x={redline} stroke="#ef4444" strokeDasharray="4 4" label="RL" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="RPM vs road speed (by gear)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mphRpmA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="mph" stroke="#71717a" tick={{ fontSize: 10 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }}
            />
            <Legend />
            {Array.from({ length: 8 }, (_, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`g${i + 1}`}
                stroke={GEAR_COLORS[i]}
                dot={false}
                strokeWidth={1.5}
                name={`${i + 1}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Highway — 6 / 7 / 8 (RPM vs mph)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={highwayMerged}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="mph" stroke="#71717a" tick={{ fontSize: 10 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
            <Legend />
            <Line type="monotone" dataKey="g6" name="6" stroke={GEAR_COLORS[5]} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="g7" name="7" stroke={GEAR_COLORS[6]} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="g8" name="8" stroke={GEAR_COLORS[7]} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Effective overall ratio (trans × axle)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barOverall}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
            <Bar dataKey="overall" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={`Upshift RPM drop (ref ${primary.shiftReferenceRpm.toFixed(0)} RPM in lower gear)`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shiftData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 9 }} />
            <YAxis stroke="#71717a" />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
            <Bar dataKey="pct" fill="#a78bfa" name="%" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={`Redline speed by gear (${primary.speedUnit})`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barRedline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
            <Bar dataKey="mph" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {compare && secondary && (
        <ChartCard title="Compare — 8th gear RPM @ speed">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={compareLine}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mph" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
              <Legend />
              <Line type="monotone" dataKey="rpmA" name="Setup A" stroke="#a78bfa" strokeWidth={2} dot />
              <Line type="monotone" dataKey="rpmB" name="Setup B" stroke="#fbbf24" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
