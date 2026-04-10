// app/documents/documents-client.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  green:     '#1a3d28',
  midgreen:  '#245235',
  forest:    '#f0ebe0',
  gold:      '#c9a84c',
  goldDim:   '#9b7d38',
  goldPale:  '#f0e4c0',
  cream:     '#faf8f2',
  white:     '#ffffff',
  grey:      '#6b7c6e',
  rule:      '#ddd8cc',
  ruleLight: '#e8e3d8',
  text:      '#0d1a0f',
  orange:    '#e07b39',
  red:       '#c0392b',
  blue:      '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

// ── Types & Constants ─────────────────────────────────────────────────────
type DocType =
  | 'passport'
  | 'sa_id'
  | 'qid'
  | 'q_license'
  | 'driving_license'
  | 'hamad_card'
  | 'visa'
  | 'birth_certificate'
  | 'national_certificate'
  | 'other'

const DOC_TYPE_LABELS: Record<DocType, string> = {
  passport:             'Passport',
  sa_id:                'SA ID',
  qid:                  'QID',
  q_license:            'Q Licence',
  driving_license:      'Driving Licence',
  hamad_card:           'Hamad Card',
  visa:                 'Visa',
  birth_certificate:    'Birth Certificate',
  national_certificate: 'National Certificate',
  other:                'Other',
}

const DOC_TYPE_ICON: Record<DocType, string> = {
  passport:             '🛂',
  sa_id:                '🪪',
  qid:                  '🪪',
  q_license:            '🏥',
  driving_license:      '🚗',
  hamad_card:           '🏥',
  visa:                 '✈️',
  birth_certificate:    '📜',
  national_certificate: '🏅',
  other:                '📄',
}

interface FamilyDocument {
  id: string
  member_id: string
  doc_type: DocType
  doc_number: string
  country: string
  issued_date: string | null
  expiry_date: string | null
  is_current: boolean
  drive_link: string | null
  notes: string | null
  created_at?: string
}

const FAMILY_MEMBERS = [
  { id: 'muhammad', name: 'Muhammad', emoji: '👨', role: 'parent' },
  { id: 'camilla',  name: 'Camilla',  emoji: '👩', role: 'parent' },
  { id: 'yahya',    name: 'Yahya',    emoji: '🧒', role: 'child'  },
  { id: 'isa',      name: 'Isa',      emoji: '🧒', role: 'child'  },
  { id: 'linah',    name: 'Linah',    emoji: '👧', role: 'child'  },
  { id: 'dana',     name: 'Dana',     emoji: '👧', role: 'child'  },
]

