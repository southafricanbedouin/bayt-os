import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import MedicalHealth from './health-client'

export default async function HealthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="OPERATIONS · MEDICAL & HEALTH">
      <MedicalHealth />
    </SidebarLayout>
  )
}
