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

  // Initialize Supabase in browser
  useEffect(() => {
    async function initSupabase() {
      try {
        const { createClient } = await import('@supabase/supabase-js')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          console.error('Missing Supabase environment variables')
          return
        }

        const client = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        })

        setSupabase(client)
      } catch (error) {
        console.error('Error initializing Supabase:', error)
      }
    }

    initSupabase()
  }, [])

  // Load watched movies
  async function loadWatchedMovies() {
    if (!supabase) return

    try {
      setLoading(true)

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        setLoading(false)
        return
      }

      if (!session) {
        setLoading(false)
        return
      }

      // Fetch all movies
      const {
        data: allMovies = [],
        error: moviesError
      } = await supabase
        .from('movies')
        .select('*')

      if (moviesError) {
        console.error('Movies fetch error:', moviesError)
        setLoading(false)
        return
      }

      // Fetch watched entries for current user
      const {
        data: watchedEntries = [],
        error: watchedError
      } = await supabase
        .from('watched_movies')
        .select('movie_id, watched_date')
        .eq('user_id', session.user.id)

      if (watchedError) {
        console.error('Watched movies fetch error:', watchedError)
        setLoading(false)
        return
      }

      // Combine data
      const watchedIds = new Set(
        watchedEntries.map(w => w.movie_id)
      )

      const watchedMovies = allMovies.filter(movie =>
        watchedIds.has(movie.id)
      )

      const moviesWithDates = watchedMovies.map(movie => {
        const entry = watchedEntries.find(
          w => w.movie_id === movie.id
        )

        return {
          ...movie,
          watched_date: entry?.watched_date || null,
          watched: true
        }
      })

      setMovies(moviesWithDates)
    } catch (error) {
      console.error('Unexpected error loading watched movies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load movies when Supabase is ready
  useEffect(() => {
    if (supabase) {
      loadWatchedMovies()
    }
  }, [supabase])

  // Genres
  const genres = [
    'All',
    ...new Set(
      movies
        .map(movie => movie.genre)
        .filter(Boolean)
        .sort()
    )
  ]

  // Sorting
  function sortMovies(list) {
    switch (sortBy) {
      case 'date_newest':
        return [...list].sort(
          (a, b) =>
            new Date(b.watched_date || 0) -
            new Date(a.watched_date || 0)
        )

      case 'date_oldest':
        return [...list].sort(
          (a, b) =>
            new Date(a.watched_date || 0) -
            new Date(b.watched_date || 0)
        )

      case 'rank':
        return [...list].sort(
          (a, b) => (a.imdb_rank || 9999) - (b.imdb_rank || 9999)
        )

      case 'year_new':
        return [...list].sort(
          (a, b) => (b.year || 0) - (a.year || 0)
        )

      case 'year_old':
        return [...list].sort(
          (a, b) => (a.year || 0) - (b.year || 0)
        )

      case 'runtime_short':
        return [...list].sort(
          (a, b) => (a.runtime || 9999) - (b.runtime || 9999)
        )

      case 'runtime_long':
        return [...list].sort(
          (a, b) => (b.runtime || 0) - (a.runtime || 0)
        )

      case 'genre':
        return [...list].sort(
          (a, b) =>
            (a.genre || '').localeCompare(b.genre || '')
        )

      default:
        return list
    }
  }

  // Filtering
  const filtered = sortMovies(
    movies.filter(movie => {
      const matchSearch =
        movie.title?.toLowerCase().includes(search.toLowerCase())

      const matchGenre =
        genreFilter === 'All' ||
        movie.genre === genreFilter

      return matchSearch && matchGenre
    })
  )

  // Shared input style
  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    padding: '9px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  }

  // Loading screen while Supabase initializes
  if (!supabase) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />

        <div
          className="page-container"
          style={{
            padding: '88px 48px 64px'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '32px',
                fontWeight: '400',
                marginBottom: '4px'
              }}
            >
              Watched Movies
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '14px'
              }}
            >
              {movies.length} movies watched
            </p>
          </div>

          {/* Filters */}
          <div
            className="filters-row"
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '32px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...inputStyle,
                width: '220px'
              }}
            />

            <select
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              style={inputStyle}
            >
              {genres.map(genre => (
                <option
                  key={genre}
                  value={genre}
                  style={{ background: '#1a1a1a' }}
                >
                  {genre}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={inputStyle}
            >
              <option
                value="date_newest"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Recently Watched
              </option>

              <option
                value="date_oldest"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Oldest Watched
              </option>

              <option
                value="rank"
                style={{ background: '#1a1a1a' }}
              >
                Sort: IMDb Rank
              </option>

              <option
                value="year_new"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Newest First
              </option>

              <option
                value="year_old"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Oldest First
              </option>

              <option
                value="runtime_short"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Shortest Runtime
              </option>

              <option
                value="runtime_long"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Longest Runtime
              </option>

              <option
                value="genre"
                style={{ background: '#1a1a1a' }}
              >
                Sort: Genre
              </option>
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <p
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '14px'
              }}
            >
              Loading...
            </p>
          ) : filtered.length === 0 ? (
            <p
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '14px'
              }}
            >
              No watched movies found.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px'
              }}
            >
              {filtered.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onUpdate={loadWatchedMovies}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}