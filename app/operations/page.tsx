import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OperationsClient from './operations-client'

export default async function OperationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <OperationsClient />
}
