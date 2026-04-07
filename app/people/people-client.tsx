'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function PeopleClient() {
  return (
    <SidebarLayout title="BAYT OS — FAMILY" subtitle="The people at the centre">
      <PlaceholderPage
        icon="👨‍👩‍👧‍👦"
        layer="People Layer"
        title="The Seedat Family"
        arabic="الأسرة"
        description="Individual profiles, goals, and dashboards for every member of Bayt Seedat. Each person has their own space — age-appropriate for children."
        modules={[
          { icon: '🌙', name: 'Muhammad\'s Profile',  desc: 'Father · Founder · Goals, projects, reflections, and personal development tracker.',              status: 'live' },
          { icon: '🌸', name: 'Camilla\'s Profile',   desc: 'Mother · Co-Founder · Goals, projects, reflections, and personal development tracker.',           status: 'live' },
          { icon: '⚽', name: 'Yahya\'s Dashboard',   desc: 'Son · Age 11 · Football, academics, Quran progress, goals, and weekly check-in.',                 status: 'building' },
          { icon: '🏃', name: 'Isa\'s Dashboard',     desc: 'Son · Age 10 · Athletics, academics, Quran progress, goals, and weekly check-in.',                status: 'building' },
          { icon: '🎨', name: 'Linah\'s Dashboard',   desc: 'Daughter · Age 7 · Creative arts, Quran, reading, goals, and weekly check-in.',                   status: 'soon' },
          { icon: '⭐', name: 'Dana\'s Dashboard',    desc: 'Daughter · Age 6 · Early learning, Quran, drawing, goals, and weekly check-in.',                  status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
