'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function MemoryClient() {
  return (
    <SidebarLayout title="BAYT OS — MEMORY" subtitle="The family archive">
      <PlaceholderPage
        icon="📸"
        layer="Memory Layer"
        title="Family Memory"
        arabic="الذاكرة"
        description="The Seedat family archive — milestones, stories, letters, and knowledge. A living record that will outlast us and give our children roots and legacy."
        modules={[
          { icon: '🏆', name: 'Milestones & Stories',  desc: 'First words, school firsts, adventures, and family moments logged and timestamped for posterity.',    status: 'building' },
          { icon: '✉️', name: 'Letters to Children',   desc: 'Muhammad and Camilla\'s letters to each child — to be read at 18, on wedding day, or whenever needed.', status: 'soon' },
          { icon: '📚', name: 'Knowledge Archive',      desc: 'Lessons learned, family wisdom, Islamic reminders, and insights worth preserving across generations.',  status: 'soon' },
          { icon: '📸', name: 'Photo Memories',         desc: 'Curated family photos by year and milestone — not a gallery, a story.',                               status: 'soon' },
          { icon: '🌳', name: 'Family Tree',            desc: 'The Seedat lineage — names, connections, origin stories, and the family\'s roots.',                   status: 'soon' },
          { icon: '🎙️', name: 'Voice Notes',           desc: 'Audio recordings — bedtime stories, Quran recitations, and messages from parents to children.',       status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