const DEFAULT_DOCS: Omit<FamilyDocument, 'created_at'>[] = [
  // ── MUHAMMAD ──────────────────────────────────────────────
  { id: 'muh-pp-1',  member_id: 'muhammad', doc_type: 'passport',          doc_number: 'A05617498',      country: 'ZA', issued_date: '2016-10-12', expiry_date: '2026-10-11', is_current: true,  drive_link: null, notes: null },
  { id: 'muh-pp-2',  member_id: 'muhammad', doc_type: 'passport',          doc_number: '470948853',      country: 'ZA', issued_date: null,         expiry_date: '2017-02-12', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'muh-pp-3',  member_id: 'muhammad', doc_type: 'passport',          doc_number: 'Unknown',        country: 'ZA', issued_date: '2024-11-12', expiry_date: '2034-11-11', is_current: true,  drive_link: null, notes: 'New SA passport' },
  { id: 'muh-id',    member_id: 'muhammad', doc_type: 'sa_id',             doc_number: '8911275075083',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'muh-qid',   member_id: 'muhammad', doc_type: 'qid',               doc_number: '28971000008',    country: 'QA', issued_date: null,         expiry_date: '2026-01-28', is_current: true,  drive_link: null, notes: null },
  { id: 'muh-ql',    member_id: 'muhammad', doc_type: 'q_license',         doc_number: '',               country: 'QA', issued_date: null,         expiry_date: '2026-04-10', is_current: true,  drive_link: null, notes: null },
  { id: 'muh-hc',    member_id: 'muhammad', doc_type: 'hamad_card',        doc_number: '',               country: 'QA', issued_date: null,         expiry_date: '2026-04-10', is_current: true,  drive_link: null, notes: null },

  // ── CAMILLA ───────────────────────────────────────────────
  { id: 'cam-pp-1',  member_id: 'camilla', doc_type: 'passport',           doc_number: 'M00343006',      country: 'ZA', issued_date: '2021-03-10', expiry_date: '2031-03-09', is_current: true,  drive_link: null, notes: null },
  { id: 'cam-pp-2',  member_id: 'camilla', doc_type: 'passport',           doc_number: 'A01591971',      country: 'ZA', issued_date: null,         expiry_date: '2021-03-01', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'cam-id',    member_id: 'camilla', doc_type: 'sa_id',              doc_number: '9011030342081',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'cam-qid',   member_id: 'camilla', doc_type: 'qid',                doc_number: '29071000221',    country: 'QA', issued_date: null,         expiry_date: '2026-01-28', is_current: true,  drive_link: null, notes: null },
  { id: 'cam-dl',    member_id: 'camilla', doc_type: 'driving_license',    doc_number: '40630010XL2R',   country: 'ZA', issued_date: null,         expiry_date: '2021-10-04', is_current: false, drive_link: null, notes: 'Expired RSA licence' },

  // ── YAHYA ─────────────────────────────────────────────────
  { id: 'yah-pp-1',  member_id: 'yahya', doc_type: 'passport',             doc_number: 'A07912686',      country: 'ZA', issued_date: '2024-02-23', expiry_date: '2029-02-22', is_current: true,  drive_link: null, notes: null },
  { id: 'yah-pp-2',  member_id: 'yahya', doc_type: 'passport',             doc_number: 'A03565622',      country: 'ZA', issued_date: null,         expiry_date: '2020-01-20', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'yah-pp-3',  member_id: 'yahya', doc_type: 'passport',             doc_number: 'A07304119',      country: 'ZA', issued_date: '2019-07-31', expiry_date: '2024-07-30', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'yah-id',    member_id: 'yahya', doc_type: 'sa_id',                doc_number: '1405205727084',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'yah-qid',   member_id: 'yahya', doc_type: 'qid',                  doc_number: '31471000058',    country: 'QA', issued_date: null,         expiry_date: '2027-01-28', is_current: true,  drive_link: null, notes: null },

  // ── ISA ───────────────────────────────────────────────────
  { id: 'isa-pp-1',  member_id: 'isa', doc_type: 'passport',               doc_number: 'A13032802',      country: 'ZA', issued_date: '2024-11-03', expiry_date: '2029-11-02', is_current: true,  drive_link: null, notes: null },
  { id: 'isa-pp-2',  member_id: 'isa', doc_type: 'passport',               doc_number: 'A03837568',      country: 'ZA', issued_date: '2016-10-12', expiry_date: '2021-10-11', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'isa-pp-3',  member_id: 'isa', doc_type: 'passport',               doc_number: 'A07462887',      country: 'ZA', issued_date: '2021-03-23', expiry_date: '2026-03-22', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'isa-id',    member_id: 'isa', doc_type: 'sa_id',                  doc_number: '1510035594081',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'isa-qid',   member_id: 'isa', doc_type: 'qid',                    doc_number: '31571000048',    country: 'QA', issued_date: null,         expiry_date: '2026-01-28', is_current: true,  drive_link: null, notes: null },

  // ── LINAH ─────────────────────────────────────────────────
  { id: 'lin-pp-1',  member_id: 'linah', doc_type: 'passport',             doc_number: 'A07716147',      country: 'ZA', issued_date: '2022-12-12', expiry_date: '2027-12-11', is_current: true,  drive_link: null, notes: null },
  { id: 'lin-pp-2',  member_id: 'linah', doc_type: 'passport',             doc_number: 'A07122101',      country: 'ZA', issued_date: '2018-08-29', expiry_date: '2023-08-28', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'lin-id',    member_id: 'linah', doc_type: 'sa_id',                doc_number: '1805291535087',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'lin-qid',   member_id: 'linah', doc_type: 'qid',                  doc_number: '3187100015',     country: 'QA', issued_date: null,         expiry_date: '2027-07-18', is_current: true,  drive_link: null, notes: null },

  // ── DANA ──────────────────────────────────────────────────
  { id: 'dan-pp-1',  member_id: 'dana', doc_type: 'passport',              doc_number: 'A13076295',      country: 'ZA', issued_date: '2025-01-02', expiry_date: '2030-01-01', is_current: true,  drive_link: null, notes: null },
  { id: 'dan-pp-2',  member_id: 'dana', doc_type: 'passport',              doc_number: 'A07424828',      country: 'ZA', issued_date: '2020-08-18', expiry_date: '2025-08-17', is_current: false, drive_link: null, notes: 'Archive' },
  { id: 'dan-id',    member_id: 'dana', doc_type: 'sa_id',                 doc_number: '2002221303088',  country: 'ZA', issued_date: null,         expiry_date: null,         is_current: true,  drive_link: null, notes: null },
  { id: 'dan-qid',   member_id: 'dana', doc_type: 'qid',                   doc_number: '32071000009',    country: 'QA', issued_date: null,         expiry_date: '2026-10-22', is_current: true,  drive_link: null, notes: null },
]

