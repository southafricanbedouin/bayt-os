import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemoryClient from './memory-client'

export default async function MemoryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <MemoryClient />
}
