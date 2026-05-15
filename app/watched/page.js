'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import AuthGuard from '../components/AuthGuard'

export default function WatchedPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadMovies() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: watchedEntries } = await supabase
      .from('watched_movies')
      .select('movie_id, watched_date')
      .eq('user_id', session.user.id)
      .order('watched_date', { ascending: false })

    if (!watchedEntries || watchedEntries.length === 0) {
      setMovies([])
      setLoading(false)
      return
    }

    const movieIds = watchedEntries.map(w => w.movie_id)

    const { data: movieData } = await supabase
      .from('movies')
      .select('*')
      .in('id', movieIds)

    const merged = watchedEntries.map(w => {
      const movie = movieData.find(m => m.id === w.movie_id)
      return { ...movie, watched: true, watched_date: w.watched_date }
    })

    setMovies(merged)
    setLoading(false)
  }

  useEffect(() => { loadMovies() }, [])

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div style={{ padding: '88px 48px 64px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '32px', fontWeight: '400', marginBottom: '4px'
            }}>
              Watched
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              {movies.length} movies watched
            </p>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading...</p>
          ) : movies.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No watched movies yet.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
              gap: '14px'
            }}>
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onUpdate={loadMovies} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}