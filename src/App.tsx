import { useMemo } from "react";
import { SetupColumn } from "./components/SetupColumn";
import { SummaryStrip } from "./components/SummaryStrip";
import { Insights } from "./components/Insights";
import { ChartsSection } from "./components/ChartsSection";
import { TablesSection } from "./components/TablesSection";
import { TravelPerRevPanel } from "./components/TravelPerRevPanel";
import { GearRpmMphExplorer } from "./components/GearRpmMphExplorer";
import { SyncPersistence } from "./components/SyncPersistence";
import { useCalculatorStore } from "./store/calculatorStore";
import { computeDrivetrain } from "./lib/drivetrain";
import { getPresetById } from "./lib/zf8hpPresets";

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export default function App() {
  const setupA = useCalculatorStore((s) => s.setupA);
  const setupB = useCalculatorStore((s) => s.setupB);
  const compare = useCalculatorStore((s) => s.compare);
  const setSetupA = useCalculatorStore((s) => s.setSetupA);
  const setSetupB = useCalculatorStore((s) => s.setSetupB);
  const setCompare = useCalculatorStore((s) => s.setCompare);
  const patchA = useCalculatorStore((s) => s.patchSetupARatios);
  const patchB = useCalculatorStore((s) => s.patchSetupBRatios);
  const reset = useCalculatorStore((s) => s.reset);

  const resultA = useMemo(() => computeDrivetrain(setupA), [setupA]);
  const resultB = useMemo(() => computeDrivetrain(setupB), [setupB]);

  const deltaCruise80 =
    compare && resultB.cruiseRpmAt80 > 0
      ? ((resultA.cruiseRpmAt80 - resultB.cruiseRpmAt80) / resultB.cruiseRpmAt80) * 100
      : undefined;

  const forumSummary = useMemo(() => {
    const pa = getPresetById(setupA.presetId);
    const name = pa?.name ?? "Custom";
    return [
      `8HP SWAP CALC — ${name}`,
      `Final drive: ${setupA.finalDrive}`,
      ...(setupA.transferCase.enabled && resultA.transferCaseMultiplier > 1
        ? [`Transfer case: ×${resultA.transferCaseMultiplier.toFixed(2)}`]
        : []),
      `Tire Ø: ${resultA.tireDiameterIn.toFixed(2)} in (${resultA.revsPerMile.toFixed(0)} revs/mi)`,
      `1st overall: ${resultA.firstOverall.toFixed(2)}`,
      `1st travel: ${resultA.rows[0]?.distancePerRevFt.toFixed(3)} ft/rev (${resultA.rows[0]?.distancePerRevM.toFixed(4)} m/rev)`,
      `8th @ 80 mph: ~${resultA.cruiseRpmAt80.toFixed(0)} RPM`,
      `Redline 1st (theoretical): ${resultA.redlineSpeedFirstMph.toFixed(1)} mph`,
      `Spread (trans): ${resultA.ratioSpread.toFixed(2)}`,
    ].join("\n");
  }, [setupA, resultA]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/30 via-transparent to-zinc-950" />

      <SyncPersistence />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 pb-16">
        <header className="mb-8 flex flex-col gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400/90">
              ZF8HP specialist
            </p>
            <h1 className="mt-1 bg-gradient-to-r from-zinc-100 via-white to-zinc-400 bg-clip-text font-sans text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              8HP SWAP CALCULATOR
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Drivetrain analysis: gearing, cruise RPM, redline speeds, ratio spread, travel per engine
              revolution, and RPM ↔ speed per gear — one screen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCompare(!compare)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-lg transition ${
                compare
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-100 shadow-[0_0_24px_-6px_rgba(245,158,11,0.35)]"
                  : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {compare ? "Comparing A vs B" : "Compare setup B"}
            </button>
            <button
              type="button"
              onClick={() => copyText(window.location.href)}
              className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 shadow-glowSm transition hover:bg-violet-500/20"
            >
              Copy share link
            </button>
            <button
              type="button"
              onClick={() => copyText(forumSummary)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500"
            >
              Copy summary
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Reset
            </button>
          </div>
        </header>

        <div
          className={`mb-8 grid gap-4 ${compare ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
        >
          <SetupColumn
            label="A"
            accent="violet"
            setup={setupA}
            onChange={(p) => setSetupA(p)}
            onRatioPatch={patchA}
          />
          {compare && (
            <SetupColumn
              label="B"
              accent="amber"
              setup={setupB}
              onChange={(p) => setSetupB(p)}
              onRatioPatch={patchB}
            />
          )}
        </div>

        <div className="mb-8 space-y-6">
          <SummaryStrip
            label="Setup A"
            accent="violet"
            setup={setupA}
            result={resultA}
            deltaPct={compare && deltaCruise80 !== undefined ? { cruise80: deltaCruise80 } : undefined}
          />
          {compare && (
            <SummaryStrip label="Setup B" accent="slate" setup={setupB} result={resultB} />
          )}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Insights
              setup={setupA}
              result={resultA}
              compare={
                compare ? { setup: setupB, result: resultB } : null
              }
            />
          </div>
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-500">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Reference
            </p>
            <p className="mt-2 leading-relaxed">
              Preset ratios are typical published references; TCU and variant may differ. Use{" "}
              <strong className="text-zinc-300">Edit ratios</strong> to match your file.
            </p>
            <p className="mt-3 leading-relaxed">
              State syncs to this URL and browser storage automatically for quick sharing.
            </p>
          </div>
        </div>

        <section className="mb-10">
          <TravelPerRevPanel
            precision={setupA.precision}
            resultA={resultA}
            resultB={compare ? resultB : undefined}
            compare={compare}
          />
        </section>

        <section className="mb-10">
          <GearRpmMphExplorer
            setup={setupA}
            result={resultA}
            setupB={compare ? setupB : undefined}
            resultB={compare ? resultB : undefined}
            compare={compare}
          />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Visual analysis
          </h2>
          <ChartsSection primary={setupA} secondary={compare ? setupB : null} compare={compare} />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Data tables
          </h2>
          <TablesSection setup={setupA} result={resultA} />
        </section>

        <footer className="border-t border-zinc-800/80 pt-6 text-center text-[11px] text-zinc-600">
          Educational tool — verify all ratios and tire data for your build.
        </footer>
      </div>
    </div>
  );
}
