type PageLoaderProps = {
  message?: string;
  compact?: boolean;
};

export function PageLoader({ message = "Loading...", compact = false }: PageLoaderProps) {
  return (
    <div
      className={compact ? "rounded-xl border border-stone bg-white p-6" : "container-base py-14"}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-2xl border border-stone bg-white/95 p-8 shadow-card">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-pine/25 border-t-pine" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-600">{message}</p>
      </div>
    </div>
  );
}
