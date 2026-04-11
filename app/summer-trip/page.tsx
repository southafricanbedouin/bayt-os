import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SummerTrip from './summer-trip-client'

export default async function SummerTripPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="PROJECTS · SUMMER TRIP">
      <SummerTrip />
    </SidebarLayout>
  )
}
