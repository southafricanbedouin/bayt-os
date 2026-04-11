import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import IsaProject from './isa-project-client'

export default async function IsaProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="PROJECTS · ISA'S PROJECT">
      <IsaProject />
    </SidebarLayout>
  )
}
