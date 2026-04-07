import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConstitutionClient from './constitution-client'

export default async function ConstitutionPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <ConstitutionClient />
}
