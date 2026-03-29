import { useState } from "react";
import type { SetupState } from "../lib/types";
import { getPresets } from "../lib/zf8hpPresets";

const DIFF_PRESETS = [3.21, 3.55, 3.73, 4.1, 4.56];

/** Common transfer case reductions (high / low / aftermarket). 1 = direct. */
const TC_PRESETS = [1, 2, 2.72, 3.15, 4, 4.56] as const;

const gearFields: { key: keyof import("../lib/types").GearRatios; lbl: string }[] = [
  { key: "g1", lbl: "1st" },
  { key: "g2", lbl: "2nd" },
  { key: "g3", lbl: "3rd" },
  { key: "g4", lbl: "4th" },
  { key: "g5", lbl: "5th" },
  { key: "g6", lbl: "6th" },
  { key: "g7", lbl: "7th" },
  { key: "g8", lbl: "8th" },
  { key: "reverse", lbl: "Rev" },
];

type Props = {
  label: string;
  accent: "violet" | "amber";
  setup: SetupState;
  onChange: (p: Partial<SetupState>) => void;
  onRatioPatch: (p: Partial<import("../lib/types").GearRatios>) => void;
};

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

export function SetupColumn({ label, accent, setup, onChange, onRatioPatch }: Props) {
  const [showRatios, setShowRatios] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const presets = getPresets();
  const ring =
    accent === "violet"
      ? "ring-violet-500/30 focus:ring-violet-500/50"
      : "ring-amber-500/30 focus:ring-amber-500/50";

  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-4 shadow-xl",
        accent === "violet" ? "shadow-glowSm" : "shadow-[0_0_20px_-6px_rgba(245,158,11,0.25)]"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          className={cn(
            "font-mono text-xs font-semibold uppercase tracking-widest",
            accent === "violet" ? "text-violet-400" : "text-amber-400"
          )}
        >
          Setup {label}
        </h2>
        <button
          type="button"
          onClick={() => setShowRatios((v) => !v)}
          className="rounded-lg border border-zinc-700 bg-zinc-950/90 px-2 py-1 text-[11px] font-medium text-zinc-300 shadow-sm transition hover:border-zinc-500 hover:text-white"
        >
          {showRatios ? "Hide ratios" : "Edit ratios"}
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-zinc-500">Transmission</label>
        <select
          value={setup.presetId}
          onChange={(e) =>
            onChange({ presetId: e.target.value, customRatios: null })
          }
          className={cn(
            "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-inset",
            ring
          )}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {showRatios && (
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2">
            {gearFields.map(({ key, lbl }) => (
              <label key={key} className="text-[10px] text-zinc-500">
                {lbl}
                <input
                  type="number"
                  step="0.001"
                  value={
                    setup.customRatios?.[key] ??
                    presets.find((x) => x.id === setup.presetId)?.ratios[key] ??
                    ""
                  }
                  onChange={(e) => onRatioPatch({ [key]: num(e.target.value) } as never)}
                  className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-100"
                />
              </label>
            ))}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-zinc-500">Final drive</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {DIFF_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChange({ finalDrive: d })}
                className={cn(
                  "rounded-lg border px-2 py-1 font-mono text-xs transition",
                  Math.abs(setup.finalDrive - d) < 0.001
                    ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
                    : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <input
            type="number"
            step="0.01"
            value={setup.finalDrive}
            onChange={(e) => onChange({ finalDrive: num(e.target.value) })}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-zinc-300">
            <input
              type="checkbox"
              className="rounded border-zinc-600 bg-zinc-950"
              checked={setup.transferCase.enabled}
              onChange={(e) =>
                onChange({
                  transferCase: { ...setup.transferCase, enabled: e.target.checked },
                })
              }
            />
            Transfer case gear reduction
          </label>
          <p className="mt-1 text-[10px] leading-relaxed text-zinc-600">
            Optional: multiply overall ratio for 4×4 / off-road (high range, low range, or atlas-style
            box). Overall = trans × axle × this ratio.
          </p>
          {setup.transferCase.enabled && (
            <>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TC_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      onChange({
                        transferCase: { ...setup.transferCase, enabled: true, ratio: r },
                      })
                    }
                    className={cn(
                      "rounded-lg border px-2 py-1 font-mono text-xs transition",
                      Math.abs(setup.transferCase.ratio - r) < 0.001
                        ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                        : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500"
                    )}
                  >
                    ×{r}
                  </button>
                ))}
              </div>
              <label className="mt-2 block text-[10px] text-zinc-500">
                Custom ratio
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={setup.transferCase.ratio}
                  onChange={(e) =>
                    onChange({
                      transferCase: {
                        ...setup.transferCase,
                        ratio: Math.max(0.01, num(e.target.value)),
                      },
                    })
                  }
                  className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 font-mono text-sm"
                />
              </label>
            </>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-500">Tire input</label>
          <div className="mt-1 flex gap-1">
            {(
              [
                ["diameter_in", "Dia (in)"],
                ["metric", "Metric"],
                ["revs_per_mile", "RPMi"],
              ] as const
            ).map(([k, t]) => (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ tire: { ...setup.tire, mode: k } })}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium",
                  setup.tire.mode === k
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
                    : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {setup.tire.mode === "diameter_in" && (
            <input
              type="number"
              step="0.01"
              value={setup.tire.diameterIn}
              onChange={(e) =>
                onChange({ tire: { ...setup.tire, diameterIn: num(e.target.value) } })
              }
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm"
            />
          )}
          {setup.tire.mode === "metric" && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <input
                placeholder="315"
                type="number"
                value={setup.tire.widthMm || ""}
                onChange={(e) =>
                  onChange({ tire: { ...setup.tire, widthMm: num(e.target.value) } })
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
              />
              <input
                placeholder="70"
                type="number"
                value={setup.tire.aspect || ""}
                onChange={(e) =>
                  onChange({ tire: { ...setup.tire, aspect: num(e.target.value) } })
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
              />
              <input
                placeholder="17"
                type="number"
                value={setup.tire.rimIn || ""}
                onChange={(e) =>
                  onChange({ tire: { ...setup.tire, rimIn: num(e.target.value) } })
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
              />
            </div>
          )}
          {setup.tire.mode === "revs_per_mile" && (
            <input
              type="number"
              step="1"
              value={setup.tire.revsPerMile || ""}
              onChange={(e) =>
                onChange({ tire: { ...setup.tire, revsPerMile: num(e.target.value) } })
              }
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm"
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="text-[10px] text-zinc-500">
            Idle
            <input
              type="number"
              value={setup.rpm.idle}
              onChange={(e) =>
                onChange({ rpm: { ...setup.rpm, idle: num(e.target.value) } })
              }
              className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="text-[10px] text-zinc-500">
            Cruise ref
            <input
              type="number"
              value={setup.rpm.cruise}
              onChange={(e) =>
                onChange({ rpm: { ...setup.rpm, cruise: num(e.target.value) } })
              }
              className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
            />
          </label>
          <label className="text-[10px] text-zinc-500">
            Redline
            <input
              type="number"
              value={setup.rpm.redline}
              onChange={(e) =>
                onChange({ rpm: { ...setup.rpm, redline: num(e.target.value) } })
              }
              className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
            />
          </label>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-2">
          <label className="block text-[10px] font-medium text-zinc-400">
            Shift % reference RPM
            <span className="ml-1 font-normal text-zinc-600">
              (engine RPM in lower gear before upshift — use your rev limit or shift point)
            </span>
          </label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              step={100}
              value={setup.shiftReferenceRpm}
              onChange={(e) =>
                onChange({ shiftReferenceRpm: Math.max(1, num(e.target.value)) })
              }
              className="min-w-[100px] flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => onChange({ shiftReferenceRpm: setup.rpm.redline })}
              className="shrink-0 rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-400 hover:border-violet-500/40 hover:text-violet-200"
            >
              Match redline
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {[5500, 6500, 7000, 7500, 8000, 8500, 9000].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ shiftReferenceRpm: r })}
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                  Math.abs(setup.shiftReferenceRpm - r) < 1
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 text-left text-[11px] text-zinc-400 hover:text-zinc-200"
        >
          {advanced ? "Hide advanced" : "Advanced"}
        </button>
        {advanced && (
          <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ speedUnit: "mph" })}
                className={cn(
                  "flex-1 rounded-lg border py-1 text-xs",
                  setup.speedUnit === "mph"
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
                    : "border-zinc-700"
                )}
              >
                mph
              </button>
              <button
                type="button"
                onClick={() => onChange({ speedUnit: "kph" })}
                className={cn(
                  "flex-1 rounded-lg border py-1 text-xs",
                  setup.speedUnit === "kph"
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
                    : "border-zinc-700"
                )}
              >
                km/h
              </button>
            </div>
            <label className="text-[10px] text-zinc-500">
              Decimal places
              <input
                type="number"
                min={0}
                max={6}
                value={setup.precision}
                onChange={(e) =>
                  onChange({ precision: Math.min(6, Math.max(0, Math.round(num(e.target.value)))) })
                }
                className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-2 text-[11px] text-zinc-400">
              <input
                type="checkbox"
                checked={setup.showReverse}
                onChange={(e) => onChange({ showReverse: e.target.checked })}
              />
              Show reverse in tables
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
