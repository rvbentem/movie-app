export default function ProgressBar({ watched, total }) {
  const pct = total === 0 ? 0 : Math.round((watched / total) * 100)

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '8px'
      }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          Progress
        </span>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          {watched} / {total} — {pct}%
        </span>
      </div>
      <div style={{
        height: '4px', background: 'rgba(255,255,255,0.08)',
        borderRadius: '4px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(to right, #16a34a, #4ade80)',
          borderRadius: '4px',
          transition: 'width 0.6s ease'
        }} />
      </div>
    </div>
  )
}