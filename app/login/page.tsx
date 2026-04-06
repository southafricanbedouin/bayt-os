'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the magic link!')
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF8F0', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e8e3d8' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏡</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A3D28', letterSpacing: '-0.5px' }}>Bayt Seedat</div>
          <div style={{ fontSize: 13, color: '#8a9e8e', marginTop: 4 }}>بِسْمِ اللَّهِ · Family OS</div>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: googleLoading ? '#f5f5f0' : '#fff', color: '#1a3d28',
            border: '2px solid #e8e3d8', borderRadius: 12, padding: '13px 16px',
            fontSize: 14, fontWeight: 600, cursor: googleLoading ? 'default' : 'pointer',
            marginBottom: 16, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!googleLoading) (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A3D28' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e8e3d8' }}
        >
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#e8e3d8' }} />
          <span style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e8e3d8' }} />
        </div>

        {/* Magic Link */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 6 }}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '12px 14px', border: '2px solid #e8e3d8',
                borderRadius: 12, fontSize: 14, color: '#1a3d28', background: '#faf8f2',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#1A3D28'}
              onBlur={e => e.target.style.borderColor = '#e8e3d8'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#aaa' : '#1A3D28', color: '#fff',
              border: 'none', borderRadius: 12, padding: '13px 16px',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Sending…' : '✉️ Send Magic Link'}
          </button>
          {message && (
            <p style={{ fontSize: 13, textAlign: 'center', marginTop: 12, color: message.includes('Check') ? '#1A3D28' : '#dc2626' }}>
              {message}
            </p>
          )}
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0ece2', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#bbb', fontFamily: 'monospace' }}>Private · Bayt Seedat · Doha</p>
        </div>
      </div>
    </div>
  )
}
