'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'

export default function WatchedPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadMovies() {
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('watched', true)
      .order('watched_date', { ascending: false })
    setMovies(data || [])
    setLoading(false)
  }

  useEffect(() => { loadMovies() }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />
      <div style={{ padding: '88px 48px 64px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '32px', fontWeight: '400',
            marginBottom: '4px'
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
  )
}