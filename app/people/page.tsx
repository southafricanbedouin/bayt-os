import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PeopleClient from './people-client'

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <PeopleClient />
}
