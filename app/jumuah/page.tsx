import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import JummahReview from './jumuah-client'

export default async function JumuahPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="RHYTHM · JUMU'AH REVIEW">
      <JummahReview />
    </SidebarLayout>
  )
}
