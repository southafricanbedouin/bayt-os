// app/milestones/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import MilestonesClient from './milestones-client'

export default async function MilestonesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <SidebarLayout title="MEMORY · MILESTONES" subtitle="Firsts, adventures, and timestamped memories">
      <MilestonesClient />
    </SidebarLayout>
  )
}