'use client'
import SidebarLayout from '@/app/components/sidebar-layout'
import PlaceholderPage from '@/app/components/placeholder-page'

export default function OperationsClient() {
  return (
    <SidebarLayout title="BAYT OS — OPERATIONS" subtitle="Running the household">
      <PlaceholderPage
        icon="🏡"
        layer="Operations Layer"
        title="Household Operations"
        arabic="الإدارة"
        description="Everything needed to run Bayt Seedat smoothly — from the weekly shop to travel planning. The logistics backbone of family life."
        modules={[
          { icon: '🛒', name: 'Shopping & Household', desc: 'Grocery lists, household supplies, recurring purchases, and spending tracker.',                    status: 'live', path: '/shopping' },
          { icon: '⚡', name: 'Utilities Tracker',    desc: 'B26 Al Reem Gardens, Al Wajba · Vodafone 2GBPS · Ooredoo mobile · electricity (Kahramaa) — monthly fixed and variable costs.',      status: 'live' },
          { icon: '🍽️', name: 'Meal Planning',        desc: 'Weekly meal planner, family recipe bank, halal restaurant finder in Doha, and dietary notes.',    status: 'soon' },
          { icon: '✈️', name: 'Travel Planning',      desc: 'Trip planning, itineraries, visa tracking, budget, packing lists — school holidays and family trips.', status: 'soon' },
          { icon: '🎡', name: 'Family Outings',       desc: 'Doha outings log, upcoming events, weekend planner, and family activity suggestions.',              status: 'soon' },
          { icon: '🚗', name: 'Transport & Vehicles', desc: 'Vehicle maintenance log, school run schedule, and driver coordination.',                           status: 'soon' },
          { icon: '💊', name: 'Medical & Health',     desc: 'Family health records, vaccination schedules, doctor appointments, and prescriptions.',             status: 'soon' },
          { icon: '🔁', name: 'Subscriptions',        desc: 'Monthly and annual subscriptions tracker — Netflix, gym, schools, clubs — with renewal reminders.', status: 'soon' },
          { icon: '🏫', name: 'School Management',    desc: 'Doha College & QFS homework, assignments, parent communication, and school admin.',                status: 'soon' },
        ]}
      />
    </SidebarLayout>
  )
}
