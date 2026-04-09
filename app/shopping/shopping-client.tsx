// app/shopping/shopping-client.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

const STAPLES = [
  { name: 'Rice', category: 'Pantry' }, { name: 'Pasta', category: 'Pantry' }, { name: 'Olive oil', category: 'Pantry' },
  { name: 'Tomato paste', category: 'Pantry' }, { name: 'Lentils', category: 'Pantry' },
  { name: 'Milk', category: 'Dairy' }, { name: 'Eggs', category: 'Dairy' }, { name: 'Yogurt', category: 'Dairy' },
  { name: 'Onions', category: 'Produce' }, { name: 'Garlic', category: 'Produce' }, { name: 'Tomatoes', category: 'Produce' },
  { name: 'Dish soap', category: 'Cleaning' }, { name: 'Laundry pods', category: 'Cleaning' }, { name: 'Bin bags', category: 'Cleaning' },
  { name: 'Toothpaste', category: 'Personal Care' }, { name: 'Shampoo', category: 'Personal Care' }
]

const QUICK_ADD = ['Milk', 'Bread', 'Eggs', 'Rice', 'Chicken', 'Pasta', 'Olive Oil', 'Coffee', 'Laundry detergent', 'Dish soap']
const STORES = ['Talabat', 'The Grocer', 'Carrefour', 'Spar', 'FFC', 'Lulu', 'Other']

