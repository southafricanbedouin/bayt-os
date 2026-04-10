import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import DeenTracker from './deen-client'

export default async function DeenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="DEVELOPMENT · DEEN">
      <DeenTracker />
    </SidebarLayout>
  )
}
