import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import FamilyGoals from './family-goals-client'

export default async function FamilyGoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="DEVELOPMENT · FAMILY GOALS">
      <FamilyGoals />
    </SidebarLayout>
  )
}
