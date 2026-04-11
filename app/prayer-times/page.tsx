import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import PrayerTimes from './prayer-times-client'

export default async function PrayerTimesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="RHYTHM · PRAYER TIMES">
      <PrayerTimes />
    </SidebarLayout>
  )
}
