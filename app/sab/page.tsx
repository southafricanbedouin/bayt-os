import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SouthAfricanBedouin from './sab-client'

export default async function SabPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="PROJECTS · DAD'S BOOK">
      <SouthAfricanBedouin />
    </SidebarLayout>
  )
}
