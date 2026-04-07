import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DevelopmentClient from './development-client'

export default async function DevelopmentPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <DevelopmentClient />
}
