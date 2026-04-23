'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import slugify from 'slugify'
import {
  ImageIcon, ExternalLink, Save, Send,
  CheckCircle2, Mail, X as XIcon,
} from 'lucide-react'
import { MediaPickerField, MediaPickerDialogOnly, type PickedMedia } from './MediaPickerField'

interface Post {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string
  category: string | null
  status: string
  tags: string[]
  featuredImageUrl: string
  featuredImageAlt: string
  featuredImageAttribution: unknown
}

type Attribution = { photographer?: string; source?: string; source_url?: string }

// ---------------------------------------------------------------------------
// Draft auto-save helpers
// ---------------------------------------------------------------------------
const AUTOSAVE_INTERVAL = 30_000 // 30 seconds

function getDraftKey(postId: string | undefined) {
  return postId ? `blog-draft-${postId}` : 'blog-draft-new'
}

interface DraftPayload {
  title: string
  slug: string
  excerpt: string
  category: string
  body: string
  featuredImageUrl: string
  featuredImageAlt: string
  savedAt: number
}

function saveDraftToStorage(key: string, data: DraftPayload) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* quota exceeded – silently ignore */ }
}

function loadDraftFromStorage(key: string): DraftPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as DraftPayload) : null
  } catch {
    return null
  }
}

function clearDraftFromStorage(key: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch { /* ignore */ }
}

