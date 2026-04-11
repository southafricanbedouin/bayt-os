import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import BaytOSProject from './bayt-os-project-client'

export default async function BaytOSProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="PROJECTS · BAYT SEEDAT APP">
      <BaytOSProject />
    </SidebarLayout>
  )
}
