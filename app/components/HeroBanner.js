'use client'
import { useState, useEffect } from 'react'

export default function HeroBanner({ movies }) {
  const [hero, setHero] = useState(null)

  useEffect(() => {
    const topUnwatched = movies.filter(m => !m.watched && m.imdb_rank <= 10)
    if (topUnwatched.length > 0) {
      const random = topUnwatched[Math.floor(Math.random() * topUnwatched.length)]
      setHero(random)
    }
  }, [movies])

  if (!hero || !hero.poster_url) return null

  const badgeStyle = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.1)',
    padding: '4px 12px',
    borderRadius: '20px'
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '420px',
      marginBottom: '48px',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <img
        src={hero.poster_url}
        alt={hero.title}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'blur(2px) brightness(0.4)',
          transform: 'scale(1.05)'
        }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.9) 40%, transparent 100%)'
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center',
        height: '100%', padding: '40px'
      }}>
        <img
          src={hero.poster_url}
          alt={hero.title}
          style={{
            height: '280px',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            flexShrink: 0,
            marginRight: '40px'
          }}
        />

        <div>
          <div style={{
            fontSize: '11px', fontWeight: '700',
            color: '#f5c518', letterSpacing: '2px',
            marginBottom: '12px'
          }}>
            IMDb #{hero.imdb_rank} — SUGGESTED FOR YOU
          </div>

          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '36px', fontWeight: '400',
            marginBottom: '12px', lineHeight: 1.2,
            maxWidth: '500px'
          }}>
            {hero.title}
          </h2>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[hero.year, hero.runtime ? `${hero.runtime} min` : null, hero.genre]
              .filter(Boolean)
              .map((item, i) => (
                <span key={i} style={badgeStyle}>{item}</span>
              ))}
          </div>

          
          <a href={`https://www.imdb.com/title/${hero.imdb_id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#f5c518', color: '#000', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
            View on IMDb
          </a>
        </div>
      </div>
    </div>
  )
}