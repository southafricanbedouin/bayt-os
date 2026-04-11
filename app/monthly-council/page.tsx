import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import MonthlyCouncil from './monthly-council-client'

export default async function MonthlyCouncilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="RHYTHM · MONTHLY COUNCIL">
      <MonthlyCouncil />
    </SidebarLayout>
  )
}
