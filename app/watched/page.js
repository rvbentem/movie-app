'use client'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import AuthGuard from '../components/AuthGuard'
import MovieCard from '../components/MovieCard'

export default function WatchedPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date_newest')
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

  // Laad bekeken films als Supabase beschikbaar is
  useEffect(() => {
    if (!supabase) return

    async function loadWatchedMovies() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Haal alle films op
      const { data: allMovies } = await supabase
        .from('movies')
        .select('*')

      // Haal bekeken films op voor deze gebruiker
      const { data: watchedEntries } = await supabase
        .from('watched_movies')
        .select('movie_id, watched_date')
        .eq('user_id', session.user.id)

      // Combineer de gegevens
      const watchedIds = new Set(watchedEntries.map(w => w.movie_id))
      const watchedMovies = allMovies.filter(m => watchedIds.has(m.id))

      // Voeg de watched_date toe aan elke film
      const moviesWithDates = watchedMovies.map(movie => {
        const entry = watchedEntries.find(w => w.movie_id === movie.id)
        return { ...movie, watched_date: entry?.watched_date, watched: true }
      })

      setMovies(moviesWithDates)
      setLoading(false)
    }

    loadWatchedMovies()
  }, [supabase])

  const genres = ['All', ...new Set(movies.map(m => m.genre).filter(Boolean).sort())]

  function sortMovies(list) {
    switch (sortBy) {
      case 'date_newest':
        return [...list].sort((a, b) => new Date(b.watched_date || 0) - new Date(a.watched_date || 0))
      case 'date_oldest':
        return [...list].sort((a, b) => new Date(a.watched_date || 0) - new Date(b.watched_date || 0))
      case 'rank':
        return [...list].sort((a, b) => a.imdb_rank - b.imdb_rank)
      case 'year_new':
        return [...list].sort((a, b) => b.year - a.year)
      case 'year_old':
        return [...list].sort((a, b) => a.year - b.year)
      case 'runtime_short':
        return [...list].sort((a, b) => (a.runtime || 999) - (b.runtime || 999))
      case 'runtime_long':
        return [...list].sort((a, b) => (b.runtime || 0) - (a.runtime || 0))
      case 'genre':
        return [...list].sort((a, b) => (a.genre || '').localeCompare(b.genre || ''))
      default:
        return list
    }
  }

  const filtered = sortMovies(movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genreFilter === 'All' || m.genre === genreFilter
    return matchSearch && matchGenre
  }))

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
        <div className="page-container" style={{ padding: '88px 48px 64px' }}>

          <div style={{ marginBottom: '16px' }}>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '32px', fontWeight: '400', marginBottom: '4px'
            }}>
              Watched Movies
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              {movies.length} movies watched
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
              style={{ ...inputStyle, width: '200px', cursor: 'text' }}
            />

            <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={inputStyle}>
              {genres.map(g => (
                <option key={g} value={g} style={{ background: '#1a1a1a' }}>{g}</option>
              ))}
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
              <option value="date_newest" style={{ background: '#1a1a1a' }}>Sort: Recently Watched</option>
              <option value="date_oldest" style={{ background: '#1a1a1a' }}>Sort: Oldest Watched</option>
              <option value="rank" style={{ background: '#1a1a1a' }}>Sort: IMDb Rank</option>
              <option value="year_new" style={{ background: '#1a1a1a' }}>Sort: Newest first</option>
              <option value="year_old" style={{ background: '#1a1a1a' }}>Sort: Oldest first</option>
              <option value="runtime_short" style={{ background: '#1a1a1a' }}>Sort: Shortest first</option>
              <option value="runtime_long" style={{ background: '#1a1a1a' }}>Sort: Longest first</option>
              <option value="genre" style={{ background: '#1a1a1a' }}>Sort: Genre</option>
            </select>
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
                <MovieCard key={movie.id} movie={movie} onUpdate={loadWatchedMovies} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}