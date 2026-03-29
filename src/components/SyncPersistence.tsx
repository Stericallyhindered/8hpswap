import { useEffect, useRef } from "react";
import { getSerializedSnapshot } from "../store/calculatorStore";
import { saveLocal, stateToSearchParams } from "../lib/serialize";
import { useCalculatorStore } from "../store/calculatorStore";

export function SyncPersistence() {
  const setupA = useCalculatorStore((s) => s.setupA);
  const setupB = useCalculatorStore((s) => s.setupB);
  const compare = useCalculatorStore((s) => s.compare);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      const snap = getSerializedSnapshot();
      saveLocal(snap);
      const qs = stateToSearchParams(snap);
      window.history.replaceState({}, "", qs);
    }, 350);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [setupA, setupB, compare]);

  return null;
}
