'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabase, setSupabase] = useState(null)
  const router = useRouter()

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

  async function handleSubmit() {
    if (!supabase) {
      setError('Supabase is niet geïnitialiseerd.')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
          setError(error.message)
        } else {
          router.push('/')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(error.message)
        } else {
          router.push('/')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Toon een laadscherm als Supabase nog niet beschikbaar is
  if (!supabase) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f0f0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)', fontSize: '14px'
      }}>
        Laden...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '48px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '28px', fontWeight: '400',
          marginBottom: '8px'
        }}>
          Watchlist
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '14px', marginBottom: '32px'
        }}>
          {isSignup ? 'Create an account' : 'Sign in to your account'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none'
            }}
          />

          {error && (
            <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              marginTop: '8px'
            }}
          >
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </button>

          <button
            onClick={() => { setIsSignup(!isSignup); setError('') }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              padding: '4px'
            }}
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}