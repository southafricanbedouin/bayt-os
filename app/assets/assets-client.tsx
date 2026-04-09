// app/assets/assets-client.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Design Tokens ────────────────────────────────────────────────────────
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
  blue:      '#4a9eca',
}
const F_SANS = 'var(--font-sans), Georgia, serif'
const F_MONO = 'var(--font-mono), monospace'
const F_ARAB = 'var(--font-arabic), serif'

// ── Interfaces & Defaults ────────────────────────────────────────────────
interface Asset {
  id: string
  name: string
  icon: string
  category: string
  owner: string
  purchase_date: string
  purchase_price: number
  current_value: number
  notes: string
}

const CATEGORIES = ['Vehicle', 'Electronics', 'Real Estate', 'Jewelry', 'Other']
const OWNERS = ['Family', 'Muhammad', 'Camilla', 'Yahya', 'Isa', 'Linah', 'Dana']

const DEFAULT_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Nissan Patrol 2020',
    icon: '🚙',
    category: 'Vehicle',
    owner: 'Family',
    purchase_date: '2023-08-01',
    purchase_price: 110000,
    current_value: 85000, // Estimated ~10-12% annual depreciation
    notes: 'Bought at 44,000 KM. Current KM: 70,000',
  },
  {
    id: '2',
    name: 'Electric Scooter',
    icon: '🛴',
    category: 'Electronics',
    owner: 'Yahya',
    purchase_date: '2020-06-01',
    purchase_price: 899,
    current_value: 100, // Electronics depreciate heavily over 6 years
    notes: '',
  }
]

// ── Helpers ──────────────────────────────────────────────────────────────
const qar = (n: number) => `QAR ${Math.round(n).toLocaleString()}`

// Simple depreciation/appreciation estimator based on category and age
function estimateValue(price: number, dateStr: string, category: string): number {
  if (!price || !dateStr) return 0
  const years = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24 * 365.25)
  if (years <= 0) return price
  
  let rate = 0
  if (category === 'Vehicle') rate = 0.12       // 12% depreciation/yr
  else if (category === 'Electronics') rate = 0.30 // 30% depreciation/yr
  else if (category === 'Real Estate') rate = -0.03 // 3% appreciation/yr
  else if (category === 'Jewelry') rate = -0.02   // 2% appreciation/yr
  else rate = 0.10                              // 10% default
  
  // V = P * (1 - r)^t
  const est = price * Math.pow(1 - rate, years)
  return Math.max(0, Math.round(est))
}

function getAgeString(dateStr: string) {
  const years = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24 * 365.25)
  if (years < 1) {
    const months = Math.floor(years * 12)
    return `${months} mo`
  }
  return `${years.toFixed(1)} yrs`
}

// ── Components ───────────────────────────────────────────────────────────
const Stat = ({ label, value, sub, color = C.text }: any) => (
  <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: 8, padding: '1rem' }}>
    <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.15em', color: C.grey, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 300, color, fontFamily: F_SANS, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontFamily: F_MONO, fontSize: '0.45rem', color: C.grey, marginTop: 4 }}>{sub}</div>}
  </div>
)

