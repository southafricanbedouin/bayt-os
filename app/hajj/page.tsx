import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import HajjPlanning from './hajj-client'

export default async function HajjPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="PROJECTS · HAJJ PLANNING">
      <HajjPlanning />
    </SidebarLayout>
  )
}
