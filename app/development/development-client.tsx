'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function DevelopmentClient() {
  return (
    <SidebarLayout title="BAYT OS — DEVELOPMENT" subtitle="Growing every dimension">
      <PlaceholderPage
        icon="📖"
        layer="Development Layer"
        title="Family Development"
        arabic="التطوير"
        description="The growth engine of Bayt Seedat — tracking progress across Deen, health, education, character, and entrepreneurship for every family member."
        modules={[
          { icon: '🕌', name: 'Deen',               desc: 'Salah logs, Quran tracking (Hifz + reading), Ilm notes, and weekly Islamic goals for every member.',       status: 'live', path: '/deen' },
          { icon: '💪', name: 'Health & Fitness',  desc: 'Exercise logs, sports progress (tennis, athletics, football), health goals, and family wellness tracker.',     status: 'live', path: '/fitness' },
          { icon: '📚', name: 'Education',         desc: 'Academic progress, reading logs, language learning (Arabic), coding, and extracurricular tracking.',          status: 'live', path: '/education' },
          { icon: '🌿', name: 'Character',         desc: 'Akhlāq tracking, good deed logs, gratitude journals, and character-building milestones.',                     status: 'live', path: '/character' },
          { icon: '💡', name: 'Entrepreneurship',  desc: 'Business ideas, mini-projects, pocket money lessons, and early entrepreneurship for the boys.',               status: 'live', path: '/entrepreneurship' },
          { icon: '📝', name: 'Reading & Books',   desc: 'Family reading list, book summaries, reading challenges, and knowledge archive.',                             status: 'live', path: '/reading' },
          { icon: '🧪', name: 'Assessments',       desc: 'Cognitive, EQ, AI Literacy, and Social Skills assessments — evidence-based, age-calibrated for every member.',status: 'live', path: '/assessments' },
          { icon: '🎯', name: 'Family Goals',      desc: 'Shared family goals, KPI dashboards, and quarterly reviews for the whole Seedat family.',                    status: 'live', path: '/family-goals' },
          { icon: '⭐', name: 'Contributions',     desc: 'Track each member's contributions, earn points, and unlock rewards for the family.',                         status: 'live', path: '/contributions' },
          { icon: '💪', name: 'Health & Fitness',    desc: 'Exercise logs, sports progress (tennis, athletics, football), health goals, and family wellness tracker.', status: 'soon' },
          { icon: '📚', name: 'Education & Skills',  desc: 'Academic progress, reading logs, language learning (Arabic), coding, and extracurricular tracking.',    status: 'soon' },
          { icon: '🌿', name: 'Character & Ethics',  desc: 'Akhlāq tracking, good deed logs, gratitude journals, and character-building milestones.',               status: 'soon' },
          { icon: '💡', name: 'Entrepreneurship',   desc: 'Business ideas, mini-projects, pocket money lessons, and early entrepreneurship for the boys.',          status: 'soon' },
          { icon: '📝', name: 'Reading & Books',    desc: 'Family reading list, book summaries, reading challenges, and knowledge archive.',                        status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
