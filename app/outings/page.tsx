import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import FamilyOutings from './outings-client'

export default async function OutingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="OPERATIONS · OUTINGS" subtitle="Family outings & Doha activity planner">
      <FamilyOutings />
    </SidebarLayout>
  )
}
