'use client'

import { useState } from 'react'

/**
 * BaytOS v1.1 Homepage - Spark-Inspired Design
 *
 * Design System:
 * - Aesthetic: Modern, polished, refined
 * - Colors: Soft pastels (blues, greens, pinks, yellows) + neutrals
 * - Typography: Clean sans-serif, readable hierarchy
 * - Spacing: 8px base unit, generous whitespace
 * - Motion: Subtle transitions (300ms ease-out)
 * - Icons: Custom SVG (20px, 1.5px stroke)
 * - Layout: Sidebar nav + main content area
 */

// ─────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────

const IconHome = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 10l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconBook = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
const IconWallet = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/><circle cx="18" cy="15" r="1" fill="currentColor"/></svg>
const IconTarget = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="9"/></svg>
const IconFamily = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="14" r="2.5"/><circle cx="19" cy="14" r="2.5"/><path d="M12 8v3M5 16v2M19 16v2M7.5 13h9"/></svg>
const IconChart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 3v18h18"/><path d="M18 17V9M13 17v-3M8 17V5"/></svg>
const IconCart = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="20" cy="21" r="1" fill="currentColor"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
const IconPlane = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 16.74v-3.2a2 2 0 00-1.5-1.94l-9.15-2.71a2 2 0 01-1.35-1.84v0a2 2 0 011.35-1.84l9.15-2.71A2 2 0 0122 3.46v3.2"/><path d="M2 8.5a4.5 4.5 0 007 3.87"/><path d="M2 15.5a4.5 4.5 0 007-3.87"/></svg>
const IconSavings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M19 14c0 2-3 4-7 4s-7-2-7-4"/><path d="M14 10c1-1 2-2 2-4 0-2-2-3-4-3-2 0-4 1-4 3 0 2 1 3 2 4"/><circle cx="6" cy="15" r="1" fill="currentColor"/><path d="M3 12h8"/></svg>
const IconBriefcase = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
const IconExplore = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M8 14l8-8M16 14l-8-8"/></svg>
const IconFavorite = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>

// ─────────────────────────────────────────────────────────────────────────
// MODULE CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────

interface ModuleCardProps {
  title: string
  description: string
  instructor: string
  modules: number
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Master'
  rating: number
  reviews: number
  bgColor: string
  icon: React.ReactNode
  href: string
}

