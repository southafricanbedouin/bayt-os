import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import FamilyForum from './forum-client'

export default async function ForumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user profile to get their member ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, relationship')
    .eq('id', user.id)
    .single()

  const memberId = profile?.id || user.id

  return (
    <SidebarLayout title="FAMILY FORUM">
      <FamilyForum currentUserId={memberId} />
    </SidebarLayout>
  )
}
