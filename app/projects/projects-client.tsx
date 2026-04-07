'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function ProjectsClient() {
  return (
    <SidebarLayout title="BAYT OS — PROJECTS" subtitle="Building together">
      <PlaceholderPage
        icon="🚀"
        layer="Projects Layer"
        title="Family Projects"
        arabic="المشاريع"
        description="Big family endeavours — from Hajj planning to child-led holiday projects. Projects give the family shared purpose and teach children how to build things."
        modules={[
          { icon: '🕋', name: 'Hajj Planning',           desc: 'The family\'s Hajj project — preparation, finances, logistics, and spiritual readiness.',           status: 'building' },
          { icon: '🌍', name: 'Summer Trip 2025',        desc: 'Family holiday planner — destination, budget, activities, and memories.',                           status: 'building' },
          { icon: '👦', name: 'Yahya\'s Project',        desc: 'Child-led project slot — Yahya builds, manages, and presents his own initiative.',                  status: 'soon' },
          { icon: '🏃', name: 'Isa\'s Project',          desc: 'Child-led project slot — Isa builds, manages, and presents his own initiative.',                    status: 'soon' },
          { icon: '🏡', name: 'Bayt Seedat App',         desc: 'The family OS itself — Phase 5 of the 40-day roadmap. Muhammad + the boys co-build.',               status: 'building' },
          { icon: '📖', name: 'Dad\'s Book (SAB)',       desc: 'The South African Bedouin — autobiography chapters, publishing timeline, and family contributions.', status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
