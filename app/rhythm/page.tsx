import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RhythmClient from './rhythm-client'

export default async function RhythmPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <RhythmClient />
}
