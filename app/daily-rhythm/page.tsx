import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import DailyRhythm from './daily-rhythm-client'

export default async function DailyRhythmPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="RHYTHM · DAILY RHYTHM">
      <DailyRhythm />
    </SidebarLayout>
  )
}
