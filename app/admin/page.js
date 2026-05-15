'use client'

// Zorg ervoor dat de pagina dynamisch wordt gerenderd
export const dynamic = 'force-dynamic';

// Importeer de Supabase-client uit je bestaande lib/supabase.js
import { supabase } from '@/lib/supabase';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Stijlen voor de box, card, inputs en button
const boxStyle = {
  minHeight: '100vh',
  background: '#0f0f0f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '48px',
  width: '100%',
  maxWidth: '400px'
};

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none'
};

function InviteContent() {
  // States voor de modus, email, wachtwoord, foutmeldingen en laden
  const [mode, setMode] = useState('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Router en searchParams voor navigatie en URL-parameters
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  // Controleer de uitnodigingscode als de component wordt geladen
  useEffect(() => {
    async function checkCode() {
      if (!code) {
        setMode('invalid');
        return;
      }

      // Haal de uitnodiging op uit de database
      const { data } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .single();

      if (!data) {
        setMode('invalid');
        return;
      }
      if (data.used_by) {
        setMode('used');
        return;
      }

      setMode('signup');
    }

    checkCode();
  }, [code]);

  // Functie om een nieuw account aan te maken
  async function handleSignup() {
    setLoading(true);
    setError('');

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // Markeer de uitnodiging als gebruikt
    await supabase
      .from('invites')
      .update({
        used_by: data.user.id,
        used_at: new Date().toISOString()
      })
      .eq('code', code);

    // Navigeer naar de homepagina
    router.push('/');
    setLoading(false);
  }

  // Toon de juiste inhoud op basis van de modus
  if (mode === 'loading') {
    return (
      <div style={boxStyle}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Checking invite...</p>
      </div>
    );
  }

  if (mode === 'invalid') {
    return (
      <div style={boxStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', marginBottom: '12px' }}>
            Ongeldige uitnodiging
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Deze uitnodigingslink is niet geldig. Vraag een nieuwe aan.
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'used') {
    return (
      <div style={boxStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', marginBottom: '12px' }}>
            Uitnodiging al gebruikt
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Deze uitnodigingslink is al gebruikt.
          </p>
        </div>
      </div>
    );
  }

  // Toon het aanmeldformulier
  return (
    <div style={boxStyle}>
      <div style={cardStyle}>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '28px',
          fontWeight: '400',
          marginBottom: '8px'
        }}>
          Je bent uitgenodigd
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginBottom: '32px' }}>
          Maak je account aan om toegang te krijgen tot de watchlist.
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
            placeholder="Wachtwoord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />

          {error && <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>}

          <button
            onClick={handleSignup}
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
            {loading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hoofdcomponent met Suspense voor het laden
export default function InvitePage() {
  return (
    <Suspense fallback={
      <div style={boxStyle}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Laden...</p>
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}