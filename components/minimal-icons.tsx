/**
 * Minimal High-Contrast SVG Icons (24px, 2px stroke)
 * Black & White only - Maximum clarity and visibility
 */

export const MinimalIcons = {
  // Dashboard / Home - Simple house with accent
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 10l9-7 9 7M5 12v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
      <path d="M9 15h6v5H9z" />
    </svg>
  ),

  // Reading - Open book, clean lines
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M10 5v12" />
    </svg>
  ),

  // Economy / Wallet - Minimal wallet shape
  Wallet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
      <circle cx="18" cy="15" r="2" />
    </svg>
  ),

  // Goals / Target - Clean concentric circles
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),

  // Family / Council - Three connected circles (family)
  Family: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="14" r="2.5" />
      <circle cx="19" cy="14" r="2.5" />
      <path d="M12 8v3M5 16v2M19 16v2M7.5 13h9" />
    </svg>
  ),

  // Assessments / Chart - Bar chart
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17v-3M8 17V5" />
    </svg>
  ),

  // Shopping / Cart - Shopping cart
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="9" cy="21" r="1" fill="currentColor" />
      <circle cx="20" cy="21" r="1" fill="currentColor" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),

  // Transport / Plane - Minimal airplane
  Plane: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M22 16.74v-3.2a2 2 0 00-1.5-1.94l-9.15-2.71a2 2 0 01-1.35-1.84v0a2 2 0 011.35-1.84l9.15-2.71A2 2 0 0122 3.46v3.2" />
      <path d="M2 8.5a4.5 4.5 0 007 3.87" />
      <path d="M2 15.5a4.5 4.5 0 007-3.87" />
    </svg>
  ),

  // Savings / Piggy Bank - Simplified piggy bank
  Savings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M19 14c0 2-3 4-7 4s-7-2-7-4" />
      <path d="M14 10c1-1 2-2 2-4 0-2-2-3-4-3-2 0-4 1-4 3 0 2 1 3 2 4" />
      <circle cx="6" cy="15" r="1" fill="currentColor" />
      <path d="M3 12h8" />
    </svg>
  ),

  // Entrepreneurship / Briefcase - Minimal briefcase
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <path d="M12 11v4" />
    </svg>
  ),

  // Settings - Gear
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24" />
    </svg>
  ),

  // Menu - Hamburger
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
}
