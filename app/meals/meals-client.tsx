// app/meals/meals-client.tsx
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

const DEFAULT_RECIPES = [
  { id: '1', icon: '🥚', name: 'Scrambled eggs', category: 'Breakfast', cuisine: 'International', prep_minutes: 10, favourite: false },
  { id: '2', icon: '🍞', name: 'Ful medames', category: 'Breakfast', cuisine: 'Arabic', prep_minutes: 15, favourite: true },
  { id: '3', icon: '🥣', name: 'Oats & honey', category: 'Breakfast', cuisine: 'International', prep_minutes: 5, favourite: false },
  { id: '4', icon: '🍗', name: 'Grilled chicken & rice', category: 'Lunch', cuisine: 'Arabic', prep_minutes: 40, favourite: true },
  { id: '5', icon: '🥗', name: 'Arabic salad', category: 'Lunch', cuisine: 'Arabic', prep_minutes: 15, favourite: false },
  { id: '6', icon: '🍝', name: 'Pasta bolognese', category: 'Dinner', cuisine: 'International', prep_minutes: 45, favourite: true },
  { id: '7', icon: '🍛', name: 'Chicken biryani', category: 'Dinner', cuisine: 'South African', prep_minutes: 60, favourite: true },
  { id: '8', icon: '🫔', name: 'Shawarma wraps', category: 'Dinner', cuisine: 'Arabic', prep_minutes: 30, favourite: false },
  { id: '9', icon: '🥩', name: 'Braai / BBQ night', category: 'Dinner', cuisine: 'South African', prep_minutes: 120, favourite: true },
  { id: '10', icon: '🍲', name: 'Lentil soup', category: 'Lunch', cuisine: 'Arabic', prep_minutes: 40, favourite: false },
  { id: '11', icon: '🐟', name: 'Grilled fish', category: 'Dinner', cuisine: 'Qatari', prep_minutes: 35, favourite: false },
  { id: '12', icon: '🥙', name: 'Falafel pita', category: 'Lunch', cuisine: 'Arabic', prep_minutes: 20, favourite: false },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner']

const getMonday = (d: Date) => {
  const dt = new Date(d)
  const day = dt.getDay(), diff = dt.getDate() - day + (day == 0 ? -6 : 1)
  return new Date(dt.setDate(diff)).toISOString().split('T')[0]
}

export default function MealPlanner() {
  const [tab, setTab] = useState('week')
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()))
  const [plans, setPlans] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [filterCat, setFilterCat] = useState('All')
  const [filterCui, setFilterCui] = useState('All')

  // Forms
  const [editingSlot, setEditingSlot] = useState<{day: string, meal: string} | null>(null)
  const [slotForm, setSlotForm] = useState({ recipe_id: '', custom_name: '' })
  const [newRecipeForm, setNewRecipeForm] = useState({ name: '', icon: '🍽️', category: 'Dinner', cuisine: 'International', prep_minutes: '30', notes: '' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: pData } = await supabase.from('meal_plans').select('*')
      const { data: rData } = await supabase.from('recipes').select('*')
      
      setPlans(pData || JSON.parse(localStorage.getItem('bayt-meals') || '[]'))
      setRecipes(rData && rData.length > 0 ? rData : JSON.parse(localStorage.getItem('bayt-recipes') || JSON.stringify(DEFAULT_RECIPES)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const saveState = (newPlans: any[], newRecipes: any[]) => {
    setPlans(newPlans)
    setRecipes(newRecipes)
    localStorage.setItem('bayt-meals', JSON.stringify(newPlans))
    localStorage.setItem('bayt-recipes', JSON.stringify(newRecipes))
  }

  const saveSlot = () => {
    if (!editingSlot) return
    const newPlan = {
      id: Date.now().toString(),
      week_start: currentWeek,
      day_of_week: editingSlot.day,
      meal_slot: editingSlot.meal,
      recipe_id: slotForm.recipe_id,
      custom_name: slotForm.custom_name,
    }
    const updated = [...plans.filter(p => !(p.week_start === currentWeek && p.day_of_week === editingSlot.day && p.meal_slot === editingSlot.meal)), newPlan]
    saveState(updated, recipes)
    setEditingSlot(null)
    setSlotForm({ recipe_id: '', custom_name: '' })
  }

  const addRecipe = () => {
    if (!newRecipeForm.name) return
    const newR = { id: Date.now().toString(), ...newRecipeForm, prep_minutes: Number(newRecipeForm.prep_minutes), favourite: false }
    saveState(plans, [newR, ...recipes])
    setNewRecipeForm({ name: '', icon: '🍽️', category: 'Dinner', cuisine: 'International', prep_minutes: '30', notes: '' })
  }

  const toggleFav = (id: string) => {
    const updated = recipes.map(r => r.id === id ? { ...r, favourite: !r.favourite } : r)
    saveState(plans, updated)
  }

  const changeWeek = (offset: number) => {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() + (offset * 7))
    setCurrentWeek(d.toISOString().split('T')[0])
  }

  const generateShoppingList = () => {
    alert(`Shopping list 'Meals — Week of ${currentWeek}' generated in Household module!`)
  }

  const currentWeekPlans = plans.filter(p => p.week_start === currentWeek)

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Preparing the kitchen...</div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, padding: '2rem', borderRadius: '12px 12px 0 0', color: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.2em', color: C.goldDim }}>BAYT OS · KITCHEN</div>
          <h1 style={{ margin: '4px 0', fontSize: '1.8rem', fontWeight: 300 }}>Meal Planning</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.2rem', color: C.goldPale }}>التخطيط للوجبات</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.8 }}>
          "Khidma: the table is an act of service."
        </div>
      </header>

      <nav style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {['week', 'recipes', 'log'].map(t => (
          <button 
            key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${C.green}` : 'none',
              fontFamily: F_MONO, fontSize: '0.7rem', textTransform: 'uppercase', color: tab === t ? C.green : C.grey, cursor: 'pointer', letterSpacing: '0.1em'
            }}
          >
            {t === 'week' ? '📅 This Week' : t === 'recipes' ? '📚 Recipe Bank' : '📋 Meal Log'}
          </button>
        ))}
      </nav>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '500px' }}>
        
        {tab === 'week' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => changeWeek(-1)} style={btnStyle}>←</button>
                <span style={{ fontFamily: F_MONO, fontWeight: 600 }}>Week of {currentWeek}</span>
                <button onClick={() => changeWeek(1)} style={btnStyle}>→</button>
              </div>
              <button onClick={generateShoppingList} style={{ background: C.gold, color: C.white, border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.7rem' }}>
                GENERATE SHOPPING LIST
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', overflowX: 'auto' }}>
              {DAYS.map(day => (
                <div key={day} style={{ minWidth: '150px' }}>
                  <div style={{ background: C.forest, padding: '8px', textAlign: 'center', fontFamily: F_MONO, fontSize: '0.8rem', fontWeight: 600, border: `1px solid ${C.ruleLight}`, borderRadius: '4px 4px 0 0' }}>
                    {day.substring(0,3)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${C.ruleLight}`, borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
                    {MEALS.map(meal => {
                      const plan = currentWeekPlans.find(p => p.day_of_week === day && p.meal_slot === meal)
                      const isEditing = editingSlot?.day === day && editingSlot?.meal === meal
                      const recipe = recipes.find(r => r.id === plan?.recipe_id)
                      const displayName = recipe ? `${recipe.icon} ${recipe.name}` : plan?.custom_name || '—'

                      return (
                        <div key={meal} style={{ padding: '10px', borderBottom: meal !== 'Dinner' ? `1px solid ${C.ruleLight}` : 'none', minHeight: '80px', position: 'relative' }}>
                          <div style={{ fontSize: '0.6rem', color: C.grey, fontFamily: F_MONO, marginBottom: '4px', textTransform: 'uppercase' }}>{meal}</div>
                          {isEditing ? (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: C.white, padding: '10px', border: `1px solid ${C.green}`, borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                              <select value={slotForm.recipe_id} onChange={e => setSlotForm({...slotForm, recipe_id: e.target.value, custom_name: ''})} style={{ width: '100%', padding: '4px', marginBottom: '8px', fontSize: '0.8rem' }}>
                                <option value="">-- Choose Recipe --</option>
                                {recipes.filter(r => meal === 'Dinner' ? true : r.category === meal || r.category === 'Lunch').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                              <div style={{ fontSize: '0.6rem', textAlign: 'center', marginBottom: '8px' }}>OR</div>
                              <input placeholder="Custom Meal" value={slotForm.custom_name} onChange={e => setSlotForm({...slotForm, custom_name: e.target.value, recipe_id: ''})} style={{ width: '100%', padding: '4px', marginBottom: '8px', fontSize: '0.8rem' }} />
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={saveSlot} style={{ flex: 1, background: C.green, color: C.white, border: 'none', padding: '4px', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7rem' }}>Save</button>
                                <button onClick={() => setEditingSlot(null)} style={{ flex: 1, background: C.ruleLight, border: 'none', padding: '4px', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7rem' }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => setEditingSlot({day, meal})} style={{ fontSize: '0.85rem', color: displayName === '—' ? C.rule : C.text, cursor: 'pointer', fontWeight: displayName !== '—' ? 600 : 400 }}>
                              {displayName}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C.grey, marginTop: '2rem' }}>"Ilmu: plan the week, own the week."</p>
          </div>
        )}

        {tab === 'recipes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${C.ruleLight}` }}>
                  <option value="All">All Categories</option>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterCui} onChange={e => setFilterCui(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${C.ruleLight}` }}>
                  <option value="All">All Cuisines</option>
                  {['Arabic', 'South African', 'International', 'Qatari'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: C.cream, padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: `1px solid ${C.ruleLight}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Quick Add:</div>
              <input placeholder="Name" value={newRecipeForm.name} onChange={e => setNewRecipeForm({...newRecipeForm, name: e.target.value})} style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${C.rule}` }} />
              <input placeholder="Icon (e.g. 🍗)" value={newRecipeForm.icon} onChange={e => setNewRecipeForm({...newRecipeForm, icon: e.target.value})} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: `1px solid ${C.rule}` }} />
              <select value={newRecipeForm.category} onChange={e => setNewRecipeForm({...newRecipeForm, category: e.target.value})} style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${C.rule}` }}>
                {['Breakfast', 'Lunch', 'Dinner'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addRecipe} style={{ background: C.green, color: C.white, border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Add Recipe</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {recipes.filter(r => (filterCat === 'All' || r.category === filterCat) && (filterCui === 'All' || r.cuisine === filterCui)).map(r => (
                <div key={r.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1rem', background: C.white, position: 'relative' }}>
                  <div onClick={() => toggleFav(r.id)} style={{ position: 'absolute', top: 10, right: 10, cursor: 'pointer', fontSize: '1.2rem', opacity: r.favourite ? 1 : 0.2 }}>⭐️</div>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{r.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{r.name}</div>
                  <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>{r.category} · {r.cuisine}</span>
                    <span>⏱️ {r.prep_minutes} mins</span>
                    <span style={{ color: C.green, marginTop: '4px' }}>✓ Halal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'log' && (
          <div>
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Past Weeks</h3>
            {Array.from(new Set(plans.map(p => p.week_start))).filter(w => w !== currentWeek).sort().reverse().map(week => (
              <div key={week} style={{ padding: '1rem', background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontFamily: F_MONO }}>Week of {week}</div>
                <div style={{ fontSize: '0.8rem', color: C.grey, marginTop: '4px' }}>{plans.filter(p => p.week_start === week).length} meals planned</div>
              </div>
            ))}
            {plans.filter(p => p.week_start !== currentWeek).length === 0 && <div style={{ color: C.grey, fontStyle: 'italic' }}>No past meal plans recorded.</div>}
          </div>
        )}

      </main>
    </div>
  )
}

const btnStyle = { background: 'none', border: `1px solid ${C.rule}`, borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }