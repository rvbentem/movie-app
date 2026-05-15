'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const boxStyle = {
  minHeight: '100vh', background: '#0f0f0f',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px', padding: '48px',
  width: '100%', maxWidth: '400px'
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '12px 16px',
  borderRadius: '8px', fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif", outline: 'none'
}

function InviteContent() {
  const [mode, setMode] = useState('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    async function checkCode() {
      if (!code) { setMode('invalid'); return }

      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { data } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .single()

      if (!data) { setMode('invalid'); return }
      if (data.used_by) { setMode('used'); return }

      setMode('signup')
    }
    checkCode()
  }, [code])

  async function handleSignup() {
    setLoading(true)
    setError('')

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data, error: signupError } = await supabase.auth.signUp({ email, password })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    await supabase
      .from('invites')
      .update({ used_by: data.user.id, used_at: new Date().toISOString() })
      .eq('code', code)

    router.push('/')
    setLoading(false)
  }

  if (mode === 'loading') return (
    <div style={boxStyle}>
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>Checking invite...</p>
    </div>
  )

  if (mode === 'invalid') return (
    <div style={boxStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', marginBottom: '12px' }}>
          Invalid invite
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          This invite link is not valid. Ask for a new one.
        </p>
      </div>
    </div>
  )

  if (mode === 'used') return (
    <div style={boxStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', marginBottom: '12px' }}>
          Invite already used
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          This invite link has already been used.
        </p>
      </div>
    </div>
  )

  return (
    <div style={boxStyle}>
      <div style={cardStyle}>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '28px', fontWeight: '400', marginBottom: '8px'
        }}>
          You're invited
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginBottom: '32px' }}>
          Create your account to access the watchlist.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>}

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              background: '#fff', color: '#000', border: 'none',
              padding: '12px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", marginTop: '8px'
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={boxStyle}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</p>
      </div>
    }>
      <InviteContent />
    </Suspense>
  )
}