export default function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const delta = 1
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)

    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  return (
    <div className={`flex items-center justify-center gap-1 mt-6 ${className}`}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="p-2 rounded-lg text-text-muted hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-text-muted text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            className={`min-w-9 h-9 rounded-lg text-sm font-semibold transition-all ${p === page ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:bg-surface-container-low'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        className="p-2 rounded-lg text-text-muted hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  )
}
