'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/Navbar'

export default function PickPage() {
  const [allMovies, setAllMovies] = useState([])
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadMovies() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('watched', false)
      setAllMovies(data || [])
    }
    loadMovies()
  }, [])

  function pickMovies() {
    setLoading(true)
    const shuffled = [...allMovies].sort(() => Math.random() - 0.5)
    const picked = []
    const usedGenres = new Set()

    for (const movie of shuffled) {
      if (picked.length >= 3) break
      if (!usedGenres.has(movie.genre)) {
        picked.push(movie)
        usedGenres.add(movie.genre)
      }
    }

    for (const movie of shuffled) {
      if (picked.length >= 3) break
      if (!picked.includes(movie)) picked.push(movie)
    }

    setPicks(picked)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />
      <div style={{ padding: '88px 48px 64px', maxWidth: '960px' }}>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '32px', fontWeight: '400', marginBottom: '6px'
          }}>
            Pick for Me
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
            Can't decide? Get 3 random picks from different genres.
          </p>
        </div>

        <button
          onClick={pickMovies}
          disabled={loading}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '12px 28px',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.2px',
            marginBottom: '48px',
            transition: 'opacity 0.15s'
          }}
        >
          {loading ? 'Picking...' : '🎲 Pick 3 Movies'}
        </button>

        {picks.length > 0 && (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {picks.map((movie, i) => (
              <div key={movie.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                flex: '1 1 260px',
                maxWidth: '280px'
              }}>
                {movie.poster_url && (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '600',
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '1.5px', marginBottom: '8px'
                  }}>
                    OPTION {i + 1}
                  </div>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '17px', marginBottom: '12px', lineHeight: 1.35
                  }}>
                    {movie.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.45)',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}>
                    <span>📅 {movie.year}</span>
                    <span>⏱ {movie.runtime ? `${movie.runtime} min` : '—'}</span>
                    <span>🎬 {movie.genre || '—'}</span>
                    <span>⭐ IMDb #{movie.imdb_rank}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}