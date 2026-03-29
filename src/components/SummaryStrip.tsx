import type { DrivetrainResult } from "../lib/types";
import type { SetupState } from "../lib/types";
import { displaySpeed } from "../lib/drivetrain";

function fmt(n: number, p: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(p);
}

function Card({
  title,
  value,
  sub,
  highlight,
}: {
  title: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 shadow-lg ${
        highlight
          ? "border-violet-500/40 bg-violet-500/5 shadow-glowSm"
          : "border-zinc-800/90 bg-zinc-900/50"
      }`}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{title}</div>
      <div className="font-mono text-lg font-semibold tabular-nums text-zinc-50">{value}</div>
      {sub && <div className="text-[10px] text-zinc-500">{sub}</div>}
    </div>
  );
}

type Props = {
  label: string;
  accent: "violet" | "slate";
  setup: SetupState;
  result: DrivetrainResult;
  deltaPct?: { cruise80?: number };
};

export function SummaryStrip({ label, accent, setup, result, deltaPct }: Props) {
  const p = setup.precision;
  const su = setup.speedUnit;
  const spd = (mph: number) => fmt(displaySpeed(mph, setup.speedUnit), p);

  return (
    <div className="space-y-2">
      <div
        className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${
          accent === "violet" ? "text-violet-400/90" : "text-zinc-500"
        }`}
      >
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card
          title="1st overall (engine→wheels)"
          value={fmt(result.firstOverall, 2)}
          sub={
            result.transferCaseMultiplier > 1 && setup.transferCase.enabled
              ? `trans × ${setup.finalDrive.toFixed(2)} axle × ${result.transferCaseMultiplier.toFixed(2)} TC`
              : `trans × ${setup.finalDrive.toFixed(2)} axle`
          }
        />
        <Card
          title="8th cruise @ 70"
          value={`${fmt(result.cruiseRpmAt70, 0)} RPM`}
        />
        <Card
          title="8th cruise @ 80"
          value={`${fmt(result.cruiseRpmAt80, 0)} RPM`}
          sub={
            deltaPct?.cruise80 !== undefined
              ? `Δ ${deltaPct.cruise80 >= 0 ? "+" : ""}${deltaPct.cruise80.toFixed(1)}% vs B`
              : undefined
          }
          highlight={!!deltaPct?.cruise80}
        />
        <Card title="Ratio spread" value={fmt(result.ratioSpread, 2)} sub="1st / 8th trans" />
        <Card
          title={`Redline 1st (${su})`}
          value={spd(result.redlineSpeedFirstMph)}
          sub="Theoretical"
        />
        <Card
          title={`Redline 8th (${su})`}
          value={spd(result.redlineSpeedEighthMph)}
          sub="Theoretical"
        />
        <Card title="Tire Ø" value={`${fmt(result.tireDiameterIn, 2)} in`} />
        <Card title="Revs/mi" value={fmt(result.revsPerMile, 0)} />
      </div>
    </div>
  );
}
