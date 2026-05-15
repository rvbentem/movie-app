'use client'

import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import MovieCard from './components/MovieCard'
import AuthGuard from './components/AuthGuard'
import ProgressBar from './components/ProgressBar'
import HeroBanner from './components/HeroBanner'

export default function HomePage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('All')
  const [showWatched, setShowWatched] = useState(true)
  const [sortBy, setSortBy] = useState('rank')
  const [supabase, setSupabase] = useState(null)

  // Initialiseer de Supabase-client in de browser
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

  async function loadMovies() {
    if (!supabase) return

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

  // Laad films als de Supabase-client beschikbaar is
  useEffect(() => {
    if (supabase) {
      loadMovies()
    }
  }, [supabase])

  const genres = ['All', ...new Set(movies.map(m => m.genre).filter(Boolean).sort())]

  function sortMovies(list) {
    switch (sortBy) {
      case 'rank': return [...list].sort((a, b) => a.imdb_rank - b.imdb_rank)
      case 'rt_desc': return [...list].sort((a, b) => (parseInt(b.rt_score) || 0) - (parseInt(a.rt_score) || 0))
      case 'rt_asc': return [...list].sort((a, b) => (parseInt(a.rt_score) || 101) - (parseInt(b.rt_score) || 101))
      case 'year_new': return [...list].sort((a, b) => b.year - a.year)
      case 'year_old': return [...list].sort((a, b) => a.year - b.year)
      case 'runtime_short': return [...list].sort((a, b) => (a.runtime || 999) - (b.runtime || 999))
      case 'runtime_long': return [...list].sort((a, b) => (b.runtime || 0) - (a.runtime || 0))
      case 'genre': return [...list].sort((a, b) => (a.genre || '').localeCompare(b.genre || ''))
      default: return list
    }
  }

  const filtered = sortMovies(movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genreFilter === 'All' || m.genre === genreFilter
    const matchWatched = showWatched ? true : !m.watched
    return matchSearch && matchGenre && matchWatched
  }))

  const watchedCount = movies.filter(m => m.watched).length

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer'
  }

  // Toon een laadscherm als supabase nog niet beschikbaar is
  if (!supabase) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Initialiseren...</p>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div className="page-container" style={{ padding: '88px 48px 64px' }}>

          {!loading && <HeroBanner movies={movies} />}

          <div style={{ marginBottom: '16px' }}>
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

          <ProgressBar watched={watchedCount} total={movies.length} />

          <div className="filters-row" style={{
            display: 'flex', gap: '12px',
            marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, width: '200px', cursor: 'text' }}
            />

            <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={inputStyle}>
              {genres.map(g => (
                <option key={g} value={g} style={{ background: '#1a1a1a' }}>{g}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
              <option value="rank" style={{ background: '#1a1a1a' }}>IMDb Rank</option>
              <option value="rt_desc" style={{ background: '#1a1a1a' }}>RT Score: High to Low</option>
              <option value="rt_asc" style={{ background: '#1a1a1a' }}>RT Score: Low to High</option>
              <option value="year_new" style={{ background: '#1a1a1a' }}>Newest first</option>
              <option value="year_old" style={{ background: '#1a1a1a' }}>Oldest first</option>
              <option value="runtime_short" style={{ background: '#1a1a1a' }}>Shortest first</option>
              <option value="runtime_long" style={{ background: '#1a1a1a' }}>Longest first</option>
              <option value="genre" style={{ background: '#1a1a1a' }}>Genre</option>
            </select>

            <button
              onClick={() => setShowWatched(!showWatched)}
              style={{
                ...inputStyle,
                background: showWatched ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                color: showWatched ? '#fff' : 'rgba(255,255,255,0.4)',
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