function ModuleCard({ title, description, instructor, modules: moduleCount, duration, difficulty, rating, reviews, bgColor, icon, href }: ModuleCardProps) {
  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Master: 'bg-purple-100 text-purple-700'
  }

  return (
    <a href={href} className="block group">
      {/* Illustration/Icon Area */}
      <div className={`${bgColor} h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
        <div className="text-5xl opacity-60">{icon}</div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-600 mb-3">{instructor}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
          <span>{moduleCount} modules</span>
          <span>•</span>
          <span>{duration}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-900">{rating}</span>
            <span className="text-yellow-400">★</span>
            <span className="text-xs text-gray-600">({reviews})</span>
          </div>
        </div>
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// FAMILY MEMBER MENTOR CARD
// ─────────────────────────────────────────────────────────────────────────

interface FamilyMember {
  name: string
  role: string
  initials: string
  color: string
}

function FamilyMentorCard({ member }: { member: FamilyMember }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`${member.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
            {member.initials}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
            <p className="text-xs text-gray-600">{member.role}</p>
          </div>
        </div>
      </div>
      <button className="w-full px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
        Follow
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN HOMEPAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export default function HomepageV11() {
  const familyMembers: FamilyMember[] = [
    { name: 'Dad', role: 'Parent', initials: 'MS', color: 'bg-blue-500' },
    { name: 'Mom', role: 'Parent', initials: 'RR', color: 'bg-pink-500' },
    { name: 'Yahya', role: 'Eldest', initials: 'Y', color: 'bg-emerald-500' },
    { name: 'Isa', role: 'Child', initials: 'I', color: 'bg-amber-500' },
  ]

  const modules = [
    { title: 'Dashboard', description: 'Family overview', instructor: 'Quick Access', modules: 1, duration: 'Instant', difficulty: 'Beginner' as const, rating: 5.0, reviews: 0, bgColor: 'bg-blue-50', icon: '🏠', href: '/dashboard' },
    { title: 'Reading', description: 'Track goals', instructor: 'Learning Paths', modules: 12, duration: '4h 30m', difficulty: 'Intermediate' as const, rating: 4.8, reviews: 45, bgColor: 'bg-emerald-50', icon: '📚', href: '/reading' },
    { title: 'Economy', description: 'Manage finances', instructor: 'Financial Basics', modules: 8, duration: '3h', difficulty: 'Intermediate' as const, rating: 4.9, reviews: 67, bgColor: 'bg-amber-50', icon: '💰', href: '/economy' },
    { title: 'Goals', description: 'Personal goals', instructor: 'Goal Setting', modules: 6, duration: '2h 15m', difficulty: 'Beginner' as const, rating: 5.0, reviews: 23, bgColor: 'bg-pink-50', icon: '🎯', href: '/goals' },
    { title: 'Monthly Council', description: 'Family meetings', instructor: 'Family Time', modules: 4, duration: '1h 30m', difficulty: 'Beginner' as const, rating: 4.7, reviews: 34, bgColor: 'bg-purple-50', icon: '👨‍👩‍👧‍👦', href: '/monthly-council' },
    { title: 'Assessments', description: 'Track growth', instructor: 'Progress Tracking', modules: 10, duration: '3h 45m', difficulty: 'Master' as const, rating: 4.6, reviews: 56, bgColor: 'bg-cyan-50', icon: '📊', href: '/assessments' },
    { title: 'Shopping', description: 'Shopping lists', instructor: 'Household', modules: 5, duration: '1h 20m', difficulty: 'Beginner' as const, rating: 4.8, reviews: 28, bgColor: 'bg-orange-50', icon: '🛒', href: '/shopping' },
    { title: 'Transport', description: 'Travel planning', instructor: 'Adventures', modules: 7, duration: '2h 45m', difficulty: 'Intermediate' as const, rating: 4.9, reviews: 41, bgColor: 'bg-indigo-50', icon: '✈️', href: '/transport' },
    { title: 'Savings', description: 'Save & invest', instructor: 'Wealth Building', modules: 9, duration: '3h 20m', difficulty: 'Intermediate' as const, rating: 4.7, reviews: 52, bgColor: 'bg-teal-50', icon: '🐷', href: '/savings' },
    { title: 'Entrepreneurship', description: 'Business ideas', instructor: 'Business Basics', modules: 11, duration: '4h', difficulty: 'Master' as const, rating: 5.0, reviews: 73, bgColor: 'bg-rose-50', icon: '💼', href: '/entrepreneurship' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ─────────────────────────────────────────────────────────────────────────
          SIDEBAR
          ───────────────────────────────────────────────────────────────────────── */}

      <aside className="w-60 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">BAYT OS</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          {/* General */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">General</p>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"><IconHome /> Overview</a></li>
              <li><a href="#" className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg"><IconExplore /> Explore</a></li>
              <li><a href="#" className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg"><IconHome /> My Courses</a></li>
              <li><a href="#" className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg"><IconFavorite /> Favorite</a></li>
            </ul>
          </div>

          {/* Family */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Family</p>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg block">Top Members</a></li>
              <li><a href="#" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg block">Followed</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Resources</p>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg block">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg block">Settings</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────────────
          MAIN CONTENT
          ───────────────────────────────────────────────────────────────────────── */}

      <main className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              Upgrade to Pro
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <IconSettings />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </header>

        <div className="p-8">
          {/* Search & Filters */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search life systems..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button className="text-sm text-gray-700 hover:text-gray-900">Level</button>
              <button className="text-sm text-gray-700 hover:text-gray-900">Category</button>
              <button className="text-sm text-gray-700 hover:text-gray-900">Sort by</button>
            </div>
          </div>

          {/* Family Members Section */}
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4">Family Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {familyMembers.map((member) => (
                <FamilyMentorCard key={member.initials} member={member} />
              ))}
            </div>
          </div>

          {/* Modules/Courses Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-6">Life Systems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.href}
                  title={module.title}
                  description={module.description}
                  instructor={module.instructor}
                  modules={module.modules}
                  duration={module.duration}
                  difficulty={module.difficulty}
                  rating={module.rating}
                  reviews={module.reviews}
                  bgColor={module.bgColor}
                  icon={module.icon}
                  href={module.href}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
