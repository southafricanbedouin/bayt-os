import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectsClient from './projects-client'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <ProjectsClient />
}