const DRIVE_FOLDERS = [
  { id: 'passports',            label: 'Passports',            icon: '📁' },
  { id: 'sa_ids',               label: 'SA IDs',               icon: '📁' },
  { id: 'birth_certificates',   label: 'Birth Certificates',   icon: '📁' },
  { id: 'qids',                 label: 'QIDs',                 icon: '📁' },
  { id: 'visas',                label: 'Visas',                icon: '📁' },
  { id: 'national_certificates',label: 'National Certs',       icon: '📁' },
  { id: 'driving_licenses',     label: 'Driving Licenses',     icon: '📁' },
  { id: 'attested_documents',   label: 'Attested Docs',        icon: '📁' },
  { id: 'hamad_cards',          label: 'Hamad/Medical',        icon: '📁' },
  { id: 'other',                label: 'Other Family Docs',    icon: '📁' },
]

// ── Helpers ───────────────────────────────────────────────────────────────
function docStatus(expiryDate: string | null): 'expired' | 'urgent' | 'soon' | 'ok' | 'none' {
  if (!expiryDate) return 'none'
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  if (days < 0)   return 'expired'
  if (days < 90)  return 'urgent'
  if (days < 365) return 'soon'
  return 'ok'
}

const STATUS_COLOUR = {
  expired: C.red,
  urgent:  C.orange,
  soon:    C.gold,
  ok:      C.green,
  none:    C.grey,
}

const STATUS_LABEL = {
  expired: 'EXPIRED',
  urgent:  'URGENT',
  soon:    'RENEW SOON',
  ok:      'VALID',
  none:    'NO DATE',
}

const pillStyle = (status: ReturnType<typeof docStatus>) => ({
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: '3px',
  fontSize: '0.65rem',
  fontFamily: F_MONO,
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: C.white,
  background: STATUS_COLOUR[status],
})

function daysToExpiry(expiry: string | null): number | null {
  if (!expiry) return null
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
}

