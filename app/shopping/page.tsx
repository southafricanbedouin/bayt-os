import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ShoppingHousehold from './shopping-client'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return <ShoppingHousehold />
}
