import { useEffect, useState } from "react";

const TOTAL_GLASSES = 8;

function getTodayKey() {
  return `water-${new Date().toISOString().split("T")[0]}`;
}

function readStoredWater() {
  const saved = window.localStorage.getItem(getTodayKey());
  const parsed = saved !== null ? Number.parseInt(saved, 10) : 0;
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), TOTAL_GLASSES) : 0;
}

export function useDailyWater() {
  const [waterCount, setWaterCount] = useState(readStoredWater);

  useEffect(() => {
    window.localStorage.setItem(getTodayKey(), String(waterCount));
  }, [waterCount]);

  return {
    waterCount,
    setWaterCount,
    totalGlasses: TOTAL_GLASSES,
  };
}
