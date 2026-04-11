import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import UserProfile from './profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Look up this auth user's member_id and role from user_profiles
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('member_id, role')
    .eq('email', user.email)
    .single()

  const memberId  = profile?.member_id  ?? ''
  const isParent  = profile?.role === 'parent' || profile?.role === 'admin'

  return (
    <SidebarLayout title="MY PROFILE">
      <UserProfile memberId={memberId} isOwnProfile={true} isParent={isParent} />
    </SidebarLayout>
  )
}
