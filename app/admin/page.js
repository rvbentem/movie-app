'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import AuthGuard from '../components/AuthGuard'

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function AdminPage() {
  const [invites, setInvites] = useState([])
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState('')

  async function generateInvite() {
    setGenerating(true)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: { session } } = await supabase.auth.getSession()
    const code = randomCode()

    const { error } = await supabase
      .from('invites')
      .insert({ code, created_by: session.user.id })

    if (!error) {
      const link = `${window.location.origin}/invite?code=${code}`
      setInvites(prev => [{ code, link, used: false }, ...prev])
    }

    setGenerating(false)
  }

  function copyLink(link, code) {
    navigator.clipboard.writeText(link)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Navbar />
        <div className="page-container" style={{ padding: '88px 48px 64px', maxWidth: '700px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '32px', fontWeight: '400', marginBottom: '4px'
            }}>
              Invite Friends
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
              Generate a private invite link and send it to a friend.
            </p>
          </div>

          <button
            onClick={generateInvite}
            disabled={generating}
            style={{
              background: '#fff', color: '#000', border: 'none',
              padding: '12px 28px', fontSize: '14px', fontWeight: '600',
              borderRadius: '8px', cursor: generating ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", marginBottom: '40px'
            }}
          >
            {generating ? 'Generating...' : '+ Generate Invite Link'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invites.map(invite => (
              <div key={invite.code} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '16px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '16px'
              }}>
                <div style={{
                  fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {invite.link}
                </div>
                <button
                  onClick={() => copyLink(invite.link, invite.code)}
                  style={{
                    background: copied === invite.code ? '#16a34a' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', padding: '6px 14px',
                    borderRadius: '6px', fontSize: '13px',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    flexShrink: 0, transition: 'background 0.2s'
                  }}
                >
                  {copied === invite.code ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}