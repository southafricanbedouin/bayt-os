import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import Entrepreneurship from './entrepreneurship-client'

export default async function EntrepreneurshipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="DEVELOPMENT · ENTREPRENEURSHIP">
      <Entrepreneurship />
    </SidebarLayout>
  )
}
