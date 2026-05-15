'use client'

import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import AuthGuard from '../components/AuthGuard'

export default function PickPage() {
  const [allMovies, setAllMovies] = useState([])
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(false)
  const [supabase, setSupabase] = useState(null)

  // Initialiseer Supabase in de browser
  useEffect(() => {
    async function initSupabase() {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL of Anon Key is niet beschikbaar.')
        return
      }

      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      })
      setSupabase(client)
    }

    initSupabase()
  }, [])

  // Laad films als Supabase beschikbaar is
  useEffect(() => {
    if (!supabase) return

    async function loadMovies() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: allMovies } = await supabase
        .from('movies')
        .select('*')
        .order('imdb_rank', { ascending: true })

      const { data: watchedMovies } = await supabase
        .from('watched_movies')
        .select('movie_id')
        .eq('user_id', session.user.id)

      const watchedIds = new Set(watchedMovies?.map(w => w.movie_id) || [])
      const unwatched = allMovies.filter(m => !watchedIds.has(m.id))
      setAllMovies(unwatched)
      setLoading(false)
    }

    loadMovies()
  }, [supabase])

  function pickMovies() {
    setLoading(true)

    const total = allMovies.length
    const topCutoff = Math.ceil(total * 0.25)

    // Split into top 25% and the rest
    const topMovies = allMovies.slice(0, topCutoff)
    const restMovies = allMovies.slice(topCutoff)

    // Shuffle both pools
    const shuffledTop = [...topMovies].sort(() => Math.random() - 0.5)
    const shuffledRest = [...restMovies].sort(() => Math.random() - 0.5)

    const picked = []
    const usedGenres = new Set()

    // Pick 2 from top 25% with different genres
    for (const movie of shuffledTop) {
      if (picked.length >= 2) break
      if (!usedGenres.has(movie.genre)) {
        picked.push({ ...movie, highlight: true })
        usedGenres.add(movie.genre)
      }
    }

    // If top 25% didn't have 2 different genres, fill from top anyway
    for (const movie of shuffledTop) {
      if (picked.length >= 2) break
      if (!picked.find(p => p.id === movie.id)) {
        picked.push({ ...movie, highlight: true })
      }
    }

    // Pick 1 random from the rest, different genre if possible
    for (const movie of shuffledRest) {
      if (picked.length >= 3) break
      if (!usedGenres.has(movie.genre)) {
        picked.push({ ...movie, highlight: false })
        break
      }
    }

    // Fallback: just pick any unwatched movie
    if (picked.length < 3) {
      const all = [...shuffledTop, ...shuffledRest]
      for (const movie of all) {
        if (picked.length >= 3) break
        if (!picked.find(p => p.id === movie.id)) {
          picked.push({ ...movie, highlight: false })
        }
      }
    }

    setPicks(picked)
    setLoading(false)
  }

  // Toon een laadscherm als Supabase nog niet beschikbaar is
  if (!supabase) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)'
      }}>
        Laden...
      </div>
    )
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div className="page-container" style={{ padding: '88px 48px 64px', maxWidth: '960px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '32px', fontWeight: '400', marginBottom: '6px'
            }}>
              Pick for Me
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              2 picks from your top ranked unwatched movies, 1 wildcard.
            </p>
          </div>

          <button
            onClick={pickMovies}
            disabled={loading || allMovies.length === 0}
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
              marginBottom: '48px'
            }}
          >
            {loading ? 'Picking...' : '🎲 Pick 3 Movies'}
          </button>

          {picks.length > 0 && (
            <div className="pick-cards" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {picks.map((movie, i) => (
                <div
                  key={movie.id}
                  className="pick-card"
                  style={{
                    background: movie.highlight
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.03)',
                    border: movie.highlight
                      ? '1px solid rgba(255,255,255,0.15)'
                      : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flex: '1 1 260px',
                    maxWidth: '280px',
                    position: 'relative'
                  }}
                >
                  {/* Top ranked badge */}
                  {movie.highlight && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      zIndex: 2,
                      background: '#f5c518',
                      color: '#000',
                      fontSize: '10px', fontWeight: '800',
                      padding: '3px 8px', borderRadius: '20px',
                      letterSpacing: '0.5px'
                    }}>
                      TOP PICK
                    </div>
                  )}

                  {/* Wildcard badge */}
                  {!movie.highlight && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      zIndex: 2,
                      background: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '10px', fontWeight: '700',
                      padding: '3px 8px', borderRadius: '20px',
                      letterSpacing: '0.5px'
                    }}>
                      WILDCARD
                    </div>
                  )}

                  {movie.poster_url && (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      style={{
                        width: '100%', aspectRatio: '2/3',
                        objectFit: 'cover', display: 'block'
                      }}
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
    </AuthGuard>
  )
}