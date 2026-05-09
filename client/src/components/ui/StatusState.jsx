export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this section. Please try again.",
  actionLabel = "Retry",
  onAction,
  compact = false,
}) {
  return (
    <div className={`glass-card-static text-center ${compact ? "p-4" : "p-8"}`}>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-dark-300">{message}</p>
      {onAction && (
        <button type="button" onClick={onAction} className="btn-ghost mt-4 px-4 py-2 text-xs">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon = "•",
  title,
  message,
  action,
}) {
  return (
    <div className="glass-card-static p-8 text-center">
      <div className="mb-3 text-3xl" aria-hidden="true">{icon}</div>
      {title && <p className="text-sm font-semibold text-white">{title}</p>}
      {message && <p className="mt-1 text-xs leading-relaxed text-dark-300">{message}</p>}
      {action}
    </div>
  );
}

export function InlineNotice({ children, tone = "info", onDismiss }) {
  const toneClass = tone === "danger"
    ? "border-red-500/20 bg-red-500/10 text-red-400"
    : "border-neon-blue/20 bg-neon-blue/10 text-neon-blue";

  return (
    <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="ml-3 text-lg leading-none opacity-80 hover:opacity-100" aria-label="Dismiss">
          x
        </button>
      )}
    </div>
  );
}