// ══════════════════════════════════════════════════════════════════════════
//  MAIN MODULE
// ══════════════════════════════════════════════════════════════════════════
export default function AssetsRepository() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState<Partial<Asset>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Assuming a public.assets table exists. If not, fallback to localStorage.
      const { data } = await supabase.from('assets').select('*').order('purchase_date', { ascending: false })
      if (data && data.length > 0) {
        setAssets(data)
      } else {
        const ls = localStorage.getItem('bayt-assets-v1')
        if (ls) setAssets(JSON.parse(ls))
        else setAssets(DEFAULT_ASSETS)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveState = async (newAssets: Asset[]) => {
    setAssets(newAssets)
    localStorage.setItem('bayt-assets-v1', JSON.stringify(newAssets))
    // Supabase sync omitted for UI preview speed, but structure is ready.
  }

  const handleCalculateEstimate = () => {
    if (form.purchase_price && form.purchase_date && form.category) {
      const est = estimateValue(Number(form.purchase_price), form.purchase_date, form.category)
      setForm({ ...form, current_value: est })
    }
  }

  const saveForm = () => {
    if (!form.name || !form.purchase_price || !form.purchase_date) return

    const newAsset: Asset = {
      id: editingId || Date.now().toString(),
      name: form.name || 'Unnamed Asset',
      icon: form.icon || '📦',
      category: form.category || 'Other',
      owner: form.owner || 'Family',
      purchase_date: form.purchase_date,
      purchase_price: Number(form.purchase_price),
      current_value: Number(form.current_value) || estimateValue(Number(form.purchase_price), form.purchase_date, form.category || 'Other'),
      notes: form.notes || ''
    }

    let updated
    if (editingId) {
      updated = assets.map(a => a.id === editingId ? newAsset : a)
    } else {
      updated = [newAsset, ...assets]
    }

    saveState(updated)
    setIsAdding(false)
    setEditingId(null)
    setForm({})
  }

  const startEdit = (asset: Asset) => {
    setForm(asset)
    setEditingId(asset.id)
    setIsAdding(true)
  }

  const deleteAsset = (id: string) => {
    if (confirm('Are you sure you want to remove this asset?')) {
      saveState(assets.filter(a => a.id !== id))
    }
  }

  const totalCost = assets.reduce((s, a) => s + a.purchase_price, 0)
  const totalValue = assets.reduce((s, a) => s + a.current_value, 0)
  const netDelta = totalValue - totalCost

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Evaluating portfolio...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: F_SANS }}>
      
      {/* HEADER */}
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · WEALTH</div>
          <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 300 }}>Asset Repository</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>الأصول والممتلكات</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: F_MONO, fontSize: '0.5rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>CURRENT MARKET VALUE</div>
          <div style={{ fontSize: '1.4rem', color: C.gold, fontWeight: 600 }}>{qar(totalValue)}</div>
        </div>
      </header>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <Stat label="Total Assets" value={assets.length.toString()} sub="Tracked items" />
          <Stat label="Total Cost Basis" value={qar(totalCost)} sub="Original purchase price" />
          <Stat label="Current Est. Value" value={qar(totalValue)} sub="Based on market / depreciation" color={C.green} />
          <Stat 
            label="Net Value Change" 
            value={`${netDelta >= 0 ? '+' : ''}${qar(netDelta)}`} 
            sub={netDelta >= 0 ? 'Appreciation' : 'Depreciation'} 
            color={netDelta >= 0 ? C.midgreen : C.orange} 
          />
        </div>

        {/* ADD / EDIT FORM */}
        {isAdding && (
          <div style={{ background: C.forest, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, fontFamily: F_SANS, color: C.green }}>{editingId ? 'Edit Asset' : 'Add New Asset'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>ICON & NAME</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={form.icon || ''} onChange={e => setForm({...form, icon: e.target.value})} placeholder="🚙" style={inputStyle(40)} />
                  <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Nissan Patrol" style={{ ...inputStyle(), flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>CATEGORY</label>
                <select value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle()}>
                  <option value="">-- Select --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>OWNER</label>
                <select value={form.owner || ''} onChange={e => setForm({...form, owner: e.target.value})} style={inputStyle()}>
                  <option value="">-- Select --</option>
                  {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>PURCHASE DATE</label>
                <input type="date" value={form.purchase_date || ''} onChange={e => setForm({...form, purchase_date: e.target.value})} style={inputStyle()} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>PURCHASE PRICE (QAR)</label>
                <input type="number" value={form.purchase_price || ''} onChange={e => setForm({...form, purchase_price: Number(e.target.value)})} placeholder="110000" style={inputStyle()} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>
                  CURRENT VALUE (QAR) 
                  <span onClick={handleCalculateEstimate} style={{ marginLeft: 8, color: C.blue, cursor: 'pointer', textDecoration: 'underline' }}>Auto-Calc</span>
                </label>
                <input type="number" value={form.current_value || ''} onChange={e => setForm({...form, current_value: Number(e.target.value)})} placeholder="85000" style={inputStyle()} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: 4 }}>NOTES / METADATA (e.g. current KM, condition)</label>
              <input value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Bought at 44k KM, currently at 70k KM" style={inputStyle()} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={saveForm} style={{ background: C.green, color: C.white, border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO }}>
                SAVE ASSET
              </button>
              <button onClick={() => { setIsAdding(false); setForm({}); setEditingId(null); }} style={{ background: 'transparent', color: C.grey, border: `1px solid ${C.rule}`, padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO }}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* TABLE CONTROLS */}
        {!isAdding && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em' }}>INVENTORY LOG</div>
            <button onClick={() => setIsAdding(true)} style={{ background: C.gold, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>
              + ADD ASSET
            </button>
          </div>
        )}

        {/* TABLE */}
        <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2rem 2fr 1fr 1fr 1fr 1fr 1fr 4rem', background: C.cream, padding: '0.8rem 1rem', borderBottom: `1px solid ${C.ruleLight}`, gap: '0.5rem', alignItems: 'center' }}>
            {['', 'Asset & Notes', 'Owner', 'Age', 'Cost Basis', 'Current Val', 'Delta', ''].map((h, i) => (
              <div key={i} style={{ fontFamily: F_MONO, fontSize: '0.5rem', letterSpacing: '0.1em', color: C.goldDim, textTransform: 'uppercase', textAlign: h.includes('Cost') || h.includes('Val') || h.includes('Delta') ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {assets.map((asset, i) => {
            const delta = asset.current_value - asset.purchase_price
            const deltaPct = asset.purchase_price > 0 ? (delta / asset.purchase_price) * 100 : 0
            
            return (
              <div key={asset.id} style={{ display: 'grid', gridTemplateColumns: '2rem 2fr 1fr 1fr 1fr 1fr 1fr 4rem', padding: '1rem', background: i % 2 === 0 ? C.white : '#fdfdfc', borderBottom: i < assets.length - 1 ? `1px solid ${C.ruleLight}` : 'none', alignItems: 'center', gap: '0.5rem' }}>
                
                <div style={{ fontSize: '1.5rem', textAlign: 'center' }}>{asset.icon}</div>
                
                <div>
                  <div style={{ fontWeight: 600, color: C.text, fontSize: '0.9rem' }}>{asset.name}</div>
                  <div style={{ fontSize: '0.7rem', color: C.grey, marginTop: 4 }}>
                    <span style={{ display: 'inline-block', background: C.ruleLight, padding: '2px 6px', borderRadius: 4, fontFamily: F_MONO, fontSize: '0.6rem', marginRight: 6 }}>{asset.category.toUpperCase()}</span>
                    {asset.notes}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: C.text }}>{asset.owner}</div>
                
                <div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.text }}>{getAgeString(asset.purchase_date)}</div>
                  <div style={{ fontSize: '0.6rem', color: C.grey }}>{new Date(asset.purchase_date).getFullYear()}</div>
                </div>

                <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey, textAlign: 'right' }}>
                  {qar(asset.purchase_price)}
                </div>

                <div style={{ fontFamily: F_MONO, fontSize: '0.85rem', color: C.text, fontWeight: 600, textAlign: 'right' }}>
                  {qar(asset.current_value)}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: delta >= 0 ? C.midgreen : C.orange, fontWeight: 600 }}>
                    {delta >= 0 ? '+' : ''}{qar(delta)}
                  </div>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: delta >= 0 ? C.midgreen : C.orange }}>
                    {delta >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => startEdit(asset)} style={{ background: 'none', border: `1px solid ${C.rule}`, color: C.grey, fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteAsset(asset.id)} style={{ background: 'none', border: 'none', color: C.orange, fontSize: '0.6rem', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                </div>

              </div>
            )
          })}
          
          {assets.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontFamily: F_MONO, fontSize: '0.8rem' }}>
              No assets logged yet. Add your first asset to begin tracking.
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

const inputStyle = (width?: number | string) => ({
  width: width || '100%',
  padding: '8px 12px',
  border: `1px solid ${C.rule}`,
  borderRadius: '4px',
  fontFamily: F_SANS,
  fontSize: '0.85rem',
  outline: 'none',
  background: C.white,
})