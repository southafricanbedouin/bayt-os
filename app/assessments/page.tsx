import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import AssessmentsHub from './assessments-client'

export default async function AssessmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="DEVELOPMENT · ASSESSMENTS">
      <AssessmentsHub />
    </SidebarLayout>
  )
}
