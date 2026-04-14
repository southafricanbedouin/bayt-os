// app/reading/reading-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
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

const MEMBERS = [
  { id: 'muhammad', name: 'Muhammad' },
  { id: 'camilla', name: 'Camilla' },
  { id: 'yahya', name: 'Yahya' },
  { id: 'isa', name: 'Isa' },
  { id: 'linah', name: 'Linah' },
  { id: 'dana', name: 'Dana' }
]

const CATEGORIES = ['Islamic', 'Fiction', 'Non-fiction', 'Biography', 'Science', 'Children', 'Other']
const STATUSES = ['to-read', 'reading', 'completed']
const AGE_GROUPS = ['3-5', '6-8', '9-11', '12-14', '15+', 'All Ages']
const RESOURCE_TYPES = ['Book', 'Magazine', 'Article', 'Story', 'Audio', 'Interactive']

const CURATED_RESOURCES = [
  {
    id: 'qnl-main',
    name: 'Qatar National Library - Online Resources',
    url: 'https://www.qnl.qa/en/explore/online-resources',
    type: 'Library',
    categories: ['Islamic', 'Fiction', 'Non-fiction', 'Children'],
    ageGroups: ['All Ages'],
    description: 'Official QNL platform with thousands of books, magazines, and resources',
    icon: '📚'
  },
  {
    id: 'pressreader',
    name: 'PressReader (via QNL)',
    url: 'https://www-pressreader-com.eres.qnl.qa/catalog',
    type: 'Magazines & Newspapers',
    categories: ['Non-fiction'],
    ageGroups: ['15+', 'All Ages'],
    description: 'Access to newspapers, magazines, and journals worldwide',
    icon: '📰'
  },
  {
    id: 'creativebug',
    name: 'CreativeBug (via QNL)',
    url: 'https://www-creativebug-com.eres.qnl.qa/lib/qnl',
    type: 'Learning',
    categories: ['Science'],
    ageGroups: ['6-8', '9-11', '12-14', '15+'],
    description: 'Creative learning with art, craft, and design classes',
    icon: '🎨'
  },
  {
    id: 'unite-literacy',
    name: 'Unite for Literacy',
    url: 'https://www.uniteforliteracy.com/free-books-online/home',
    type: 'Free Books',
    categories: ['Fiction', 'Children'],
    ageGroups: ['3-5', '6-8', '9-11'],
    description: 'Free bilingual children\'s books - perfect for young readers',
    icon: '📖'
  },
  {
    id: 'bookflix',
    name: 'Bookflix (Scholastic)',
    url: 'https://bookflix.digital.scholastic.com/home?authCtx=',
    type: 'Interactive Stories',
    categories: ['Fiction', 'Children'],
    ageGroups: ['3-5', '6-8', '9-11'],
    description: 'Animated book companion with video and interactive activities',
    icon: '🎬'
  }
]

