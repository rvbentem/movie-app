'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from './components/Navbar'
import MovieCard from './components/MovieCard'
import AuthGuard from './components/AuthGuard'

export default function HomePage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('All')
  const [showWatched, setShowWatched] = useState(true)

  async function loadMovies() {
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
    const merged = allMovies.map(m => ({ ...m, watched: watchedIds.has(m.id) }))

    setMovies(merged)
    setLoading(false)
  }

  useEffect(() => { loadMovies() }, [])

  const genres = ['All', ...new Set(movies.map(m => m.genre).filter(Boolean).sort())]

  const filtered = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genreFilter === 'All' || m.genre === genreFilter
    const matchWatched = showWatched ? true : !m.watched
    return matchSearch && matchGenre && matchWatched
  })

  const watchedCount = movies.filter(m => m.watched).length

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div className="page-container" style={{ padding: '88px 48px 64px' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '32px', fontWeight: '400', marginBottom: '4px'
            }}>
              IMDb Top 250
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              {watchedCount} of {movies.length} watched
            </p>
          </div>

          <div className="filters-row" style={{
            display: 'flex', gap: '12px',
            marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                width: '220px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none'
              }}
            />

            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {genres.map(g => (
                <option key={g} value={g} style={{ background: '#1a1a1a' }}>{g}</option>
              ))}
            </select>

            <button
              onClick={() => setShowWatched(!showWatched)}
              style={{
                background: showWatched ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: showWatched ? '#fff' : 'rgba(255,255,255,0.4)',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {showWatched ? '✓ Showing watched' : '✗ Hiding watched'}
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading...</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              {filtered.map(movie => (
                <MovieCard key={movie.id} movie={movie} onUpdate={loadMovies} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}