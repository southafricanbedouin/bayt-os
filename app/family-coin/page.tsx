import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import FamilyCoinClient from './family-coin-client'

export default async function FamilyCoinPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="ECONOMY · FAMILY COIN" subtitle="Family reward & coin system">
      <FamilyCoinClient />
    </SidebarLayout>
  )
}
