'use client'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

export default function MovieCard({ movie, onUpdate }) {
  const [hover, setHover] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggleWatched() {
    setLoading(true)
    const { error } = await supabase
      .from('movies')
      .update({
        watched: !movie.watched,
        watched_date: !movie.watched ? new Date().toISOString().split('T')[0] : null
      })
      .eq('id', movie.id)

    if (!error) onUpdate()
    setLoading(false)
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fade-up"
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: hover ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hover ? '0 24px 48px rgba(0,0,0,0.7)' : '0 2px 8px rgba(0,0,0,0.3)',
        zIndex: hover ? 10 : 1,
        aspectRatio: '2/3',
        background: '#1a1a1a',
        // Fade out watched movies
        opacity: movie.watched ? 0.4 : 1,
        filter: movie.watched ? 'grayscale(60%)' : 'none',
      }}
    >
      {movie.poster_url ? (
        <img
          src={movie.poster_url}
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', textAlign: 'center',
          fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.4)',
          background: '#1c1c1c'
        }}>
          {movie.title}
        </div>
      )}

        {movie.watched && !hover && (
        <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: '#15ce43',
            color: '#fff',
            fontSize: '11px', fontWeight: '700',
            padding: '3px 7px', borderRadius: '4px',
            border: '1px solid #fff'
        }}>
            ✓
        </div>
        )}

      {/* Rank badge */}
      {!hover && movie.imdb_rank && (
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '11px', fontWeight: '600',
          padding: '3px 7px', borderRadius: '4px',
          letterSpacing: '0.3px'
        }}>
          #{movie.imdb_rank}
        </div>
      )}

      {/* Hover overlay */}
      {hover && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '13px', fontWeight: '600',
            marginBottom: '5px', lineHeight: 1.35,
            letterSpacing: '0.1px'
          }}>
            {movie.title}
          </div>

          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.5)',
            marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap'
          }}>
            <span>#{movie.imdb_rank}</span>
            <span>·</span>
            <span>{movie.year}</span>
            <span>·</span>
            <span>{movie.runtime ? `${movie.runtime}m` : '—'}</span>
            <span>·</span>
            <span>{movie.genre}</span>
          </div>

          <button
            onClick={toggleWatched}
            disabled={loading}
            style={{
              background: movie.watched ? 'rgba(255,255,255,0.12)' : '#fff',
              color: movie.watched ? '#fff' : '#000',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.2px',
              transition: 'background 0.15s'
            }}
          >
            {movie.watched ? '↩ Mark Unwatched' : '+ Mark Watched'}
          </button>
        </div>
      )}
    </div>
  )
}