export default function ReadingBooks() {
  const [activeTab, setActiveTab] = useState('current')
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>(CURATED_RESOURCES)

  const [showBookForm, setShowBookForm] = useState(false)
  const [bookForm, setBookForm] = useState({ member_id: 'yahya', title: '', author: '', category: 'Fiction', pages_total: '', status: 'to-read' })

  const [logForm, setLogForm] = useState<Record<string, { pages: string, duration: string, notes: string }>>({})

  // Library filter states
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resourceForm, setResourceForm] = useState({ title: '', author: '', type: 'Book', url: '', driveUrl: '', category: 'Other', ageGroups: ['All Ages'], addedBy: 'Family' })
  const [librarySearch, setLibrarySearch] = useState('')
  const [libraryFilters, setLibraryFilters] = useState({ category: 'All', ageGroup: 'All Ages' })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: bData, error: bErr } = await supabase.from('books').select('*').order('created_at', { ascending: false })
      const { data: sData, error: sErr } = await supabase.from('reading_sessions').select('*')

      // Use Supabase as source of truth. Fall back to localStorage only if the query errors.
      if (!bErr && bData !== null) {
        setBooks(bData)
        localStorage.setItem('bayt-books-v1', JSON.stringify(bData)) // keep local cache fresh
      } else {
        setBooks(JSON.parse(localStorage.getItem('bayt-books-v1') || '[]'))
      }

      if (!sErr && sData !== null) {
        setSessions(sData)
        localStorage.setItem('bayt-reading-sessions-v1', JSON.stringify(sData))
      } else {
        setSessions(JSON.parse(localStorage.getItem('bayt-reading-sessions-v1') || '[]'))
      }
    } catch (e) {
      console.error(e)
      // Network error — use cached data
      setBooks(JSON.parse(localStorage.getItem('bayt-books-v1') || '[]'))
      setSessions(JSON.parse(localStorage.getItem('bayt-reading-sessions-v1') || '[]'))
    }
    setLoading(false)
  }

  const saveBook = async () => {
    if (!bookForm.title) return
    const newBook = { 
      id: crypto.randomUUID(), 
      ...bookForm, 
      pages_total: Number(bookForm.pages_total) || 0, 
      pages_read: 0, 
      rating: 0,
      created_at: new Date().toISOString() 
    }
    const updated = [newBook, ...books]
    setBooks(updated)
    localStorage.setItem('bayt-books-v1', JSON.stringify(updated))
    setShowBookForm(false)
    setBookForm({ member_id: 'yahya', title: '', author: '', category: 'Fiction', pages_total: '', status: 'to-read' })
    try {
      const { error } = await supabase.from('books').insert(newBook)
      if (error) console.error('Book insert failed:', error)
    } catch(e) { console.error('Book insert error:', e) }
  }

  const logSession = async (bookId: string, memberId: string) => {
    const logData = logForm[bookId]
    if (!logData || !logData.pages) return
    
    const pagesRead = Number(logData.pages)
    const newSession = { 
      id: crypto.randomUUID(), 
      book_id: bookId, 
      member_id: memberId, 
      pages_read: pagesRead, 
      duration_min: Number(logData.duration) || 0,
      notes: logData.notes,
      logged_at: new Date().toISOString() 
    }

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    localStorage.setItem('bayt-reading-sessions-v1', JSON.stringify(updatedSessions))

    const book = books.find(b => b.id === bookId)
    if (book) {
      const newPages = Math.min(book.pages_read + pagesRead, book.pages_total)
      const updatedBooks = books.map(b => b.id === bookId ? { ...b, pages_read: newPages } : b)
      setBooks(updatedBooks)
      localStorage.setItem('bayt-books-v1', JSON.stringify(updatedBooks))
      try {
        const { error: sErr } = await supabase.from('reading_sessions').insert(newSession)
        const { error: bErr } = await supabase.from('books').update({ pages_read: newPages }).eq('id', bookId)
        if (sErr) console.error('Session insert failed:', sErr)
        if (bErr) console.error('Book pages update failed:', bErr)
      } catch(e) { console.error('logSession sync error:', e) }
    }
    
    setLogForm(prev => ({ ...prev, [bookId]: { pages: '', duration: '', notes: '' } }))
  }

  const changeBookStatus = async (id: string, newStatus: string) => {
    const updated = books.map(b => b.id === id ? { ...b, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : b.completed_at } : b)
    setBooks(updated)
    localStorage.setItem('bayt-books-v1', JSON.stringify(updated))
    try { await supabase.from('books').update({ status: newStatus }).eq('id', id) } catch(e) {}
  }

  const rateBook = async (id: string, rating: number) => {
    const updated = books.map(b => b.id === id ? { ...b, rating } : b)
    setBooks(updated)
    localStorage.setItem('bayt-books-v1', JSON.stringify(updated))
    try { await supabase.from('books').update({ rating }).eq('id', id) } catch(e) {}
  }

  const saveResource = async () => {
    if (!resourceForm.title || (!resourceForm.url && !resourceForm.driveUrl)) return
    const newResource = {
      id: crypto.randomUUID(),
      ...resourceForm,
      created_at: new Date().toISOString()
    }
    const updated = [newResource, ...resources.filter(r => !r.id.startsWith('custom-') || r.id.substring(7) !== newResource.id)]
    setResources(updated)
    localStorage.setItem('bayt-resources-v1', JSON.stringify(updated))
    setShowResourceForm(false)
    setResourceForm({ title: '', author: '', type: 'Book', url: '', driveUrl: '', category: 'Other', ageGroups: ['All Ages'], addedBy: 'Family' })
  }

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          r.author?.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          r.description?.toLowerCase().includes(librarySearch.toLowerCase())
    const matchesCategory = libraryFilters.category === 'All' || r.category === libraryFilters.category || r.categories?.includes(libraryFilters.category)
    const matchesAge = libraryFilters.ageGroup === 'All Ages' || r.ageGroups?.includes(libraryFilters.ageGroup) || r.ageGroups?.includes('All Ages')
    return matchesSearch && matchesCategory && matchesAge
  })

  const totalPagesThisMonth = sessions.filter(s => new Date(s.logged_at).getMonth() === new Date().getMonth()).reduce((acc, s) => acc + s.pages_read, 0)
  const booksCompletedThisMonth = books.filter(b => b.status === 'completed' && b.completed_at && new Date(b.completed_at).getMonth() === new Date().getMonth()).length

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Opening library...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.midgreen, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ilmu: reading is a form of worship</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 300 }}>Reading & Books</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>القراءة</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.9, textAlign: 'right', maxWidth: '300px' }}>
            "Read in the name of your Lord."<br/>— Quran 96:1
          </div>
          <div style={{ display: 'flex', gap: '1rem', textAlign: 'center', fontFamily: F_MONO }}>
            <div style={{ background: C.green, padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', color: C.gold }}>{totalPagesThisMonth}</div>
              <div style={{ fontSize: '0.6rem', color: C.white }}>PAGES THIS MO.</div>
            </div>
            <div style={{ background: C.green, padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', color: C.white }}>{booksCompletedThisMonth}</div>
              <div style={{ fontSize: '0.6rem', color: C.white }}>BOOKS FINISHED</div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'current', label: '📖 Currently Reading' },
          { id: 'manage', label: '➕ Manage Books' },
          { id: 'leaderboard', label: '🏆 Leaderboard' },
          { id: 'library', label: '📚 Family Library' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: activeTab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {activeTab === 'current' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {MEMBERS.map(m => {
              const activeBooks = books.filter(b => b.member_id === m.id && b.status === 'reading')
              return (
                <div key={m.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.cream }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: C.green, borderBottom: `1px solid ${C.rule}`, paddingBottom: '0.5rem' }}>{m.name}'s Reading</h3>
                  {activeBooks.length > 0 ? activeBooks.map(b => {
                    const pct = b.pages_total > 0 ? (b.pages_read / b.pages_total) * 100 : 0
                    const lf = logForm[b.id] || { pages: '', duration: '', notes: '' }
                    return (
                      <div key={b.id} style={{ background: C.white, padding: '1rem', borderRadius: '6px', border: `1px solid ${C.ruleLight}`, marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{b.title}</div>
                        <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '1rem' }}>by {b.author}</div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: F_MONO, marginBottom: '4px' }}>
                            <span>{b.pages_read} / {b.pages_total} pages</span>
                            <span>{Math.round(pct)}%</span>
                          </div>
                          <div style={{ height: '6px', background: C.ruleLight, borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: C.goldDim, transition: 'width 0.3s' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <input type="number" placeholder="Pages read" value={lf.pages} onChange={e => setLogForm({...logForm, [b.id]: {...lf, pages: e.target.value}})} style={{...inputStyle, padding: '0.5rem', fontSize: '0.8rem'}} />
                          <input type="number" placeholder="Mins (opt)" value={lf.duration} onChange={e => setLogForm({...logForm, [b.id]: {...lf, duration: e.target.value}})} style={{...inputStyle, padding: '0.5rem', fontSize: '0.8rem'}} />
                        </div>
                        <button onClick={() => logSession(b.id, m.id)} style={{ ...primaryBtn, width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}>LOG SESSION</button>
                        <button onClick={() => changeBookStatus(b.id, 'completed')} style={{ width: '100%', background: 'none', border: `1px solid ${C.rule}`, color: C.grey, padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: F_MONO }}>MARK AS COMPLETE</button>
                      </div>
                    )
                  }) : <div style={{ fontSize: '0.85rem', color: C.grey, fontStyle: 'italic' }}>Nothing reading right now. Start a new book!</div>}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Manage Books</h2>
              <button onClick={() => setShowBookForm(!showBookForm)} style={primaryBtn}>
                {showBookForm ? 'CANCEL' : 'ADD NEW BOOK'}
              </button>
            </div>

            {showBookForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={bookForm.member_id} onChange={e => setBookForm({...bookForm, member_id: e.target.value})} style={inputStyle}>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input placeholder="Book Title" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} style={inputStyle} />
                  <input placeholder="Author" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" placeholder="Total Pages" value={bookForm.pages_total} onChange={e => setBookForm({...bookForm, pages_total: e.target.value})} style={inputStyle} />
                  <select value={bookForm.status} onChange={e => setBookForm({...bookForm, status: e.target.value})} style={inputStyle}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                  </select>
                </div>
                <button onClick={saveBook} style={primaryBtn}>SAVE BOOK</button>
              </div>
            )}

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr', background: C.forest, padding: '10px 1rem', fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>Reader</div><div>Book</div><div>Category</div><div>Status</div><div>Rating (if done)</div>
              </div>
              {books.map((b, i) => {
                const member = MEMBERS.find(m => m.id === b.member_id)?.name
                return (
                  <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1.5fr', padding: '1rem', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.title}</div>
                      <div style={{ fontSize: '0.75rem', color: C.grey }}>{b.author}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.grey }}>{b.category}</div>
                    <div>
                      <select value={b.status} onChange={(e) => changeBookStatus(b.id, e.target.value)} style={{ padding: '0.3rem', fontSize: '0.75rem', border: `1px solid ${C.rule}`, borderRadius: '4px', background: 'transparent' }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      {b.status === 'completed' ? (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(star => (
                            <span key={star} onClick={() => rateBook(b.id, star)} style={{ cursor: 'pointer', color: star <= (b.rating || 0) ? C.gold : C.ruleLight, fontSize: '1.2rem' }}>★</span>
                          ))}
                        </div>
                      ) : <span style={{ fontSize: '0.75rem', color: C.rule }}>—</span>}
                    </div>
                  </div>
                )
              })}
              {books.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: C.grey }}>No books in the library yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <h2 style={{ margin: '0 0 2rem 0', fontWeight: 300, color: C.text }}>Family Leaderboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {MEMBERS.map(m => {
                const memberSessions = sessions.filter(s => s.member_id === m.id)
                const pages = memberSessions.reduce((acc, s) => acc + s.pages_read, 0)
                const completed = books.filter(b => b.member_id === m.id && b.status === 'completed').length
                
                const maxPages = Math.max(...MEMBERS.map(mx => sessions.filter(s => s.member_id === mx.id).reduce((a, s) => a + s.pages_read, 0)), 1)
                const pct = (pages / maxPages) * 100

                return (
                  <div key={m.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ fontFamily: F_MONO, color: C.green }}>{pages} pgs</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: C.cream, borderRadius: '6px', overflow: 'hidden', border: `1px solid ${C.ruleLight}`, marginBottom: '0.5rem' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.goldDim, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: C.grey, fontFamily: F_MONO }}>{completed} books done</div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: C.forest, padding: '2rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${C.ruleLight}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆</div>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Top Reader All-Time</div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: C.green }}>
                {(() => {
                  const totals = MEMBERS.map(m => ({ name: m.name, p: sessions.filter(s => s.member_id === m.id).reduce((a,s) => a+s.pages_read, 0) }))
                  const top = totals.sort((a,b) => b.p - a.p)[0]
                  return top.p > 0 ? `${top.name} (${top.p} pages)` : 'No pages read yet'
                })()}
              </h3>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>📚 Family Reading Resources</h2>
                <button onClick={() => setShowResourceForm(!showResourceForm)} style={primaryBtn}>
                  {showResourceForm ? 'CANCEL' : 'ADD RESOURCE'}
                </button>
              </div>

              {showResourceForm && (
                <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input placeholder="Resource Title" value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} style={inputStyle} />
                    <input placeholder="Author (optional)" value={resourceForm.author} onChange={e => setResourceForm({...resourceForm, author: e.target.value})} style={inputStyle} />
                    <select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})} style={inputStyle}>
                      {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input placeholder="Web URL (if linking externally)" value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} style={inputStyle} />
                    <input placeholder="Google Drive link (if storing in Drive)" value={resourceForm.driveUrl} onChange={e => setResourceForm({...resourceForm, driveUrl: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <select value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})} style={inputStyle}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {AGE_GROUPS.map(ag => (
                        <label key={ag} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', gap: '0.3rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={resourceForm.ageGroups.includes(ag)} onChange={e => {
                            if (e.target.checked) {
                              setResourceForm({...resourceForm, ageGroups: [...resourceForm.ageGroups, ag]})
                            } else {
                              setResourceForm({...resourceForm, ageGroups: resourceForm.ageGroups.filter(a => a !== ag)})
                            }
                          }} style={{ cursor: 'pointer' }} />
                          {ag}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button onClick={saveResource} style={primaryBtn}>SAVE RESOURCE</button>
                </div>
              )}

              {/* Search & Filters */}
              <div style={{ background: C.forest, padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  placeholder="Search resources..."
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  style={{...inputStyle, flex: 1, minWidth: '200px', padding: '0.5rem'}}
                />
                <select value={libraryFilters.category} onChange={e => setLibraryFilters({...libraryFilters, category: e.target.value})} style={{...inputStyle, padding: '0.5rem'}}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={libraryFilters.ageGroup} onChange={e => setLibraryFilters({...libraryFilters, ageGroup: e.target.value})} style={{...inputStyle, padding: '0.5rem'}}>
                  <option value="All Ages">All Ages</option>
                  {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                </select>
                <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.white, background: C.green, padding: '0.3rem 0.8rem', borderRadius: '4px' }}>
                  {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredResources.map(r => (
                  <div key={r.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>{r.icon || '📖'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: C.text }}>{r.title}</div>
                        {r.author && <div style={{ fontSize: '0.8rem', color: C.grey }}>by {r.author}</div>}
                      </div>
                    </div>

                    {r.description && (
                      <div style={{ fontSize: '0.8rem', color: C.grey, marginBottom: '1rem', lineHeight: '1.4' }}>
                        {r.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.white, background: C.green, padding: '0.2rem 0.5rem', borderRadius: '3px', textTransform: 'uppercase' }}>
                        {r.type}
                      </span>
                      {r.category && <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.green, background: C.cream, padding: '0.2rem 0.5rem', borderRadius: '3px', textTransform: 'uppercase' }}>
                        {r.category}
                      </span>}
                      {r.categories && r.categories.slice(0, 2).map(cat => (
                        <span key={cat} style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.green, background: C.cream, padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
                          {cat}
                        </span>
                      ))}
                    </div>

                    {r.ageGroups && (
                      <div style={{ fontSize: '0.75rem', color: C.grey, marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px dashed ${C.ruleLight}` }}>
                        <span style={{ fontWeight: 600 }}>Age:</span> {r.ageGroups.join(', ')}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{
                          ...primaryBtn,
                          flex: 1,
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'inline-block',
                          padding: '0.5rem'
                        }}>
                          Open Link ↗
                        </a>
                      )}
                      {r.driveUrl && (
                        <a href={r.driveUrl} target="_blank" rel="noopener noreferrer" style={{
                          ...primaryBtn,
                          flex: 1,
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'inline-block',
                          padding: '0.5rem',
                          background: C.blue
                        }}>
                          Drive ↗
                        </a>
                      )}
                    </div>

                    {r.addedBy && <div style={{ fontSize: '0.65rem', color: C.grey, marginTop: '0.5rem', textAlign: 'right', fontStyle: 'italic' }}>
                      Added by {r.addedBy}
                    </div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...emptyState, gridColumn: '1 / -1' }}>
                No resources match your filters. Try adjusting your search or filters!
              </div>
            )}

            {/* Completed Books Section */}
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `2px solid ${C.ruleLight}` }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300, color: C.text }}>📖 Family's Completed Books</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {books.filter(b => b.status === 'completed').sort((a,b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()).map(b => {
                  const member = MEMBERS.find(m => m.id === b.member_id)?.name
                  return (
                    <div key={b.id} style={{ border: `1px solid ${b.rating === 5 ? C.gold : C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: b.rating === 5 ? C.goldPale : C.white }}>
                      {b.rating === 5 && <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.goldDim, marginBottom: '0.5rem', textTransform: 'uppercase' }}>⭐ Highly Recommended</div>}
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', color: C.text, marginBottom: '0.2rem' }}>{b.title}</div>
                      <div style={{ fontSize: '0.85rem', color: C.grey, marginBottom: '1rem' }}>by {b.author}</div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${C.ruleLight}`, paddingTop: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontFamily: F_MONO, color: C.green, background: C.cream, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{b.category}</div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(star => <span key={star} style={{ color: star <= (b.rating || 0) ? C.goldDim : C.ruleLight, fontSize: '1rem' }}>★</span>)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: C.grey, marginTop: '0.5rem', textAlign: 'right' }}>Read by {member}</div>
                    </div>
                  )
                })}
                {books.filter(b => b.status === 'completed').length === 0 && <div style={{ ...emptyState, gridColumn: '1 / -1' }}>Finish reading books to see them here!</div>}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = {
  padding: '0.75rem',
  border: `1px solid ${C.rule}`,
  borderRadius: '6px',
  fontFamily: F_SANS,
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box' as const
}

const primaryBtn = {
  background: C.green,
  color: C.white,
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  fontFamily: F_MONO,
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.05em'
}

const emptyState = {
  padding: '3rem',
  textAlign: 'center' as const,
  color: C.grey,
  background: C.cream,
  borderRadius: '8px',
  border: `1px dashed ${C.rule}`,
  fontStyle: 'italic'
}