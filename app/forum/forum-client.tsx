// app/forum/forum-client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const C = {
  green: '#1a3d28', midgreen: '#245235', forest: '#f0ebe0',
  gold: '#c9a84c', goldDim: '#9b7d38', goldPale: '#f0e4c0',
  cream: '#faf8f2', white: '#ffffff', grey: '#6b7c6e',
  rule: '#ddd8cc', ruleLight: '#e8e3d8', text: '#0d1a0f',
  orange: '#e07b39', blue: '#4a9eca', purple: '#8e44ad'
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

const CATEGORIES = [
  { id: 'announcement', icon: '📢', label: 'Announcement', color: C.goldDim },
  { id: 'idea', icon: '💡', label: 'Idea', color: C.blue },
  { id: 'question', icon: '❓', label: 'Question', color: C.orange },
  { id: 'shoutout', icon: '🌟', label: 'Shoutout', color: C.green },
  { id: 'request', icon: '📨', label: 'Request', color: C.purple },
  { id: 'general', icon: '💬', label: 'General', color: C.grey }
]

const REACTIONS = ['❤️', '🌟', '👍', '🤲']

interface FamilyForumProps {
  currentUserId: string
}

export default function FamilyForum({ currentUserId }: FamilyForumProps) {
  const [tab, setTab] = useState('feed')
  const [loading, setLoading] = useState(true)

  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])

  const [postForm, setPostForm] = useState({ category: 'general', title: '', content: '' })
  const [commentForm, setCommentForm] = useState<{ [postId: string]: string }>({})
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  const supabase = createClient()
  const currentUser = currentUserId

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: pData } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false })
      const { data: cData } = await supabase.from('forum_comments').select('*').order('created_at', { ascending: true })
      
      setPosts(pData?.length ? pData : JSON.parse(localStorage.getItem('bayt-forum-posts-v1') || '[]'))
      setComments(cData?.length ? cData : JSON.parse(localStorage.getItem('bayt-forum-comments-v1') || '[]'))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const submitPost = async () => {
    if (!postForm.content) return
    const newPost = { id: crypto.randomUUID(), member_id: currentUser, ...postForm, pinned: false, created_at: new Date().toISOString() }
    const updated = [newPost, ...posts]
    setPosts(updated)
    localStorage.setItem('bayt-forum-posts-v1', JSON.stringify(updated))
    setPostForm({ category: 'general', title: '', content: '' })
    setTab('feed')
    try { await supabase.from('forum_posts').insert(newPost) } catch(e) {}
  }

  const submitComment = async (postId: string) => {
    const text = commentForm[postId]
    if (!text) return
    const newC = { id: crypto.randomUUID(), post_id: postId, member_id: currentUser, content: text, created_at: new Date().toISOString() }
    const updated = [...comments, newC]
    setComments(updated)
    localStorage.setItem('bayt-forum-comments-v1', JSON.stringify(updated))
    setCommentForm({ ...commentForm, [postId]: '' })
    try { await supabase.from('forum_comments').insert(newC) } catch(e) {}
  }

  const submitReaction = async (postId: string, reaction: string) => {
    const newC = { id: crypto.randomUUID(), post_id: postId, member_id: currentUser, content: '', reaction, created_at: new Date().toISOString() }
    const updated = [...comments, newC]
    setComments(updated)
    localStorage.setItem('bayt-forum-comments-v1', JSON.stringify(updated))
    try { await supabase.from('forum_comments').insert(newC) } catch(e) {}
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const updated = posts.filter(p => p.id !== id)
    setPosts(updated)
    localStorage.setItem('bayt-forum-posts-v1', JSON.stringify(updated))
    try { await supabase.from('forum_posts').delete().eq('id', id) } catch(e) {}
  }

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const sortedPosts = [...posts].sort((a,b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Collab metrics
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const postsThisMonth = posts.filter(p => new Date(p.created_at) >= monthStart).length
  const commentsThisMonth = comments.filter(c => new Date(c.created_at) >= monthStart).length
  const collabScore = Math.min(10, Math.round(((postsThisMonth + commentsThisMonth) / 6) * 2))

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: F_MONO, color: C.grey }}>Loading family messages...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: F_SANS }}>
      <header style={{ background: C.green, color: C.white, padding: '2rem', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '0.6rem', letterSpacing: '0.15em', color: C.goldPale, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ideas, questions, and shoutouts</div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300 }}>Family Forum</h1>
          <div style={{ fontFamily: F_ARAB, fontSize: '1.5rem', color: C.goldPale, marginTop: '0.5rem' }}>منتدى الأسرة</div>
        </div>
      </header>

      <div style={{ display: 'flex', background: C.forest, borderBottom: `1px solid ${C.ruleLight}` }}>
        {[
          { id: 'feed', label: '🏠 Feed' },
          { id: 'post', label: '✏️ Post Something' },
          { id: 'my_posts', label: '🔔 My Posts' },
          { id: 'collab', label: '📊 Collaboration' }
        ].map(t => (
          <button 
            key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.green}` : '2px solid transparent',
              fontFamily: F_MONO, fontSize: '0.75rem', color: tab === t.id ? C.green : C.grey, cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ background: C.cream, padding: '2rem', borderRadius: '0 0 12px 12px', border: `1px solid ${C.ruleLight}`, borderTop: 'none', minHeight: '600px' }}>
        
        {(tab === 'feed' || tab === 'my_posts') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sortedPosts.filter(p => tab === 'feed' || p.member_id === currentUser).map(post => {
              const member = MEMBERS.find(m => m.id === post.member_id)
              const cat = CATEGORIES.find(c => c.id === post.category) || CATEGORIES[5]
              const pComments = comments.filter(c => c.post_id === post.id && c.content)
              const pReactions = comments.filter(c => c.post_id === post.id && c.reaction)
              const isExpanded = expandedPost === post.id

              return (
                <div key={post.id} style={{ background: C.white, borderRadius: '8px', border: `1px solid ${post.pinned ? C.gold : C.ruleLight}`, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {post.pinned && <div style={{ background: C.goldPale, color: C.goldDim, padding: '4px 16px', fontSize: '0.7rem', fontFamily: F_MONO, fontWeight: 600 }}>📌 PINNED ANNOUNCEMENT</div>}
                  
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.forest, border: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontFamily: F_MONO, color: C.green }}>
                          {member?.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{member?.name}</div>
                          <div style={{ fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey }}>{timeAgo(post.created_at)}</div>
                        </div>
                      </div>
                      <div style={{ background: cat.color + '22', color: cat.color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontFamily: F_MONO, textTransform: 'uppercase' }}>
                        {cat.icon} {cat.label}
                      </div>
                    </div>

                    {post.title && <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: C.text }}>{post.title}</h3>}
                    <div style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                      {isExpanded ? post.content : (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${C.ruleLight}`, paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {REACTIONS.map(r => {
                          const count = pReactions.filter(x => x.reaction === r).length
                          return (
                            <button key={r} onClick={() => submitReaction(post.id, r)} style={{ background: C.cream, border: `1px solid ${C.ruleLight}`, borderRadius: '20px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                              {r} {count > 0 && <span style={{ color: C.grey, marginLeft: '4px' }}>{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {tab === 'my_posts' && <button onClick={() => deletePost(post.id)} style={{ background: 'none', border: 'none', color: C.orange, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>}
                        <button onClick={() => setExpandedPost(isExpanded ? null : post.id)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: '0.85rem', cursor: 'pointer', fontFamily: F_MONO }}>
                          {pComments.length} Comments
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ background: C.cream, padding: '1.5rem', borderTop: `1px solid ${C.ruleLight}` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {pComments.map(c => {
                          const cMember = MEMBERS.find(m => m.id === c.member_id)
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: C.white, border: `1px solid ${C.ruleLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontFamily: F_MONO, color: C.grey, flexShrink: 0 }}>
                                {cMember?.name.charAt(0)}
                              </div>
                              <div style={{ background: C.white, padding: '0.8rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{cMember?.name}</span>
                                  <span style={{ fontSize: '0.65rem', fontFamily: F_MONO, color: C.grey }}>{timeAgo(c.created_at)}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: C.text }}>{c.content}</div>
                              </div>
                            </div>
                          )
                        })}
                        {pComments.length === 0 && <div style={{ fontSize: '0.8rem', color: C.grey, fontStyle: 'italic' }}>No comments yet. Be the first!</div>}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          placeholder="Write a comment..." 
                          value={commentForm[post.id] || ''} 
                          onChange={e => setCommentForm({...commentForm, [post.id]: e.target.value})} 
                          style={{ flex: 1, padding: '0.75rem', borderRadius: '20px', border: `1px solid ${C.rule}`, outline: 'none', fontSize: '0.85rem' }} 
                        />
                        <button onClick={() => submitComment(post.id)} style={{ background: C.green, color: C.white, border: 'none', padding: '0 1.5rem', borderRadius: '20px', cursor: 'pointer', fontFamily: F_MONO, fontSize: '0.75rem', fontWeight: 600 }}>POST</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {sortedPosts.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: C.grey, fontStyle: 'italic', background: C.white, borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>The forum is quiet. Start a conversation!</div>}
          </div>
        )}

        {tab === 'post' && (
          <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontWeight: 300 }}>Share with the Family</h2>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {CATEGORIES.map(c => (
                <button 
                  key={c.id} onClick={() => setPostForm({...postForm, category: c.id})}
                  style={{ 
                    padding: '8px 16px', borderRadius: '20px', border: `1px solid ${postForm.category === c.id ? c.color : C.ruleLight}`, 
                    background: postForm.category === c.id ? c.color + '22' : C.white, color: postForm.category === c.id ? c.color : C.grey,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontFamily: F_MONO
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <input placeholder="Title (optional)" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} style={inputStyle} />
              <textarea placeholder="What's on your mind?" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} style={{...inputStyle, minHeight: '150px', resize: 'vertical'}} />
            </div>

            {postForm.category === 'request' && (
              <div style={{ background: C.goldPale, color: C.goldDim, padding: '1rem', borderRadius: '6px', marginBottom: '2rem', fontSize: '0.85rem', fontFamily: F_MONO }}>
                ✉️ This will be sent directly to Baba and Mama's Inbox for review.
              </div>
            )}

            <button onClick={submitPost} style={{ background: C.green, color: C.white, border: 'none', padding: '1rem', borderRadius: '6px', width: '100%', fontFamily: F_MONO, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em' }}>
              PUBLISH POST
            </button>
          </div>
        )}

        {tab === 'collab' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 300, color: collabScore > 5 ? C.green : C.orange, marginBottom: '0.5rem', lineHeight: 1 }}>{collabScore}/10</div>
              <div style={{ fontFamily: F_MONO, fontSize: '0.8rem', color: C.grey, letterSpacing: '0.1em' }}>COLLABORATION SCORE</div>
              <p style={{ fontSize: '0.9rem', color: C.text, marginTop: '1.5rem', lineHeight: 1.5 }}>Based on {postsThisMonth} posts and {commentsThisMonth} comments this month across 6 family members.</p>
              
              {collabScore < 5 && (
                <div style={{ marginTop: '2rem', background: C.forest, padding: '1rem', borderRadius: '6px', border: `1px dashed ${C.orange}`, color: C.orange, fontSize: '0.85rem' }}>
                  The forum is quiet. Post a question or shoutout to spark connection!
                </div>
              )}
            </div>

            <div style={{ background: C.white, padding: '2rem', borderRadius: '8px', border: `1px solid ${C.ruleLight}` }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 300 }}>Activity by Member (All Time)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {MEMBERS.map(m => {
                  const mPosts = posts.filter(p => p.member_id === m.id).length
                  const mComments = comments.filter(c => c.member_id === m.id).length
                  const total = mPosts + mComments
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px dashed ${C.ruleLight}`, paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <div style={{ display: 'flex', gap: '1rem', fontFamily: F_MONO, fontSize: '0.75rem', color: C.grey }}>
                        <span>{mPosts} posts</span>
                        <span>{mComments} replies</span>
                        <span style={{ fontWeight: 600, color: C.green, width: '40px', textAlign: 'right' }}>{total} tot</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

const inputStyle = { padding: '1rem', border: `1px solid ${C.rule}`, borderRadius: '6px', fontFamily: F_SANS, fontSize: '1rem', outline: 'none', boxSizing: 'border-box' as const, width: '100%' }