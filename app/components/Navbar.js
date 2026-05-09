'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  const links = [
    { href: '/', label: 'To Watch' },
    { href: '/watched', label: 'Watched' },
    { href: '/pick', label: 'Pick for Me' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: '0 48px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(15,15,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <span style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '20px',
        color: '#fff',
        letterSpacing: '0.5px',
        marginRight: '24px'
      }}>
        Watchlist
      </span>

      {links.map(link => (
        <Link key={link.href} href={link.href} style={{
          color: path === link.href ? '#fff' : 'rgba(255,255,255,0.45)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: path === link.href ? '600' : '400',
          padding: '6px 14px',
          borderRadius: '6px',
          background: path === link.href ? 'rgba(255,255,255,0.08)' : 'transparent',
          transition: 'all 0.15s ease'
        }}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}