import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SavingsGoals from './savings-client'

export default async function SavingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="ECONOMY · SAVINGS" subtitle="Savings goals & progress tracker">
      <SavingsGoals />
    </SidebarLayout>
  )
}
