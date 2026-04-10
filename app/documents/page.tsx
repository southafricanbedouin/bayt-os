import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import DocumentsDashboard from './documents-client'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarLayout title="OFFICIAL DOCUMENTS">
      <DocumentsDashboard />
    </SidebarLayout>
  )
}
