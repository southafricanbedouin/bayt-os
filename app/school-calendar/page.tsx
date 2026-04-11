import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SchoolCalendar from './school-calendar-client'

export default async function SchoolCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="RHYTHM · SCHOOL CALENDAR">
      <SchoolCalendar />
    </SidebarLayout>
  )
}
