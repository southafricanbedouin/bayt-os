import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SavingsGoals from './savings-client'

export default async function SavingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <SavingsGoals />
}
