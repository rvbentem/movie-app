'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function MovieCard({ movie, onUpdate }) {
  const [hover, setHover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supabase, setSupabase] = useState(null)

  // Initialiseer Supabase-client alleen aan de client-side
  useEffect(() => {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    setSupabase(client)
  }, [])

  async function toggleWatched(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!supabase) return

    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const userId = session.user.id

    try {
      if (movie.watched) {
        await supabase
          .from('watched_movies')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movie.id)
      } else {
        await supabase
          .from('watched_movies')
          .insert({ user_id: userId, movie_id: movie.id })
      }
      onUpdate()
    } catch (error) {
      console.error('Error updating watched status:', error)
    } finally {
      setLoading(false)
    }
  }

  function getRtColor(score) {
    if (!score) return 'rgba(255,255,255,0.4)'
    const num = parseInt(score)
    if (num >= 75) return '#16a34a'
    if (num >= 60) return '#fab30a'
    return '#8b8b8b'
  }

  function getRtEmoji(score) {
    if (!score) return '🍅'
    const num = parseInt(score)
    if (num >= 75) return '🍅'
    if (num >= 60) return '🍅'
    return '💩'
  }

  function openIMDb(e) {
    e.preventDefault()
    e.stopPropagation()
    window.open(`https://www.imdb.com/title/${movie.imdb_id}`, '_blank', 'noopener,noreferrer')
  }

  // Toon een placeholder als Supabase nog niet is geïnitialiseerd
  if (!supabase) {
    return (
      <div style={{
        borderRadius: '10px',
        overflow: 'hidden',
        aspectRatio: '2/3',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: hover ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hover
          ? '0 24px 48px rgba(0,0,0,0.8)'
          : movie.watched
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 12px rgba(0,0,0,0.4)',
        zIndex: hover ? 10 : 1,
        aspectRatio: '2/3',
        background: '#1a1a1a',
        opacity: movie.watched && !hover ? 0.35 : 1,
        filter: movie.watched && !hover ? 'grayscale(80%) brightness(0.7)' : 'none',
      }}
    >
      {/* Poster */}
      {movie.poster_url ? (
        <img
          src={movie.poster_url}
          alt={movie.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
            transition: 'transform 0.4s ease',
            transform: hover ? 'scale(1.08)' : 'scale(1)'
          }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', textAlign: 'center',
          fontSize: '13px', fontWeight: '500',
          color: 'rgba(255,255,255,0.4)',
          background: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)'
        }}>
          {movie.title}
        </div>
      )}

      {/* Bottom gradient */}
      {!hover && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />
      )}

      {/* Rank badge — bottom left */}
      {!hover && (
        <div style={{
          position: 'absolute', bottom: '8px', left: '8px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '11px', fontWeight: '700',
          letterSpacing: '0.3px',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)'
        }}>
          #{movie.imdb_rank}
        </div>
      )}

      {/* Watched badge — bottom right */}
      {movie.watched && !hover && (
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          background: '#16a34a', color: '#fff',
          fontSize: '10px', fontWeight: '700',
          padding: '3px 6px', borderRadius: '4px',
          border: '1.5px solid #fff', letterSpacing: '0.5px'
        }}>
          ✓
        </div>
      )}

      {/* Hover overlay */}
      {hover && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '14px'
        }}>
          <div style={{
            fontSize: '13px', fontWeight: '700',
            marginBottom: '6px', lineHeight: 1.3, color: '#fff'
          }}>
            {movie.title}
          </div>

          {/* Meta tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {[`#${movie.imdb_rank}`, movie.year, movie.runtime ? `${movie.runtime}m` : null, movie.genre]
              .filter(Boolean)
              .map((item, i) => (
                <span key={i} style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(255,255,255,0.12)',
                  padding: '2px 7px',
                  borderRadius: '20px',
                  fontWeight: '500'
                }}>
                  {item}
                </span>
              ))}
          </div>

          {/* RT score */}
          {movie.rt_score && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '12px' }}>{getRtEmoji(movie.rt_score)}</span>
              <span style={{
                fontSize: '12px', fontWeight: '700',
                color: getRtColor(movie.rt_score)
              }}>
                {movie.rt_score}%
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                Rotten Tomatoes
              </span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={toggleWatched}
              disabled={loading}
              style={{
                flex: 1,
                background: movie.watched ? 'rgba(255,255,255,0.1)' : '#fff',
                color: movie.watched ? 'rgba(255,255,255,0.8)' : '#000',
                border: movie.watched ? '1px solid rgba(255,255,255,0.2)' : 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s'
              }}
            >
              {loading ? '...' : movie.watched ? '↩ Unwatch' : '+ Watch'}
            </button>

            <button
              onClick={openIMDb}
              style={{
                flex: 1,
                background: 'rgba(255, 193, 7, 0.2)',
                color: '#FFC107',
                border: '1px solid rgba(255, 193, 7, 0.4)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>IMDb</span>
              <span style={{ fontSize: '10px' }}>↗</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}