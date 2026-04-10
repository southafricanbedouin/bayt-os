import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import HealthFitness from './fitness-client'

export default async function FitnessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="DEVELOPMENT · HEALTH & FITNESS">
      <HealthFitness />
    </SidebarLayout>
  )
}
