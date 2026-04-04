import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get own profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile or not complete → send to builder
  if (!profile || !profile.profile_complete) {
    redirect('/profile-builder')
  }

  // Get all family profiles
  const { data: family } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, avatar_emoji, colour, role, profile_complete')
    .order('created_at')

  // Get own goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('owner_id', user.id)
    .eq('status', 'active')
    .order('created_at')

  return (
    <DashboardClient
      profile={profile}
      family={family || []}
      goals={goals || []}
      userId={user.id}
    />
  )
}
