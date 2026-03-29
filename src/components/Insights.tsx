import type { DrivetrainResult } from "../lib/types";
import type { SetupState } from "../lib/types";
import { getPresetById } from "../lib/zf8hpPresets";

function tagForSpread(spread: number): string {
  if (spread > 7.5) return "Wide ratio spread";
  if (spread < 5.5) return "Tight ratio spread";
  return "Balanced spread";
}

function tagFirst(firstOverall: number): string {
  if (firstOverall > 45) return "Very short 1st — aggressive launch feel";
  if (firstOverall < 25) return "Tall 1st — mild launch";
  return "Moderate 1st gear multiplication";
}

type Props = {
  setup: SetupState;
  result: DrivetrainResult;
  compare?: { setup: SetupState; result: DrivetrainResult } | null;
};

export function Insights({ setup, result, compare }: Props) {
  const preset = getPresetById(setup.presetId);
  const cruise80 = result.cruiseRpmAt80;

  const tcNote =
    setup.transferCase.enabled && result.transferCaseMultiplier > 1
      ? `Transfer case ×${result.transferCaseMultiplier.toFixed(2)} applied to overall ratio.`
      : null;

  const lines: string[] = [
    `${preset?.name ?? "Custom"} · final drive ${setup.finalDrive.toFixed(2)} · tire ${result.tireDiameterIn.toFixed(1)} in`,
    ...(tcNote ? [tcNote] : []),
    `8th gear at 80 ${setup.speedUnit === "mph" ? "mph" : "km/h"}: ~${cruise80.toFixed(0)} RPM engine speed.`,
    tagForSpread(result.ratioSpread),
    tagFirst(result.firstOverall),
  ];

  if (compare) {
    const a = result.cruiseRpmAt80;
    const b = compare.result.cruiseRpmAt80;
    if (b > 0) {
      const pct = ((a - b) / b) * 100;
      lines.push(
        `vs setup B: ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% cruise RPM @ 80 (8th).`
      );
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-4 shadow-inner">
      <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-violet-400/90">
        Insights
      </h3>
      <ul className="space-y-1.5 text-sm leading-relaxed text-zinc-300">
        {lines.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/80" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-zinc-600">
        Speeds at redline are theoretical (no slip). Verify ZF ratios for your TCU / hardware.
      </p>
    </div>
  );
}
