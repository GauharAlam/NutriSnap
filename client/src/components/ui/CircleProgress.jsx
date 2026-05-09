import { memo } from "react";

export const CircleProgress = memo(function CircleProgress({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  color = "#00d4ff",
  label,
  mode = "percent",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeMax = Number(max) > 0 ? Number(max) : 0;
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const pct = safeMax > 0 ? Math.min(Math.max(safeValue / safeMax, 0), 1) : 0;
  const offset = circumference * (1 - pct);
  const displayValue = mode === "percent" ? `${Math.round(pct * 100)}%` : Math.round(safeValue);

  return (
    <div className="stat-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{displayValue}</span>
        {label && <span className="text-[10px] text-dark-300">{label}</span>}
      </div>
    </div>
  );
});
