import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FamilyCoinClient from './family-coin-client'

export default async function FamilyCoinPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <FamilyCoinClient />
}
