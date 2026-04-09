import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarLayout from '@/app/components/sidebar-layout'
import MealPlanner from './meals-client'

export default async function MealsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return (
    <SidebarLayout title="OPERATIONS · MEALS" subtitle="Weekly meal planning & family recipe bank">
      <MealPlanner />
    </SidebarLayout>
  )
}
