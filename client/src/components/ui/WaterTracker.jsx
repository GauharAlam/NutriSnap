export function WaterTracker({
  value,
  onChange,
  total = 8,
  compact = false,
}) {
  const pct = total > 0 ? Math.min(Math.max(value / total, 0), 1) * 100 : 0;

  return (
    <div className={compact ? "" : "glass-card-static p-5"}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Water</p>
          <p className="text-[11px] text-dark-300">{value}/{total} glasses today</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neon-blue/15 text-xl" aria-hidden="true">
          💧
        </div>
      </div>

      <div className={`grid gap-1.5 ${compact ? "grid-cols-4" : "grid-cols-8"}`}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i < value ? i : i + 1)}
            className={`h-8 rounded-lg transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-blue ${
              i < value
                ? "bg-gradient-to-t from-neon-blue to-neon-teal shadow-[0_0_8px_rgba(0,212,255,0.2)]"
                : "bg-glass-light hover:bg-glass-white"
            }`}
            aria-label={`Set water intake to ${i + 1} glasses`}
          />
        ))}
      </div>

      <div className="progress-bar mt-3 !h-1.5">
        <div
          className="progress-fill bg-gradient-to-r from-neon-blue to-neon-teal !h-1.5"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
