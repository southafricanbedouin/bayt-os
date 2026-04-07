'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function RhythmClient() {
  return (
    <SidebarLayout title="BAYT OS — RHYTHM" subtitle="Structure creates freedom">
      <PlaceholderPage
        icon="🕐"
        layer="Rhythm Layer"
        title="Family Rhythm"
        arabic="النظام"
        description="The daily, weekly, monthly, and annual cadences that give the family structure. Salah-anchored rhythms that create predictability, reduce chaos, and build culture."
        modules={[
          { icon: '🌅', name: 'Daily Rhythm',        desc: 'Fajr → school → work → Asr → family time → Isha → sleep. The daily architecture anchored to Salah times.',  status: 'building' },
          { icon: '🕌', name: 'Jumu\'ah Review',     desc: 'The weekly family check-in — wins, struggles, gratitude, and intentions for the week ahead.',                 status: 'building' },
          { icon: '📋', name: 'Monthly Council',     desc: 'The Shura session — family decisions, goal reviews, and accountability for the month.',                       status: 'soon' },
          { icon: '📅', name: 'Annual Planning',     desc: 'Year-start intention setting, Ramadan preparation, school year planning, and legacy goal-setting.',           status: 'soon' },
          { icon: '⏰', name: 'Prayer Times',        desc: 'Live Doha Salah times — Fajr, Dhuhr, Asr, Maghrib, Isha — synced to the family calendar.',                  status: 'soon' },
          { icon: '📆', name: 'School Calendar',     desc: 'Doha College & QFS term dates, exam schedules, holidays, and school events in one view.',                    status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
