import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import AnnualPlanning from './annual-planning-client'

export default async function AnnualPlanningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="RHYTHM · ANNUAL PLANNING">
      <AnnualPlanning />
    </SidebarLayout>
  )
}
