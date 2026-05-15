'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setEmail(session.user.email)
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/', label: 'To Watch' },
    { href: '/watched', label: 'Watched' },
    { href: '/pick', label: 'Pick for Me' },
    { href: '/stats', label: 'Stats' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(15,15,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Logo */}
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '20px',
          color: '#fff',
          letterSpacing: '0.5px',
          marginRight: '24px',
          flexShrink: 0
        }}>
          Watchlist
        </span>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '8px', flex: 1 }} className="desktop-nav">
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              color: path === link.href ? '#fff' : 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: path === link.href ? '600' : '400',
              padding: '6px 14px',
              borderRadius: '6px',
              background: path === link.href ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop sign out */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-nav">
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            {email}
          </span>
          <button onClick={signOut} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-nav"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '8px',
            lineHeight: 1
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="mobile-nav"
          style={{
            position: 'fixed',
            top: '64px', left: 0, right: 0,
            zIndex: 99,
            background: 'rgba(15,15,15,0.98)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: path === link.href ? '#fff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: path === link.href ? '600' : '400',
                padding: '12px 16px',
                borderRadius: '8px',
                background: path === link.href ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}

          <div style={{
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
              {email}
            </span>
            <button onClick={signOut} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* CSS for mobile/desktop switching */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}