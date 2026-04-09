import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SadaqahLedger from './sadaqa-client'

export default async function SadaqahPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="ECONOMY · SADAQAH" subtitle="Charity & giving tracker">
      <SadaqahLedger />
    </SidebarLayout>
  )
}
