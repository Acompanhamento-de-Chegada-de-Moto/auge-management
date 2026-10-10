export function RoutePending() {
  return (
    <output className="flex min-h-64 items-center justify-center gap-3 p-6 text-base-content/65">
      <span className="loading loading-spinner loading-sm" aria-hidden="true" />
      <span>Carregando…</span>
    </output>
  );
}
