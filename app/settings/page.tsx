import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is parent/guardian
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, relationship')
    .eq('id', user.id)
    .single()

  const isParentOrGuardian = profile?.relationship && ['mother', 'father', 'parent', 'guardian'].includes(profile.relationship)

  if (!isParentOrGuardian) {
    redirect('/dashboard')
  }

  // Fetch all users
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, relationship, created_at')
    .order('created_at', { ascending: false })

  return (
    <SidebarLayout title="SETTINGS">
      <SettingsClient currentUser={profile} allProfiles={allProfiles || []} />
    </SidebarLayout>
  )
}
