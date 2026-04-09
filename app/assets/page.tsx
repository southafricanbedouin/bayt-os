import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import AssetsRepository from './assets-client'

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <SidebarLayout title="ECONOMY · ASSETS" subtitle="Asset repository & portfolio tracker">
      <AssetsRepository />
    </SidebarLayout>
  )
}
