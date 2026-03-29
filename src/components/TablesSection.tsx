import type { DrivetrainResult, SetupState } from "../lib/types";
import { displaySpeed, mphFromRpm, reverseRow, rpmFromMph } from "../lib/drivetrain";

type Props = {
  setup: SetupState;
  result: DrivetrainResult;
};

export function TablesSection({ setup, result }: Props) {
  const p = setup.precision;
  const spd = (mph: number) => displaySpeed(mph, setup.speedUnit).toFixed(p);
  const spdLabel = setup.speedUnit === "mph" ? "mph" : "km/h";
  const cruiseSpeedsMph = [30, 40, 50, 60, 70, 80, 90, 100];
  const cruiseRpms = [1000, 2000, 3000, 4000, 5000, 6000].filter((r) => r <= setup.rpm.redline);

  const revRow = setup.showReverse ? reverseRow(setup) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-3">
          <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Gears & travel / rev
          </h3>
          {result.transferCaseMultiplier > 1 && setup.transferCase.enabled && (
            <p className="mb-2 text-[10px] text-amber-500/90">
              Overall includes transfer case ×{result.transferCaseMultiplier.toFixed(2)}.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-1 pr-2">Gr</th>
                  <th className="py-1 pr-2">Trans</th>
                  <th className="py-1 pr-2">Overall</th>
                  <th className="py-1 pr-2">in/rev</th>
                  <th className="py-1">ft/rev</th>
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-200">
                {result.rows.map((r) => (
                  <tr key={r.gear as string} className="border-b border-zinc-800/60">
                    <td className="py-1 pr-2">{r.gear}</td>
                    <td className="py-1 pr-2">{r.transRatio.toFixed(3)}</td>
                    <td className="py-1 pr-2 text-violet-300/90">{r.overall.toFixed(2)}</td>
                    <td className="py-1 pr-2">{r.distancePerRevIn.toFixed(2)}</td>
                    <td className="py-1">{r.distancePerRevFt.toFixed(3)}</td>
                  </tr>
                ))}
                {revRow && (
                  <tr className="border-b border-zinc-800/60 text-amber-200/90">
                    <td className="py-1 pr-2">{revRow.gear}</td>
                    <td className="py-1 pr-2">{revRow.transRatio.toFixed(3)}</td>
                    <td className="py-1 pr-2">{revRow.overall.toFixed(2)}</td>
                    <td className="py-1 pr-2">{revRow.distancePerRevIn.toFixed(2)}</td>
                    <td className="py-1">{revRow.distancePerRevFt.toFixed(3)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-3">
          <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Upshift RPM change (same road speed)
          </h3>
          <p className="mb-2 text-[10px] leading-relaxed text-zinc-600">
            If you were at <strong className="text-zinc-400">{setup.shiftReferenceRpm.toFixed(0)} RPM</strong>{" "}
            in the lower gear (set in setup: <em>Shift % reference RPM</em>) and upshifted at the{" "}
            <strong className="text-zinc-400">same road speed</strong>, engine RPM would fall to the values
            below. The % is the drop relative to that reference RPM — not tire-dependent.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="py-1 pr-2">Shift</th>
                  <th className="py-1 pr-2">RPM after</th>
                  <th className="py-1">Drop %</th>
                </tr>
              </thead>
              <tbody className="font-mono text-zinc-200">
                {result.shiftDrops.map((s) => (
                  <tr key={`${s.from}-${s.to}`} className="border-b border-zinc-800/60">
                    <td className="py-1 pr-2">
                      {s.from}→{s.to}
                    </td>
                    <td className="py-1 pr-2 text-zinc-300">{s.rpmAfter.toFixed(0)}</td>
                    <td className="py-1 text-violet-300/90">{s.pctDrop.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-3">
        <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Engine RPM @ road speed — all gears
        </h3>
        <p className="mb-2 text-[10px] text-zinc-600">
          Each column is engine RPM in that gear at the road speed in the first column ({spdLabel}.
          Internally mph; display converts for km/h).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[10px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="sticky left-0 z-10 bg-zinc-950 py-1 pr-2">{spdLabel}</th>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <th key={g} className="py-1 px-1 text-center font-mono">
                    G{g}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-zinc-200">
              {cruiseSpeedsMph.map((mph) => (
                <tr key={mph} className="border-b border-zinc-800/60">
                  <td className="sticky left-0 z-10 bg-zinc-950 py-1 pr-2 text-zinc-300">
                    {spd(mph)}
                  </td>
                  {result.rows.map((row) => (
                    <td key={String(row.gear)} className="py-1 px-1 text-center tabular-nums">
                      {rpmFromMph(mph, row.overall, result.revsPerMile).toFixed(0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/40 p-3">
        <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Road speed @ engine RPM — all gears
        </h3>
        <p className="mb-2 text-[10px] text-zinc-600">
          Each column is road speed in {spdLabel} in that gear at the engine RPM in the first column.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[10px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="sticky left-0 z-10 bg-zinc-950 py-1 pr-2">RPM</th>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <th key={g} className="py-1 px-1 text-center font-mono">
                    G{g}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-zinc-200">
              {cruiseRpms.map((rpm) => (
                <tr key={rpm} className="border-b border-zinc-800/60">
                  <td className="sticky left-0 z-10 bg-zinc-950 py-1 pr-2 text-zinc-300">
                    {rpm}
                  </td>
                  {result.rows.map((row) => (
                    <td key={String(row.gear)} className="py-1 px-1 text-center tabular-nums">
                      {spd(mphFromRpm(rpm, row.overall, result.revsPerMile))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
