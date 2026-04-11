// app/sab/sab-client.tsx
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

const STATUSES = ['outline', 'drafting', 'review', 'complete']
const STATUS_COLORS: Record<string, string> = {
  outline: C.grey,
  drafting: C.blue,
  review: C.goldDim,
  complete: C.green
}

const PLATFORMS = ['linkedin', 'newsletter', 'instagram', 'podcast', 'other']

export default function SouthAfricanBedouin() {
  const [activeTab, setActiveTab] = useState('chapters')
  const [loading, setLoading] = useState(true)
  
  const [chapters, setChapters] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [ideas, setIdeas] = useState<any[]>([])
  const [weeklyTarget, setWeeklyTarget] = useState(2000)
  const [streak, setStreak] = useState(0)

  // Forms
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [chapterForm, setChapterForm] = useState({ chapter_num: '', title: '', subtitle: '', theme: '', target_words: '2000', notes: '', status: 'outline' })
  
  const [sessionForm, setSessionForm] = useState({ chapter_id: '', words_written: '', duration_min: '', notes: '' })
  const [ideaForm, setIdeaForm] = useState({ chapter_id: '', platform: 'linkedin', idea: '' })
  
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cRes, sRes, iRes] = await Promise.all([
        supabase.from('sab_chapters').select('*').order('chapter_num', { ascending: true }),
        supabase.from('sab_writing_sessions').select('*').order('logged_at', { ascending: false }),
        supabase.from('sab_content_ideas').select('*').order('created_at', { ascending: false })
      ])

      let loadedChapters = cRes.data || JSON.parse(localStorage.getItem('bayt-sab-chapters-v1') || '[]')
      if (loadedChapters.length === 0) {
        loadedChapters = [{ id: crypto.randomUUID(), chapter_num: 1, title: 'The War Machine', subtitle: 'Where it begins', status: 'complete', word_count: 2000, target_words: 2000, theme: 'Origin · Identity · What I was built from', notes: '', created_at: new Date().toISOString() }]
        localStorage.setItem('bayt-sab-chapters-v1', JSON.stringify(loadedChapters))
      }

      setChapters(loadedChapters)
      setSessions(sRes.data || JSON.parse(localStorage.getItem('bayt-sab-sessions-v1') || '[]'))
      setIdeas(iRes.data || JSON.parse(localStorage.getItem('bayt-sab-ideas-v1') || '[]'))
      
      const wt = localStorage.getItem('bayt-sab-weekly-target-v1')
      if (wt) setWeeklyTarget(Number(wt))
      
      const st = localStorage.getItem('bayt-sab-streak-v1')
      if (st) setStreak(Number(st))
      
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveChapter = async () => {
    if (!chapterForm.title || !chapterForm.chapter_num) return
    const newC = { id: crypto.randomUUID(), ...chapterForm, chapter_num: Number(chapterForm.chapter_num), target_words: Number(chapterForm.target_words), word_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    const updated = [...chapters, newC].sort((a,b) => a.chapter_num - b.chapter_num)
    setChapters(updated)
    localStorage.setItem('bayt-sab-chapters-v1', JSON.stringify(updated))
    setShowChapterForm(false)
    setChapterForm({ chapter_num: '', title: '', subtitle: '', theme: '', target_words: '2000', notes: '', status: 'outline' })
    try { await supabase.from('sab_chapters').insert(newC) } catch(e) {}
  }

  const addSession = async () => {
    if (!sessionForm.words_written || !sessionForm.chapter_id) return
    const words = Number(sessionForm.words_written)
    const newS = { id: crypto.randomUUID(), ...sessionForm, words_written: words, duration_min: Number(sessionForm.duration_min)||0, logged_at: new Date().toISOString() }
    const updatedS = [newS, ...sessions]
    setSessions(updatedS)
    localStorage.setItem('bayt-sab-sessions-v1', JSON.stringify(updatedS))
    
    // Update streak naive implementation
    const newStreak = streak + 1
    setStreak(newStreak)
    localStorage.setItem('bayt-sab-streak-v1', newStreak.toString())

    const chapter = chapters.find(c => c.id === sessionForm.chapter_id)
    if (chapter) {
      const newWords = (chapter.word_count || 0) + words
      const updatedC = chapters.map(c => c.id === chapter.id ? { ...c, word_count: newWords, updated_at: new Date().toISOString() } : c)
      setChapters(updatedC)
      localStorage.setItem('bayt-sab-chapters-v1', JSON.stringify(updatedC))
      try { 
        await supabase.from('sab_writing_sessions').insert(newS)
        await supabase.from('sab_chapters').update({ word_count: newWords, updated_at: new Date().toISOString() }).eq('id', chapter.id)
      } catch(e) {}
    }
    
    setSessionForm({ chapter_id: '', words_written: '', duration_min: '', notes: '' })
  }

  const addIdea = async () => {
    if (!ideaForm.idea || !ideaForm.chapter_id) return
    const newI = { id: crypto.randomUUID(), ...ideaForm, status: 'idea', created_at: new Date().toISOString() }
    const updated = [newI, ...ideas]
    setIdeas(updated)
    localStorage.setItem('bayt-sab-ideas-v1', JSON.stringify(updated))
    setIdeaForm({ chapter_id: '', platform: 'linkedin', idea: '' })
    try { await supabase.from('sab_content_ideas').insert(newI) } catch(e) {}
  }

  const cycleIdeaStatus = async (id: string, currentStatus: string) => {
    const sMap: Record<string, string> = { idea: 'drafted', drafted: 'published', published: 'idea' }
    const newStatus = sMap[currentStatus]
    const updated = ideas.map(i => i.id === id ? { ...i, status: newStatus } : i)
    setIdeas(updated)
    localStorage.setItem('bayt-sab-ideas-v1', JSON.stringify(updated))
    try { await supabase.from('sab_content_ideas').update({ status: newStatus }).eq('id', id) } catch(e) {}
  }

  // Calculations
  const totalWords = chapters.reduce((acc, c) => acc + (c.word_count || 0), 0)
  const targetTotal = 70000 // 35 * 2000
  const completionPct = Math.min((totalWords / targetTotal) * 100, 100)
  const completedChapters = chapters.filter(c => c.status === 'complete').length
  
  const currentWeekStart = new Date()
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1) // Monday
  currentWeekStart.setHours(0,0,0,0)
  const wordsThisWeek = sessions.filter(s => new Date(s.logged_at) >= currentWeekStart).reduce((a,s) => a + s.words_written, 0)

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Opening manuscript...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Muhammad Seedat · In Progress</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '0.02em' }}>THE SOUTH AFRICAN BEDOUIN</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>الحياة قصة</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center', fontFamily: F_MONO }}>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.white }}>{completedChapters}/{chapters.length}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>CHAPTERS DONE</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.gold }}>{totalWords.toLocaleString()}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>TOTAL WORDS</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', color: C.white }}>{ideas.length}</div>
            <div style={{ fontSize: '0.6rem', color: C.goldPale }}>CONTENT IDEAS</div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'chapters', label: '📖 Chapters' },
          { id: 'sessions', label: '✍️ Writing Sessions' },
          { id: 'ideas', label: '💡 Content Ideas' },
          { id: 'dashboard', label: '📊 Dashboard' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: activeTab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '0.05em'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.white, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {activeTab === 'chapters' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 300, color: C.text }}>Manuscript Structure</h2>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.grey, marginTop: '0.5rem' }}>
                  {totalWords.toLocaleString()} / {targetTotal.toLocaleString()} words ({(completionPct).toFixed(1)}%)
                </div>
              </div>
              <button onClick={() => setShowChapterForm(!showChapterForm)} style={primaryBtn}>
                {showChapterForm ? 'CANCEL' : 'ADD CHAPTER'}
              </button>
            </div>

            {showChapterForm && (
              <div style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 2fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="number" placeholder="Ch #" value={chapterForm.chapter_num} onChange={e => setChapterForm({...chapterForm, chapter_num: e.target.value})} style={inputStyle} />
                  <input placeholder="Title" value={chapterForm.title} onChange={e => setChapterForm({...chapterForm, title: e.target.value})} style={inputStyle} />
                  <input placeholder="Subtitle" value={chapterForm.subtitle} onChange={e => setChapterForm({...chapterForm, subtitle: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input placeholder="Theme" value={chapterForm.theme} onChange={e => setChapterForm({...chapterForm, theme: e.target.value})} style={inputStyle} />
                  <input type="number" placeholder="Target Words" value={chapterForm.target_words} onChange={e => setChapterForm({...chapterForm, target_words: e.target.value})} style={inputStyle} />
                  <select value={chapterForm.status} onChange={e => setChapterForm({...chapterForm, status: e.target.value})} style={inputStyle}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <textarea placeholder="Chapter notes / outline..." value={chapterForm.notes} onChange={e => setChapterForm({...chapterForm, notes: e.target.value})} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '60px', resize: 'vertical'}} />
                <button onClick={saveChapter} style={primaryBtn}>SAVE CHAPTER</button>
              </div>
            )}

            <div style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 3fr 2fr 100px', background: C.forest, padding: '10px 16px', fontFamily: F_MONO, fontSize: '0.6rem', color: C.goldDim, textTransform: 'uppercase' }}>
                <div>#</div><div>Chapter</div><div>Theme</div><div style={{textAlign: 'right'}}>Status</div>
              </div>
              {chapters.map((c, i) => (
                <React.Fragment key={c.id}>
                  <div onClick={() => setExpandedChapter(expandedChapter === c.id ? null : c.id)} style={{ display: 'grid', gridTemplateColumns: '40px 3fr 2fr 100px', padding: '12px 16px', background: i % 2 === 0 ? C.white : C.cream, borderTop: `1px solid ${C.ruleLight}`, alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ fontFamily: F_MONO, fontWeight: 600, color: C.grey }}>{c.chapter_num}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: C.text }}>{c.title}</div>
                      {c.subtitle && <div style={{ fontSize: '0.8rem', color: C.grey }}>{c.subtitle}</div>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: C.grey, fontFamily: F_SANS }}>{c.theme}</div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, background: STATUS_COLORS[c.status], color: C.white, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{c.status}</span>
                    </div>
                  </div>
                  {expandedChapter === c.id && (
                    <div style={{ padding: '1.5rem', background: C.forest, borderTop: `1px dashed ${C.ruleLight}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: C.green, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F_MONO, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span>{c.word_count || 0} / {c.target_words} words</span>
                            <span>{Math.round(((c.word_count||0)/c.target_words)*100)}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: C.ruleLight, borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ width: `${Math.min(((c.word_count||0)/c.target_words)*100, 100)}%`, height: '100%', background: C.goldDim }} />
                          </div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: C.green, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: C.text, lineHeight: 1.5 }}>{c.notes || 'No notes.'}</p>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: C.green, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content Ideas</h4>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: C.text, lineHeight: 1.5 }}>
                            {ideas.filter(idea => idea.chapter_id === c.id).map(idea => (
                              <li key={idea.id} style={{ marginBottom: '0.25rem' }}>[{idea.platform}] {idea.idea}</li>
                            ))}
                            {ideas.filter(idea => idea.chapter_id === c.id).length === 0 && <li style={{ color: C.grey, listStyle: 'none', marginLeft: '-1.2rem' }}>No ideas extracted yet.</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 300, color: C.gold, marginBottom: '0.5rem' }}>{streak}</div>
                <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldPale, letterSpacing: '0.1em' }}>DAY WRITING STREAK</div>
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '1.5rem', opacity: 0.9 }}>"Istiqama. Show up for the book every day, even for 10 minutes."</p>
              </div>

              <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                <h3 style={{ margin: '0 0 1rem 0', fontWeight: 300 }}>Log Writing Session</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <select value={sessionForm.chapter_id} onChange={e => setSessionForm({...sessionForm, chapter_id: e.target.value})} style={inputStyle}>
                    <option value="">Select Chapter</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>{c.chapter_num}. {c.title}</option>)}
                  </select>
                  <input type="number" placeholder="Words" value={sessionForm.words_written} onChange={e => setSessionForm({...sessionForm, words_written: e.target.value})} style={inputStyle} />
                  <input type="number" placeholder="Mins" value={sessionForm.duration_min} onChange={e => setSessionForm({...sessionForm, duration_min: e.target.value})} style={inputStyle} />
                </div>
                <input placeholder="Notes / Reflections..." value={sessionForm.notes} onChange={e => setSessionForm({...sessionForm, notes: e.target.value})} style={{...inputStyle, width: '100%', marginBottom: '1rem'}} />
                <button onClick={addSession} style={{ ...primaryBtn, width: '100%' }}>SAVE SESSION</button>
              </div>
            </div>

            <h3 style={{ fontWeight: 300, borderBottom: `1px solid ${C.ruleLight}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>Session History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessions.map(s => {
                const chapter = chapters.find(c => c.id === s.chapter_id)
                return (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: `1px solid ${C.ruleLight}`, borderRadius: '6px', background: C.white }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{chapter ? `${chapter.chapter_num}. ${chapter.title}` : 'General Writing'}</div>
                      <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO, marginTop: '4px' }}>{new Date(s.logged_at).toLocaleDateString()} {s.duration_min ? `· ${s.duration_min} mins` : ''} {s.notes ? `· ${s.notes}` : ''}</div>
                    </div>
                    <div style={{ fontFamily: F_MONO, fontWeight: 600, color: C.green, fontSize: '1.1rem' }}>+{s.words_written}</div>
                  </div>
                )
              })}
              {sessions.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: C.grey, fontStyle: 'italic' }}>No sessions logged. Start writing!</div>}
            </div>
          </div>
        )}

        {activeTab === 'ideas' && (
          <div>
            <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, marginBottom: '2rem' }}>
              <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Every chapter is 5 pieces of content. The book and the brand feed each other.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <select value={ideaForm.chapter_id} onChange={e => setIdeaForm({...ideaForm, chapter_id: e.target.value})} style={inputStyle}>
                  <option value="">Select Chapter</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>{c.chapter_num}. {c.title}</option>)}
                </select>
                <select value={ideaForm.platform} onChange={e => setIdeaForm({...ideaForm, platform: e.target.value})} style={inputStyle}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input placeholder="Idea text..." value={ideaForm.idea} onChange={e => setIdeaForm({...ideaForm, idea: e.target.value})} style={{...inputStyle, flex: 1}} />
                <button onClick={addIdea} style={primaryBtn}>EXTRACT IDEA</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {ideas.map(i => {
                const chapter = chapters.find(c => c.id === i.chapter_id)
                const sColors: Record<string, string> = { idea: C.grey, drafted: C.blue, published: C.green }
                return (
                  <div key={i.id} style={{ border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '1.5rem', background: C.white }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: F_MONO, background: C.ruleLight, padding: '0.2rem 0.5rem', borderRadius: '4px', color: C.text, textTransform: 'uppercase' }}>{i.platform}</span>
                      <button onClick={() => cycleIdeaStatus(i.id, i.status)} style={{ background: sColors[i.status], color: C.white, border: 'none', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontFamily: F_MONO, textTransform: 'uppercase', cursor: 'pointer' }}>
                        {i.status} ↺
                      </button>
                    </div>
                    <div style={{ fontSize: '1rem', color: C.text, lineHeight: 1.5, marginBottom: '1rem' }}>"{i.idea}"</div>
                    <div style={{ fontSize: '0.75rem', color: C.grey, fontFamily: F_MONO }}>From: {chapter ? `Ch ${chapter.chapter_num}. ${chapter.title}` : 'General'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              
              <div style={{ background: C.white, border: `1px solid ${C.ruleLight}`, borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 2rem 0', fontWeight: 300 }}>Manuscript Completion</h3>
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', background: C.cream, border: `10px solid ${C.ruleLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Pseudo-circular progress for simplicity without external libs */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: `10px solid ${C.green}`, clipPath: `polygon(0 0, 100% 0, 100% ${completionPct}%, 0 ${completionPct}%)` }} />
                  <div style={{ zIndex: 10 }}>
                    <div style={{ fontSize: '2.5rem', color: C.green, fontWeight: 300 }}>{Math.round(completionPct)}%</div>
                    <div style={{ fontSize: '0.8rem', fontFamily: F_MONO, color: C.grey }}>{totalWords.toLocaleString()} wds</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: C.cream, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey, textTransform: 'uppercase' }}>Weekly Target</span>
                    <button onClick={() => { const t = prompt('Set weekly word target:', weeklyTarget.toString()); if (t && !isNaN(Number(t))) { setWeeklyTarget(Number(t)); localStorage.setItem('bayt-sab-weekly-target-v1', t); } }} style={{ background: 'none', border: 'none', color: C.blue, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                  </div>
                  <div style={{ fontSize: '1.5rem', color: C.text, fontWeight: 300 }}>{wordsThisWeek.toLocaleString()} <span style={{ fontSize: '1rem', color: C.grey }}>/ {weeklyTarget.toLocaleString()}</span></div>
                  <div style={{ width: '100%', height: '6px', background: C.white, borderRadius: '3px', overflow: 'hidden', marginTop: '0.5rem' }}>
                    <div style={{ width: `${Math.min((wordsThisWeek / weeklyTarget) * 100, 100)}%`, height: '100%', background: wordsThisWeek >= weeklyTarget ? C.green : C.blue }} />
                  </div>
                </div>

                <div style={{ background: C.forest, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${C.goldDim}` }}>
                  <div style={{ fontFamily: F_MONO, fontSize: '0.7rem', color: C.goldDim, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Inspiration</div>
                  <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: C.text, lineHeight: 1.5, marginBottom: '0.5rem' }}>"You are writing your children's history."</div>
                  <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: C.text, lineHeight: 1.5 }}>"Every chapter is an act of Sidq — honest testimony to a life lived."</div>
                </div>
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