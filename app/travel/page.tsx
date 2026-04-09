import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import TravelPlanner from './travel-client'

export default async function TravelPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="OPERATIONS · TRAVEL" subtitle="Trip planning, packing & Doha escapes">
      <TravelPlanner />
    </SidebarLayout>
  )
}
