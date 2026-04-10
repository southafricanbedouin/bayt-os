import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SchoolManagement from './school-client'

export default async function SchoolPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="OPERATIONS · SCHOOL">
      <SchoolManagement />
    </SidebarLayout>
  )
}
