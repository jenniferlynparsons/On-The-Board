export default function TeamSection({
  teamName,
  league,
  division,
  record,
  colorPrimary,
  colorAccent,
  children,
  loading = false,
  error = null,
}) {
  return (
    <section className="flex flex-col gap-4">
      {/* Team Banner */}
      <div
        className="px-6 py-4 text-white rounded-lg shadow-md"
        style={{ backgroundColor: colorPrimary }}
      >
        <h2 className="text-2xl font-bold">{teamName}</h2>
        <p className="text-sm opacity-90">{league} • {division}</p>
        {record && <p className="text-lg font-semibold mt-2">{record}</p>}
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
        >
          {error}
        </div>
      )}

      {/* Cards Container */}
      <div className="flex flex-col gap-4" aria-busy={loading} aria-label={loading ? `Loading ${teamName} data` : undefined}>
        {children}
      </div>
    </section>
  )
}
