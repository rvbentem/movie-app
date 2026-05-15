'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Initialiseer Supabase en controleer authenticatie in de browser
  useEffect(() => {
    async function initSupabaseAndCheckAuth() {
      // 1. Initialiseer Supabase-client
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL of Anon Key is niet beschikbaar.')
        router.push('/login')
        return
      }

      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      })
      setSupabase(client)

      // 2. Controleer de huidige sessie
      const { data: { session } } = await client.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setIsAuthenticated(true)
      setLoading(false)

      // 3. Luister naar veranderingen in de auth-state
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          router.push('/login')
        } else {
          setIsAuthenticated(true)
          setLoading(false)
        }
      })

      return () => subscription?.unsubscribe()
    }

    initSupabaseAndCheckAuth()
  }, [router])

  // Toon laadscherm als we nog aan het initialiseren zijn
  if (loading || !supabase) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '14px'
      }}>
        Laden...
      </div>
    )
  }

  // Als we geauthenticeerd zijn, toon de children
  if (isAuthenticated) {
    return children
  }

  // Fallback (moet eigenlijk nooit bereikt worden door router.push)
  return null
}