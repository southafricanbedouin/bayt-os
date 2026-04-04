'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bayt-cream p-4">
      <Card className="w-full max-w-md border-bayt-rule">
        <CardHeader className="space-y-1 text-center">
          <div className="font-arabic text-4xl text-bayt-gold mb-2">بيت</div>
          <CardTitle className="font-mono text-sm tracking-widest text-bayt-gold-dim">
            BAYT OS · v0.1
          </CardTitle>
          <CardDescription className="font-mono text-xs tracking-wide text-bayt-grey">
            Seedat Family · Doha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-bayt-black">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="muhammad@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-bayt-forest border-bayt-rule"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-bayt-green hover:bg-bayt-midgreen text-white"
              disabled={loading}
            >
              {loading ? 'Sending magic link...' : 'Sign In with Magic Link'}
            </Button>
            {message && (
              <p className={`text-sm text-center ${message.includes('Check') ? 'text-bayt-green' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
          <div className="mt-6 pt-6 border-t border-bayt-rule">
            <p className="text-xs text-center text-bayt-grey font-mono">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