export function BlogEditor({ post }: { post: Post | null }) {
  const router = useRouter()
  const draftKey = getDraftKey(post?.id)
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [status, setStatus] = useState(post?.status ?? 'draft')
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featuredImageUrl ?? '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt ?? '')
  const [featuredAttribution, setFeaturedAttribution] = useState<Attribution | null>(
    (post?.featuredImageAttribution as Attribution | null) ?? null,
  )
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [draftBanner, setDraftBanner] = useState(false)
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null)
  const savedDraftRef = useRef<DraftPayload | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const isPublished = status === 'published'

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
    ],
    content: post?.body ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-6',
      },
    },
  })

  // --- Draft recovery on mount ---
  useEffect(() => {
    const draft = loadDraftFromStorage(draftKey)
    if (draft) {
      savedDraftRef.current = draft
      setDraftBanner(true)
    }
  }, [draftKey])

  const restoreDraft = useCallback(() => {
    const draft = savedDraftRef.current
    if (!draft) return
    setTitle(draft.title)
    setSlug(draft.slug)
    setExcerpt(draft.excerpt)
    setCategory(draft.category)
    setFeaturedImageUrl(draft.featuredImageUrl)
    setFeaturedImageAlt(draft.featuredImageAlt)
    if (editor) editor.commands.setContent(draft.body)
    setDraftBanner(false)
    toast.success('Draft restored.')
  }, [editor])

  const discardDraft = useCallback(() => {
    clearDraftFromStorage(draftKey)
    savedDraftRef.current = null
    setDraftBanner(false)
  }, [draftKey])

  // --- Auto-save timer ---
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      if (!editor) return
      const payload: DraftPayload = {
        title, slug, excerpt, category,
        body: editor.getHTML(),
        featuredImageUrl, featuredImageAlt,
        savedAt: Date.now(),
      }
      saveDraftToStorage(draftKey, payload)
      setLastAutoSaved(new Date())
    }, AUTOSAVE_INTERVAL)

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current)
    }
  }, [editor, title, slug, excerpt, category, featuredImageUrl, featuredImageAlt, draftKey])

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val)
    if (!post) setSlug(slugify(val, { lower: true, strict: true }))
  }, [post])

  function handleFeaturedPick(p: PickedMedia) {
    setFeaturedImageUrl(p.url)
    if (p.alt && !featuredImageAlt) setFeaturedImageAlt(p.alt)
    setFeaturedAttribution(p.attribution ?? null)
  }

  function handleInlinePick(p: PickedMedia) {
    if (!editor) return
    if (p.type === 'image') {
      editor.chain().focus().setImage({ src: p.url, alt: p.alt ?? '' }).run()
    } else if (p.type === 'video') {
      editor
        .chain()
        .focus()
        .insertContent(`<p><video controls src="${escapeAttr(p.url)}" class="w-full rounded-xl"></video></p>`)
        .run()
    } else if (p.type === 'embed' && p.embedUrl) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<p><iframe src="${escapeAttr(p.embedUrl)}" class="w-full aspect-video rounded-xl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>`
        )
        .run()
    } else if (p.type === 'embed') {
      editor.chain().focus().insertContent(`<p><a href="${escapeAttr(p.url)}" target="_blank" rel="noopener">${escapeText(p.url)}</a></p>`).run()
    } else if (p.type === 'doc') {
      editor.chain().focus().insertContent(`<p><a href="${escapeAttr(p.url)}" target="_blank" rel="noopener">${escapeText(p.url.split('/').pop() || 'Document')}</a></p>`).run()
    }
    setMediaPickerOpen(false)
  }

  function getPostBody() {
    if (!editor) return null
    if (!featuredImageUrl) { toast.error('Featured image is required.'); return null }
    if (!featuredImageAlt.trim()) { toast.error('Featured image alt text is required.'); return null }
    if (!title.trim()) { toast.error('Title is required.'); return null }
    return {
      title, slug, excerpt, category,
      featuredImageUrl,
      featuredImageAlt: featuredImageAlt.trim(),
      featuredImageAttribution: featuredAttribution ?? null,
      body: editor.getHTML(),
    }
  }

  async function handleSaveDraft() {
    const body = getPostBody()
    if (!body) return
    setSaving(true)
    try {
      const res = await fetch(post ? `/api/admin/blog/${post.id}` : '/api/admin/blog', {
        method: post ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, status: 'draft' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Save failed')
      }
      setStatus('draft')
      clearDraftFromStorage(draftKey)
      setLastAutoSaved(null)
      toast.success('Draft saved!')
      if (!post) router.push('/admin/blog')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save draft.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(notifySubscribers: boolean) {
    const body = getPostBody()
    if (!body) return
    setPublishing(true)
    setPublishDialogOpen(false)
    try {
      const res = await fetch(post ? `/api/admin/blog/${post.id}` : '/api/admin/blog', {
        method: post ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, status: 'published', notifySubscribers }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Publish failed')
      }
      const result = await res.json()
      setStatus('published')
      clearDraftFromStorage(draftKey)
      setLastAutoSaved(null)

      if (result.subscribersNotified > 0) {
        toast.success(
          `Published and ${result.subscribersNotified} subscriber${result.subscribersNotified === 1 ? '' : 's'} notified!`,
          { duration: 5000, icon: '🎉' },
        )
      } else {
        toast.success('Post published!', { duration: 4000, icon: '🚀' })
      }

      if (!post) router.push('/admin/blog')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish.')
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish() {
    if (!post) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' }),
      })
      if (!res.ok) throw new Error('Failed to unpublish')
      setStatus('draft')
      toast.success('Post reverted to draft.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unpublish.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Draft recovery banner */}
      {draftBanner && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-5 py-3 text-sm text-amber-800 dark:text-amber-300">
          <span>An unsaved draft was found. Resume where you left off?</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 font-medium transition-colors"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-3 py-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 font-medium transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Featured image */}
      <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-fg">Featured image <span className="text-rose-500">*</span></h2>
            <p className="text-sm text-fg-muted mt-1">Required. Shown on the post page and in the blog index.</p>
          </div>
        </div>

        {featuredImageUrl ? (
          <div className="grid md:grid-cols-[1fr_2fr] gap-4">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-hairline bg-muted">
              <Image src={featuredImageUrl} alt={featuredImageAlt || 'Featured image'} fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" unoptimized />
            </div>
            <div className="space-y-3">
              <MediaPickerField
                value={featuredImageUrl}
                onChange={setFeaturedImageUrl}
                onPick={handleFeaturedPick}
                mode="image"
                placeholder="/images/… or https://…"
              />
              <div>
                <label htmlFor="fea-alt" className="block text-xs text-fg-muted mb-1">
                  Alt text <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fea-alt"
                  value={featuredImageAlt}
                  onChange={e => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe the image for screen readers"
                  className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                />
              </div>
              {featuredAttribution?.photographer && (
                <p className="text-xs text-fg-muted">
                  &copy; {featuredAttribution.photographer}
                  {featuredAttribution.source && ` · ${featuredAttribution.source}`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <MediaPickerField
            value={featuredImageUrl}
            onChange={setFeaturedImageUrl}
            onPick={handleFeaturedPick}
            mode="image"
            placeholder="Pick an image, upload, or paste URL"
          />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Title</label>
            <input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand text-lg"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              placeholder="Short description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Body</label>
            <div className="bg-card border border-hairline rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 p-3 border-b border-hairline flex-wrap">
                {[
                  { label: 'B',  title: 'Bold',       action: () => editor?.chain().focus().toggleBold().run(),      active: editor?.isActive('bold') },
                  { label: 'I',  title: 'Italic',     action: () => editor?.chain().focus().toggleItalic().run(),    active: editor?.isActive('italic') },
                  { label: 'H2', title: 'Heading 2',  action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
                  { label: 'H3', title: 'Heading 3',  action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
                  { label: 'UL', title: 'Bullet list',action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
                  { label: 'OL', title: 'Ordered list',action:() => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
                  { label: '\u275D',  title: 'Quote',      action: () => editor?.chain().focus().toggleBlockquote().run(), active: editor?.isActive('blockquote') },
                ].map(btn => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={btn.action}
                    title={btn.title}
                    className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                      btn.active ? 'bg-brand text-white' : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-600'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
                <div className="w-px h-6 bg-hairline mx-1" />
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-3 py-1.5 text-sm rounded font-medium bg-muted text-fg hover:bg-ink-200 dark:hover:bg-ink-600 inline-flex items-center gap-1.5"
                  title="Insert media"
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Insert media
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Link URL')
                    if (url) editor?.chain().focus().toggleLink({ href: url }).run()
                  }}
                  className="px-3 py-1.5 text-sm rounded font-medium bg-muted text-fg hover:bg-ink-200 dark:hover:bg-ink-600 inline-flex items-center gap-1.5"
                  title="Insert link"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Link
                </button>
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-hairline p-6 space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isPublished
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            {lastAutoSaved && (
              <p className="text-xs text-fg-muted">
                Draft auto-saved at{' '}
                {lastAutoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Slug</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Category</label>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="e.g. Tech, Business"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              {/* Save Draft button */}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || publishing}
                className="w-full py-3 bg-muted hover:bg-ink-200 dark:hover:bg-ink-600 disabled:opacity-60 text-fg font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save draft'}
              </button>

              {/* Publish / Update button */}
              {!isPublished ? (
                <button
                  type="button"
                  onClick={() => setPublishDialogOpen(true)}
                  disabled={saving || publishing}
                  className="w-full py-3 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handlePublish(false)}
                    disabled={saving || publishing}
                    className="w-full py-3 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {publishing ? 'Updating...' : 'Update published post'}
                  </button>
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={saving || publishing}
                    className="w-full py-2.5 text-sm text-fg-muted hover:text-rose-500 transition-colors"
                  >
                    Revert to draft
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publish confirmation dialog */}
      {publishDialogOpen && (
        <PublishDialog
          title={title}
          onClose={() => setPublishDialogOpen(false)}
          onPublish={handlePublish}
          publishing={publishing}
        />
      )}

      {mediaPickerOpen && (
        <MediaPickerDialogOnly mode="any" onPick={handleInlinePick} onClose={() => setMediaPickerOpen(false)} />
      )}
    </div>
  )
}

function PublishDialog({
  title,
  onClose,
  onPublish,
  publishing,
}: {
  title: string
  onClose: () => void
  onPublish: (notify: boolean) => void
  publishing: boolean
}) {
  const [notify, setNotify] = useState(true)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-hairline shadow-xl w-full max-w-md p-6 space-y-5 animate-scale-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-fg">Publish post</h3>
              <p className="text-sm text-fg-muted">Make this post live on your blog</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-fg-muted hover:bg-muted">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-muted/60 rounded-xl p-4">
          <p className="text-sm text-fg font-medium truncate">{title || 'Untitled post'}</p>
          <p className="text-xs text-fg-muted mt-1">This will be visible to everyone on your blog.</p>
        </div>

        {/* Notify subscribers option */}
        <label className="flex items-start gap-3 p-4 rounded-xl border border-hairline hover:border-brand/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={notify}
            onChange={e => setNotify(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand rounded"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium text-fg">Notify subscribers</span>
            </div>
            <p className="text-xs text-fg-muted mt-1">
              Send an email to all confirmed subscribers about this new post.
            </p>
          </div>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-muted hover:bg-ink-200 dark:hover:bg-ink-600 text-fg font-medium rounded-full transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPublish(notify)}
            disabled={publishing}
            className="flex-1 py-2.5 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2 text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            {publishing ? 'Publishing...' : notify ? 'Publish & notify' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
