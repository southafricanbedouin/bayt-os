import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import ContributionsView from './contributions-client'

export default async function ContributionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="DEVELOPMENT · CONTRIBUTIONS">
      <ContributionsView />
    </SidebarLayout>
  )
}
