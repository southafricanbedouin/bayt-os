import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EconomyClient from './economy-client'

export default async function EconomyPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <EconomyClient />
}
