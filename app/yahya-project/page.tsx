import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import YahyaProject from './yahya-project-client'

export default async function YahyaProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="PROJECTS · YAHYA'S PROJECT">
      <YahyaProject />
    </SidebarLayout>
  )
}
