'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function ConstitutionClient() {
  return (
    <SidebarLayout title="BAYT OS — CONSTITUTION" subtitle="The soul of the family">
      <PlaceholderPage
        icon="📜"
        layer="Constitution Layer"
        title="Family Constitution"
        arabic="الميثاق"
        description="The foundational layer of Bayt Seedat — the values, vision, and covenant that guide every decision and interaction within the family."
        modules={[
          { icon: '✍️', name: 'Family Manifesto',    desc: 'The written declaration of who the Seedat family is, what they stand for, and where they are going.',      status: 'building' },
          { icon: '⭐', name: 'Core Values',          desc: 'The 5–7 values that define character, guide behaviour, and form the family identity.',                     status: 'building' },
          { icon: '🔭', name: 'Family Vision',        desc: 'The long-term picture — where this family is headed in 5, 10, and 20 years.',                              status: 'soon' },
          { icon: '🤝', name: 'Sulh Protocol',        desc: 'The family\'s agreed process for resolving conflict, restoring relationships, and making peace.',           status: 'soon' },
          { icon: '🕌', name: 'Deen Framework',       desc: 'How Islam anchors the family — from Salah structure to akhlaaq standards to community contribution.',     status: 'soon' },
          { icon: '📖', name: 'Family Story',         desc: 'Where we came from — the lineage, history, and origin story that gives the children roots and identity.', status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
