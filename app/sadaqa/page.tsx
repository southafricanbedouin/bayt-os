import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SadaqahLedger from './sadaqa-client'

export default async function SadaqahPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <SadaqahLedger />
}
