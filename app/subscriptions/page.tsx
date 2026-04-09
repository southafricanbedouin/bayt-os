import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubscriptionsTracker from './subscriptions-client'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <SubscriptionsTracker />
}