function applyByDate(expiry: string | null, docType: DocType): string | null {
  if (!expiry) return null
  const months = docType === 'passport' ? 6 : 3
  const d = new Date(expiry)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split('T')[0]
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function countryFlag(code: string): string {
  const flags: Record<string, string> = { ZA: '🇿🇦', QA: '🇶🇦', UK: '🇬🇧', US: '🇺🇸' }
  return flags[code] ?? '🌍'
}

function maskDoc(number: string, show: boolean): string {
  if (!number || number === 'Unknown') return number || '—'
  if (show) return number
  if (number.length <= 3) return '***'
  return number.substring(0, 3) + '•'.repeat(number.length - 3)
}

// ── Components ────────────────────────────────────────────────────────────
export default function DocumentsDashboard() {
  const supabase = createClient()
  
  const [tab, setTab] = useState<'alerts' | 'members' | 'all' | 'drive'>('alerts')
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<FamilyDocument[]>([])
  const [driveLinks, setDriveLinks] = useState<Record<string, string>>({})
  
  const [unmasked, setUnmasked] = useState<Record<string, boolean>>({})
  
  const [activeMember, setActiveMember] = useState('muhammad')
  const [showArchive, setShowArchive] = useState(false)
  
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterMember, setFilterMember] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [editingDoc, setEditingDoc] = useState<Partial<FamilyDocument> | null>(null)

  // ── Init & Fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data } = await supabase.from('family_documents').select('*')
      
      let docsToUse = DEFAULT_DOCS as FamilyDocument[]
      if (data && data.length > 0) {
        docsToUse = data
      } else {
        const ls = localStorage.getItem('bayt-documents-v1')
        if (ls) docsToUse = JSON.parse(ls)
      }
      
      // Sort logic: current first, then expiry (soonest first)
      docsToUse.sort((a, b) => {
        if (a.is_current !== b.is_current) return a.is_current ? -1 : 1
        const aExp = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity
        const bExp = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity
        return aExp - bExp
      })
      
      setDocuments(docsToUse)
      
      const lsLinks = localStorage.getItem('bayt-drive-links-v1')
      if (lsLinks) setDriveLinks(JSON.parse(lsLinks))
      
      // Default tab based on urgency
      const hasUrgent = docsToUse.some(d => d.is_current && ['expired', 'urgent', 'soon'].includes(docStatus(d.expiry_date)))
      setTab(hasUrgent ? 'alerts' : 'members')
      
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // ── Save & Actions ──────────────────────────────────────────────────────
  const saveDocument = async () => {
    if (!editingDoc || !editingDoc.member_id || !editingDoc.doc_type) return
    
    const docToSave: FamilyDocument = {
      id: editingDoc.id || `doc-${Date.now()}`,
      member_id: editingDoc.member_id,
      doc_type: editingDoc.doc_type as DocType,
      doc_number: editingDoc.doc_number || '',
      country: editingDoc.country || 'ZA',
      issued_date: editingDoc.issued_date || null,
      expiry_date: editingDoc.expiry_date || null,
      is_current: editingDoc.is_current ?? true,
      drive_link: editingDoc.drive_link || null,
      notes: editingDoc.notes || null,
    }

    const updated = editingDoc.id 
      ? documents.map(d => d.id === editingDoc.id ? docToSave : d)
      : [docToSave, ...documents]
      
    // Re-sort
    updated.sort((a, b) => {
      if (a.is_current !== b.is_current) return a.is_current ? -1 : 1
      const aExp = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity
      const bExp = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity
      return aExp - bExp
    })

    setDocuments(updated)
    localStorage.setItem('bayt-documents-v1', JSON.stringify(updated))
    setEditingDoc(null)

    try {
      await supabase.from('family_documents').upsert(docToSave)
    } catch (e) {}
  }

  const archiveDocument = () => {
    if (!editingDoc || !editingDoc.id) return
    setEditingDoc({ ...editingDoc, is_current: false })
  }

  const updateDriveLink = (key: string, val: string) => {
    const updated = { ...driveLinks, [key]: val }
    setDriveLinks(updated)
    localStorage.setItem('bayt-drive-links-v1', JSON.stringify(updated))
  }

  const toggleMask = (id: string) => {
    setUnmasked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ── Computations ────────────────────────────────────────────────────────
  const currentDocs = documents.filter(d => d.is_current)
  const alerts = currentDocs.filter(d => ['expired', 'urgent', 'soon'].includes(docStatus(d.expiry_date)))
  
  const stats = {
    expired: currentDocs.filter(d => docStatus(d.expiry_date) === 'expired').length,
    urgent:  currentDocs.filter(d => docStatus(d.expiry_date) === 'urgent').length,
    soon:    currentDocs.filter(d => docStatus(d.expiry_date) === 'soon').length,
    ok:      currentDocs.filter(d => docStatus(d.expiry_date) === 'ok').length,
  }

  const filteredAllDocs = documents.filter(d => {
    if (!showArchive && !d.is_current) return false
    if (filterStatus !== 'All' && docStatus(d.expiry_date) !== filterStatus.toLowerCase()) return false
    if (filterMember !== 'All' && d.member_id !== filterMember) return false
    if (filterType !== 'All' && d.doc_type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!d.doc_number?.toLowerCase().includes(q) && !FAMILY_MEMBERS.find(m => m.id === d.member_id)?.name.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Vault opening...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: F_SANS }}>
      {/* HEADER */}
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · ADMIN</div>
          <h1 style={{ margin: '4px 0', fontSize: '2rem', fontWeight: 300 }}>Official Documents</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>المستندات الرسمية</div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: stats.expired > 0 ? C.red : C.goldDim }}>{stats.expired}</div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>EXPIRED</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: stats.urgent > 0 ? C.orange : C.goldDim }}>{stats.urgent}</div>
            <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>URGENT</div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'alerts', label: '🚨 Alerts' },
          { id: 'members', label: '👨‍👩‍👧‍👦 By Member' },
          { id: 'all', label: '📋 All Documents' },
          { id: 'drive', label: '🗂️ Drive Links' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id as any)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px', position: 'relative' }}>
        
        {/* TAB 1: ALERTS */}
        {tab === 'alerts' && (
          <div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '2rem', fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey }}>
              <span style={{ cursor: 'pointer', color: stats.expired > 0 ? C.red : C.grey }}>[{stats.expired}] Expired</span>
              <span>·</span>
              <span style={{ cursor: 'pointer', color: stats.urgent > 0 ? C.orange : C.grey }}>[{stats.urgent}] Urgent (&lt;90 days)</span>
              <span>·</span>
              <span style={{ cursor: 'pointer', color: stats.soon > 0 ? C.goldDim : C.grey }}>[{stats.soon}] Due this year</span>
              <span>·</span>
              <span>[{stats.ok}] All valid</span>
            </div>

            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: C.cream, borderRadius: '8px', border: `1px dashed ${C.green}` }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                <div style={{ color: C.green, fontWeight: 600 }}>All documents are in order.</div>
                <div style={{ fontSize: '0.85rem', color: C.grey, marginTop: '8px' }}>Rest easy. Nothing requires immediate attention.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {alerts.map(doc => {
                  const member = FAMILY_MEMBERS.find(m => m.id === doc.member_id)
                  const status = docStatus(doc.expiry_date)
                  const days = daysToExpiry(doc.expiry_date)
                  const applyDate = applyByDate(doc.expiry_date, doc.doc_type)
                  
                  return (
                    <div key={doc.id} style={{ border: `1px solid ${STATUS_COLOUR[status]}`, borderRadius: '8px', padding: '1.5rem', background: C.white, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{member?.emoji}</span>
                          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{member?.name}</span>
                        </div>
                        <span style={pillStyle(status)}>{STATUS_LABEL[status]}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{DOC_TYPE_ICON[doc.doc_type]}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{DOC_TYPE_LABELS[doc.doc_type]}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO }}>
                            {countryFlag(doc.country)} {maskDoc(doc.doc_number, unmasked[doc.id] || false)}
                            <button onClick={() => toggleMask(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}>👁️</button>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: C.cream, padding: '12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        {status === 'expired' ? (
                          <div style={{ color: C.red, fontWeight: 600 }}>Expired {Math.abs(days || 0)} days ago · {fmtDate(doc.expiry_date)}</div>
                        ) : (
                          <div style={{ color: STATUS_COLOUR[status], fontWeight: 600 }}>Expires in {days} days · {fmtDate(doc.expiry_date)}</div>
                        )}
                        {status !== 'expired' && applyDate && (
                          <div style={{ marginTop: '6px', color: C.text }}>💡 Apply from: <strong>{fmtDate(applyDate)}</strong></div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                        {doc.drive_link ? (
                          <a href={doc.drive_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '6px 12px', border: `1px solid ${C.rule}`, borderRadius: '4px', color: C.text, fontFamily: F_MONO }}>Drive →</a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: C.grey, fontStyle: 'italic', padding: '6px 0' }}>No scan linked</span>
                        )}
                        <button onClick={() => setEditingDoc(doc)} style={{ fontSize: '0.8rem', padding: '6px 12px', border: `1px solid ${C.rule}`, borderRadius: '4px', cursor: 'pointer', background: 'none', fontFamily: F_MONO }}>Edit</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BY MEMBER */}
        {tab === 'members' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.ruleLight}` }}>
              {FAMILY_MEMBERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveMember(m.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: `1px solid ${activeMember === m.id ? C.green : C.ruleLight}`,
                    background: activeMember === m.id ? C.green : C.white,
                    color: activeMember === m.id ? C.white : C.text,
                    cursor: 'pointer', fontFamily: F_MONO, fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {m.emoji} {m.name.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: C.grey, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={showArchive} onChange={e => setShowArchive(e.target.checked)} />
                Show archived documents
              </label>
              <button 
                onClick={() => setEditingDoc({ member_id: activeMember, doc_type: 'passport', country: 'ZA', is_current: true })} 
                style={{ background: C.gold, color: C.white, border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}
              >
                + ADD DOCUMENT
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.filter(d => d.member_id === activeMember && (showArchive || d.is_current)).map(doc => {
                const status = docStatus(doc.expiry_date)
                const isArchived = !doc.is_current
                
                return (
                  <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: '2rem 2fr 1fr 1fr 1.5fr 1fr', alignItems: 'center', padding: '1rem', background: isArchived ? C.forest : C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', opacity: isArchived ? 0.7 : 1 }}>
                    <div style={{ fontSize: '1.5rem' }}>{DOC_TYPE_ICON[doc.doc_type]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: isArchived ? 'line-through' : 'none' }}>{DOC_TYPE_LABELS[doc.doc_type]}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: C.grey, fontFamily: F_MONO, marginTop: '2px' }}>
                        {countryFlag(doc.country)} {maskDoc(doc.doc_number, unmasked[doc.id] || false)}
                        <button onClick={() => toggleMask(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}>👁️</button>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', fontFamily: F_MONO }}>
                      <div style={{ color: C.grey }}>Iss: {fmtDate(doc.issued_date)}</div>
                      <div style={{ color: C.text }}>Exp: {fmtDate(doc.expiry_date)}</div>
                    </div>

                    <div>
                      {isArchived ? <span style={pillStyle('none')}>ARCHIVED</span> : <span style={pillStyle(status)}>{STATUS_LABEL[status]}</span>}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: C.grey }}>
                      {(!isArchived && doc.expiry_date) ? (
                        <>
                          <div style={{ color: STATUS_COLOUR[status], fontWeight: 600, fontFamily: F_MONO }}>{Math.abs(daysToExpiry(doc.expiry_date) || 0)} days {status === 'expired' ? 'ago' : 'left'}</div>
                          {applyByDate(doc.expiry_date, doc.doc_type) && <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>Apply: {fmtDate(applyByDate(doc.expiry_date, doc.doc_type))}</div>}
                        </>
                      ) : '—'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {doc.drive_link && <a href={doc.drive_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', textDecoration: 'none', background: C.cream, border: `1px solid ${C.rule}`, padding: '4px 8px', borderRadius: '4px', color: C.text }}>Drive</a>}
                      <button onClick={() => setEditingDoc(doc)} style={{ fontSize: '0.8rem', background: 'none', border: `1px solid ${C.rule}`, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    </div>
                  </div>
                )
              })}
              {documents.filter(d => d.member_id === activeMember).length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: C.grey, background: C.cream, borderRadius: '8px' }}>
                  No documents found for this member.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ALL DOCUMENTS */}
        {tab === 'all' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
                <option value="All">All Statuses</option>
                <option value="Expired">Expired</option>
                <option value="Urgent">Urgent</option>
                <option value="Soon">Renew Soon</option>
                <option value="Ok">Valid</option>
              </select>
              <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={inputStyle}>
                <option value="All">All Members</option>
                {FAMILY_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
                <option value="All">All Types</option>
                {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <input type="text" placeholder="Search number or name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{...inputStyle, flex: 1}} />
              <label style={{ fontSize: '0.8rem', color: C.grey, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
                <input type="checkbox" checked={showArchive} onChange={e => setShowArchive(e.target.checked)} /> Show Archived
              </label>
            </div>

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.5fr', background: C.forest, padding: '10px 16px', fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Member</div><div>Document</div><div>Issued/Expires</div><div>Status</div><div>Days Left</div><div style={{textAlign: 'right'}}>Actions</div>
              </div>
              {filteredAllDocs.map((doc, i) => {
                const member = FAMILY_MEMBERS.find(m => m.id === doc.member_id)
                const status = docStatus(doc.expiry_date)
                const isArchived = !doc.is_current
                return (
                  <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.5fr', padding: '12px 16px', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center', opacity: isArchived ? 0.6 : 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member?.emoji} {member?.name}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: isArchived ? 'line-through' : 'none' }}>{DOC_TYPE_ICON[doc.doc_type]} {DOC_TYPE_LABELS[doc.doc_type]}</div>
                      <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey }}>{countryFlag(doc.country)} {maskDoc(doc.doc_number, unmasked[doc.id] || false)}</div>
                    </div>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey }}>
                      <div>{fmtDate(doc.issued_date)}</div>
                      <div style={{ color: C.text }}>{fmtDate(doc.expiry_date)}</div>
                    </div>
                    <div>{isArchived ? <span style={pillStyle('none')}>ARCHIVED</span> : <span style={pillStyle(status)}>{STATUS_LABEL[status]}</span>}</div>
                    <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: isArchived ? C.grey : STATUS_COLOUR[status], fontWeight: 600 }}>
                      {doc.expiry_date && !isArchived ? daysToExpiry(doc.expiry_date) : '—'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {doc.drive_link && <a href={doc.drive_link} target="_blank" rel="noreferrer" title="Drive Link" style={{ fontSize: '1rem', textDecoration: 'none' }}>📁</a>}
                      <button onClick={() => setEditingDoc(doc)} style={{ fontSize: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit">✏️</button>
                    </div>
                  </div>
                )
              })}
              {filteredAllDocs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: C.grey }}>No documents match filters.</div>}
            </div>
          </div>
        )}

        {/* TAB 4: DRIVE LINKS */}
        {tab === 'drive' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '8px' }}>MASTER FOLDER</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🗄️</span>
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/drive/folders/..." 
                  value={driveLinks['master'] || ''} 
                  onChange={e => updateDriveLink('master', e.target.value)} 
                  style={{ flex: 1, padding: '8px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.8rem' }} 
                />
                {driveLinks['master'] && <a href={driveLinks['master']} target="_blank" rel="noreferrer" style={{ background: C.green, color: C.white, textDecoration: 'none', padding: '8px 16px', borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>Open Master →</a>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {DRIVE_FOLDERS.map(f => (
                <div key={f.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{f.label}</span>
                  </div>
                  {driveLinks[f.id] ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href={driveLinks[f.id]} target="_blank" rel="noreferrer" style={{ background: C.forest, border: `1px solid ${C.rule}`, color: C.text, textDecoration: 'none', padding: '8px', borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.8rem', textAlign: 'center' }}>Open Folder ↗</a>
                      <button onClick={() => updateDriveLink(f.id, '')} style={{ background: 'none', border: 'none', color: C.grey, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear link</button>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Paste Drive URL here..." 
                      onBlur={e => updateDriveLink(f.id, e.target.value)}
                      style={{ width: '100%', padding: '8px', border: `1px dashed ${C.rule}`, borderRadius: '4px', fontFamily: F_MONO, fontSize: '0.75rem', outline: 'none' }} 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD / EDIT MODAL */}
        {editingDoc && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(250, 248, 242, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', zIndex: 50, overflowY: 'auto' }}>
            <div style={{ background: C.white, border: `1px solid ${C.rule}`, borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, fontSize: '1.5rem', borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '1rem' }}>
                {editingDoc.id ? 'Edit Document' : 'Add New Document'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>MEMBER</label>
                  <select value={editingDoc.member_id} onChange={e => setEditingDoc({...editingDoc, member_id: e.target.value})} style={inputStyle}>
                    {FAMILY_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>DOCUMENT TYPE</label>
                  <select value={editingDoc.doc_type} onChange={e => setEditingDoc({...editingDoc, doc_type: e.target.value as DocType})} style={inputStyle}>
                    {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>DOCUMENT NUMBER</label>
                  <input type="text" value={editingDoc.doc_number || ''} onChange={e => setEditingDoc({...editingDoc, doc_number: e.target.value})} style={inputStyle} placeholder="Required" />
                </div>
                <div>
                  <label style={labelStyle}>ISSUING COUNTRY</label>
                  <select value={editingDoc.country} onChange={e => setEditingDoc({...editingDoc, country: e.target.value})} style={inputStyle}>
                    <option value="ZA">South Africa (ZA)</option>
                    <option value="QA">Qatar (QA)</option>
                    <option value="UK">United Kingdom (UK)</option>
                    <option value="US">United States (US)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>DATE OF ISSUE</label>
                  <input type="date" value={editingDoc.issued_date || ''} onChange={e => setEditingDoc({...editingDoc, issued_date: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>EXPIRY DATE <span style={{fontWeight: 400, textTransform: 'none'}}>(Leave blank if none)</span></label>
                  <input type="date" value={editingDoc.expiry_date || ''} onChange={e => setEditingDoc({...editingDoc, expiry_date: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>DRIVE LINK <span style={{fontWeight: 400, textTransform: 'none'}}>(Direct URL to scan)</span></label>
                <input type="text" value={editingDoc.drive_link || ''} onChange={e => setEditingDoc({...editingDoc, drive_link: e.target.value})} style={inputStyle} placeholder="https://drive.google.com/..." />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>NOTES</label>
                <textarea rows={2} value={editingDoc.notes || ''} onChange={e => setEditingDoc({...editingDoc, notes: e.target.value})} style={{...inputStyle, resize: 'vertical'}} placeholder="Optional details..."></textarea>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
                <input type="checkbox" id="is_current" checked={editingDoc.is_current ?? true} onChange={e => setEditingDoc({...editingDoc, is_current: e.target.checked})} style={{ transform: 'scale(1.2)' }} />
                <label htmlFor="is_current" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Document is current (uncheck to archive)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  {editingDoc.id && (
                    <button onClick={archiveDocument} style={{ background: 'none', border: `1px solid ${C.red}`, color: C.red, padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                      ARCHIVE (SOFT DELETE)
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setEditingDoc(null)} style={{ background: C.ruleLight, border: 'none', color: C.text, padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                    CANCEL
                  </button>
                  <button onClick={saveDocument} style={{ background: C.green, border: 'none', color: C.white, padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.8rem' }}>
                    SAVE DOCUMENT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '10px 12px', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '0.9rem', outline: 'none', width: '100%', background: C.white }
const labelStyle = { display: 'block', fontSize: '0.65rem', fontFamily: F_MONO, color: C.grey, letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 600 }