export default function ShoppingHousehold() {
  const [tab, setTab] = useState('active')
  const [loading, setLoading] = useState(true)
  const [lists, setLists] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [expandedList, setExpandedList] = useState<string | null>(null)
  
  // Forms
  const [newListForm, setNewListForm] = useState({ name: '', store: 'Carrefour' })
  const [newItemForm, setNewItemForm] = useState({ list_id: '', name: '', quantity: '1', estimated_qar: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: lData } = await supabase.from('shopping_lists').select('*').order('created_at', { ascending: false })
      const { data: iData } = await supabase.from('shopping_items').select('*')
      
      if (lData) setLists(lData)
      else {
        const lsL = localStorage.getItem('bayt-shop-lists')
        if (lsL) setLists(JSON.parse(lsL))
      }

      if (iData) setItems(iData)
      else {
        const lsI = localStorage.getItem('bayt-shop-items')
        if (lsI) setItems(JSON.parse(lsI))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveState = (newLists: any[], newItems: any[]) => {
    setLists(newLists)
    setItems(newItems)
    localStorage.setItem('bayt-shop-lists', JSON.stringify(newLists))
    localStorage.setItem('bayt-shop-items', JSON.stringify(newItems))
  }

  const createList = () => {
    if (!newListForm.name) return
    const newList = { id: Date.now().toString(), name: newListForm.name, store: newListForm.store, status: 'active', created_at: new Date().toISOString() }
    saveState([newList, ...lists], items)
    setNewListForm({ name: '', store: 'Carrefour' })
    if (!newItemForm.list_id) setNewItemForm({ ...newItemForm, list_id: newList.id })
  }

  const addItem = (nameOverride?: string) => {
    const listId = newItemForm.list_id || lists.find(l => l.status === 'active')?.id
    if (!listId) { alert('Create a list first'); return }
    const name = nameOverride || newItemForm.name
    if (!name) return

    const newItem = { id: Date.now().toString(), list_id: listId, name, quantity: newItemForm.quantity, estimated_qar: Number(newItemForm.estimated_qar)||0, checked: false }
    saveState(lists, [...items, newItem])
    setNewItemForm({ ...newItemForm, name: '', estimated_qar: '' })
  }

  const toggleItem = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i)
    saveState(lists, updated)
  }

  const completeList = (id: string) => {
    const updated = lists.map(l => l.id === id ? { ...l, status: 'completed' } : l)
    saveState(updated, items)
    setExpandedList(null)
  }

  const activeLists = lists.filter(l => l.status === 'active')
  const historyLists = lists.filter(l => l.status === 'completed')

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Checking the pantry...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · HOUSEHOLD</div>
          <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 300 }}>Shopping & Supplies</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>التسوق</div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldPale, maxWidth: '200px' }}>
          "Khidma: the household runs smoothly so the family can serve."
        </div>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['active', 'add', 'staples', 'history'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'active' ? '🛒 Active Lists' : t === 'add' ? '➕ Add Items' : t === 'staples' ? '🔁 Staples' : '📜 History'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'active' && (
          <div>
            <div style={{ background: C.cream, padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '10px' }}>
              <input value={newListForm.name} onChange={e => setNewListForm({...newListForm, name: e.target.value})} placeholder="New List Name (e.g. Weekend Groceries)" style={{ flex: 2, padding: '8px', border: `1px solid ${C.rule}`, borderRadius: '4px' }} />
              <select value={newListForm.store} onChange={e => setNewListForm({...newListForm, store: e.target.value})} style={{ flex: 1, padding: '8px', border: `1px solid ${C.rule}`, borderRadius: '4px' }}>
                {STORES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={createList} style={{ background: C.green, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Create List</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {activeLists.map(list => {
                const listItems = items.filter(i => i.list_id === list.id)
                const checkedCount = listItems.filter(i => i.checked).length
                const isExpanded = expandedList === list.id
                return (
                  <div key={list.id} style={{ border: `1px solid ${C.rule}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <div onClick={() => setExpandedList(isExpanded ? null : list.id)} style={{ padding: '1rem', background: isExpanded ? C.forest : C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{list.name}</div>
                        <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginTop: '4px' }}>{list.store.toUpperCase()} · {new Date(list.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: checkedCount === listItems.length && listItems.length > 0 ? C.green : C.text }}>
                          {checkedCount} / {listItems.length} items
                        </div>
                        <div>{isExpanded ? '▼' : '▶'}</div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '1rem', borderTop: `1px solid ${C.ruleLight}` }}>
                        {listItems.length === 0 ? <div style={{ fontSize: '0.8rem', color: C.grey, fontStyle: 'italic' }}>List is empty. Go to Add Items.</div> : null}
                        {listItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px dashed ${C.ruleLight}` }}>
                            <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                            <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? C.grey : C.text }}>{item.name} <span style={{ fontSize: '0.7rem', color: C.grey }}>x{item.quantity}</span></span>
                            {item.estimated_qar > 0 && <span style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey }}>~QAR {item.estimated_qar}</span>}
                          </div>
                        ))}
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                          <button onClick={() => completeList(list.id)} style={{ background: C.gold, color: C.white, border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>COMPLETE LIST</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {activeLists.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: C.grey }}>No active shopping lists.</div>}
            </div>
          </div>
        )}

        {tab === 'add' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, marginBottom: '4px' }}>TARGET LIST</label>
              <select value={newItemForm.list_id} onChange={e => setNewItemForm({...newItemForm, list_id: e.target.value})} style={{ width: '100%', padding: '10px', border: `1px solid ${C.rule}`, borderRadius: '6px' }}>
                <option value="">-- Select Active List --</option>
                {activeLists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.store})</option>)}
              </select>
            </div>

            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input value={newItemForm.name} onChange={e => setNewItemForm({...newItemForm, name: e.target.value})} placeholder="Item name..." style={{ flex: 2, padding: '10px', border: `1px solid ${C.rule}`, borderRadius: '4px' }} />
                <input value={newItemForm.quantity} onChange={e => setNewItemForm({...newItemForm, quantity: e.target.value})} placeholder="Qty" style={{ flex: 1, padding: '10px', border: `1px solid ${C.rule}`, borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={newItemForm.estimated_qar} onChange={e => setNewItemForm({...newItemForm, estimated_qar: e.target.value})} placeholder="Est. Price (QAR)" style={{ flex: 1, padding: '10px', border: `1px solid ${C.rule}`, borderRadius: '4px' }} />
                <button onClick={() => addItem()} style={{ flex: 1, background: C.green, color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ ADD TO LIST</button>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', color: C.grey, letterSpacing: '0.1em', marginBottom: '10px' }}>QUICK ADD FREQUENT ITEMS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {QUICK_ADD.map(item => (
                  <button key={item} onClick={() => addItem(item)} style={{ background: C.white, border: `1px solid ${C.goldDim}`, color: C.text, padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'staples' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: C.grey }}>Always keep the pantry stocked. Tap to instantly add to your selected active list.</p>
              <select value={newItemForm.list_id} onChange={e => setNewItemForm({...newItemForm, list_id: e.target.value})} style={{ padding: '6px', border: `1px solid ${C.rule}`, borderRadius: '4px', fontSize: '0.8rem' }}>
                <option value="">-- Add to which list? --</option>
                {activeLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {Array.from(new Set(STAPLES.map(s => s.category))).map(cat => (
                <div key={cat} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '4px', marginBottom: '8px' }}>{cat.toUpperCase()}</div>
                  {STAPLES.filter(s => s.category === cat).map(s => (
                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span style={{ fontSize: '0.9rem' }}>{s.name}</span>
                      <button onClick={() => addItem(s.name)} style={{ background: 'none', border: `1px solid ${C.green}`, color: C.green, borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Add</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historyLists.map(list => {
              const listItems = items.filter(i => i.list_id === list.id)
              const estTotal = listItems.reduce((acc, i) => acc + (i.estimated_qar || 0), 0)
              return (
                <div key={list.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: C.cream, borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{list.name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO, marginTop: '4px' }}>
                      {new Date(list.created_at).toLocaleDateString()} · {list.store} · {listItems.length} items
                    </div>
                  </div>
                  <div style={{ fontFamily: F_MONO, color: C.text, fontWeight: 600 }}>
                    {estTotal > 0 ? `Est. QAR ${estTotal}` : ''}
                  </div>
                </div>
              )
            })}
            {historyLists.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: C.grey }}>No completed shopping lists yet.</div>}
          </div>
        )}

      </main>
    </div>
  )
}