'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../components/Navbar'
import AuthGuard from '../components/AuthGuard'

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '24px',
      flex: '1 1 180px'
    }}>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '36px', fontWeight: '400', marginBottom: '4px'
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
      )}
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: allMovies } = await supabase
        .from('movies')
        .select('*')

      const { data: watchedEntries } = await supabase
        .from('watched_movies')
        .select('movie_id, watched_date')
        .eq('user_id', session.user.id)

      const watchedIds = new Set(watchedEntries.map(w => w.movie_id))
      const watched = allMovies.filter(m => watchedIds.has(m.id))
      const unwatched = allMovies.filter(m => !watchedIds.has(m.id))

      // Total watch time
      const totalMinutes = watched.reduce((sum, m) => sum + (m.runtime || 0), 0)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      // Favorite genre
      const genreCount = {}
      watched.forEach(m => {
        if (m.genre) genreCount[m.genre] = (genreCount[m.genre] || 0) + 1
      })
      const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]

      // Oldest and newest watched
      const sortedByYear = [...watched].sort((a, b) => a.year - b.year)
      const oldest = sortedByYear[0]
      const newest = sortedByYear[sortedByYear.length - 1]

      // Movies watched per month
      const byMonth = {}
      watchedEntries.forEach(w => {
        if (w.watched_date) {
          const month = w.watched_date.slice(0, 7)
          byMonth[month] = (byMonth[month] || 0) + 1
        }
      })
      const bestMonth = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0]

      // Average IMDb rank of watched
      const avgRank = watched.length
        ? Math.round(watched.reduce((sum, m) => sum + m.imdb_rank, 0) / watched.length)
        : null

      // Genre breakdown for unwatched
      const unwatchedGenres = {}
      unwatched.forEach(m => {
        if (m.genre) unwatchedGenres[m.genre] = (unwatchedGenres[m.genre] || 0) + 1
      })
      const genreBreakdown = Object.entries(unwatchedGenres).sort((a, b) => b[1] - a[1])

      setStats({
        total: allMovies.length,
        watchedCount: watched.length,
        unwatchedCount: unwatched.length,
        totalMinutes,
        hours,
        minutes,
        favoriteGenre,
        oldest,
        newest,
        bestMonth,
        avgRank,
        genreBreakdown,
        pct: Math.round((watched.length / allMovies.length) * 100)
      })

      setLoading(false)
    }
    load()
  }, [])

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div className="page-container" style={{ padding: '88px 48px 64px', maxWidth: '900px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '32px', fontWeight: '400', marginBottom: '4px'
            }}>
              Statistics
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              Your watchlist in numbers
            </p>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Loading...</p>
          ) : (
            <>
              {/* Main stats */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <StatCard
                  label="Movies watched"
                  value={stats.watchedCount}
                  sub={`${stats.pct}% of the Top 250`}
                />
                <StatCard
                  label="Still to watch"
                  value={stats.unwatchedCount}
                  sub="movies remaining"
                />
                <StatCard
                  label="Time spent watching"
                  value={`${stats.hours}h`}
                  sub={`${stats.minutes} minutes`}
                />
                <StatCard
                  label="Average IMDb rank"
                  value={stats.avgRank ? `#${stats.avgRank}` : '—'}
                  sub="of watched movies"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <StatCard
                  label="Favorite genre"
                  value={stats.favoriteGenre ? stats.favoriteGenre[0] : '—'}
                  sub={stats.favoriteGenre ? `${stats.favoriteGenre[1]} movies watched` : ''}
                />
                <StatCard
                  label="Oldest watched"
                  value={stats.oldest ? stats.oldest.year : '—'}
                  sub={stats.oldest ? stats.oldest.title : ''}
                />
                <StatCard
                  label="Newest watched"
                  value={stats.newest ? stats.newest.year : '—'}
                  sub={stats.newest ? stats.newest.title : ''}
                />
                <StatCard
                  label="Best month"
                  value={stats.bestMonth ? `${stats.bestMonth[1]}` : '—'}
                  sub={stats.bestMonth ? `movies in ${stats.bestMonth[0]}` : 'No data yet'}
                />
              </div>

              {/* Genre breakdown */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '28px'
              }}>
                <h2 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '20px', fontWeight: '400',
                  marginBottom: '24px'
                }}>
                  Still to watch by genre
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.genreBreakdown.map(([genre, count]) => {
                    const pct = Math.round((count / stats.unwatchedCount) * 100)
                    return (
                      <div key={genre}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginBottom: '5px', fontSize: '13px'
                        }}>
                          <span>{genre}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{count} movies</span>
                        </div>
                        <div style={{
                          height: '4px', background: 'rgba(255,255,255,0.08)',
                          borderRadius: '4px', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}