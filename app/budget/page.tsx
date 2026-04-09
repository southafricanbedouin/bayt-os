import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import BudgetPlanner from './budget-client'

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="ECONOMY · BUDGET" subtitle="Monthly budget & expense planning">
      <BudgetPlanner />
    </SidebarLayout>
  )
}
