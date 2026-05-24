'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor').then(m => m.RichTextEditor), { ssr: false, loading: () => <div className="border border-hairline rounded-lg bg-muted animate-pulse h-48" /> })
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import slugify from 'slugify'
import {
  Save, Eye, Star, X as XIcon,
} from 'lucide-react'
import { MediaPickerField, type PickedMedia } from './MediaPickerField'

interface ProjectImage {
  id?: string
  url: string
  alt?: string | null
  caption?: string | null
  order: number
}

interface Project {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  status: string
  category: string | null
  techStack: string[]
  liveUrl: string | null
  githubUrl: string | null
  startDate: Date | string | null
  endDate: Date | string | null
  ongoing: boolean
  visible: boolean
  featured: boolean
  order: number
  images: ProjectImage[]
}

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
]

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return ''
  try {
    const d = date instanceof Date ? date : new Date(date)
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export function ProjectEditor({ project }: { project: Project | null }) {
  const router = useRouter()
  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [excerpt, setExcerpt] = useState(project?.excerpt ?? '')
  const [body, setBody] = useState(project?.body ?? '')
  const [featuredImageUrl, setFeaturedImageUrl] = useState(project?.featuredImageUrl ?? '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(project?.featuredImageAlt ?? '')
  const [status, setStatus] = useState(project?.status ?? 'planned')
  const [category, setCategory] = useState(project?.category ?? '')
  const [techStackInput, setTechStackInput] = useState(project?.techStack.join(', ') ?? '')
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '')
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '')
  const [startDate, setStartDate] = useState(formatDateForInput(project?.startDate))
  const [endDate, setEndDate] = useState(formatDateForInput(project?.endDate))
  const [ongoing, setOngoing] = useState(project?.ongoing ?? false)
  const [visible, setVisible] = useState(project?.visible ?? true)
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [order, setOrder] = useState(project?.order ?? 0)
  const [images, setImages] = useState<ProjectImage[]>(project?.images ?? [])
  const [saving, setSaving] = useState(false)

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val)
    if (!project) setSlug(slugify(val, { lower: true, strict: true }))
  }, [project])

  function handleFeaturedPick(p: PickedMedia) {
    setFeaturedImageUrl(p.url)
    if (p.alt && !featuredImageAlt) setFeaturedImageAlt(p.alt)
  }

  function addGalleryImage(p: PickedMedia) {
    setImages(prev => [...prev, { url: p.url, alt: p.alt ?? null, caption: null, order: prev.length }])
  }

  function removeGalleryImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })))
  }

  function getTechStack(): string[] {
    return techStackInput.split(',').map(s => s.trim()).filter(Boolean)
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required.'); return }
    if (!slug.trim()) { toast.error('Slug is required.'); return }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) { toast.error('Slug must be URL-safe (lowercase letters, numbers, hyphens).'); return }
    if (startDate && endDate && !ongoing && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date.'); return
    }

    setSaving(true)
    try {
      const payload = {
        title, slug, excerpt, body,
        featuredImageUrl: featuredImageUrl || null,
        featuredImageAlt: featuredImageAlt || null,
        status, category: category || null,
        techStack: getTechStack(),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        startDate: startDate || null,
        endDate: ongoing ? null : (endDate || null),
        ongoing, visible, featured, order,
        images: images.map((img, i) => ({
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          order: i,
        })),
      }

      const res = await fetch(
        project ? `/api/admin/projects/${project.id}` : '/api/admin/projects',
        {
          method: project ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Save failed')
      }

      toast.success(project ? 'Project updated!' : 'Project created!')
      if (!project) router.push('/admin/projects')
      else router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const statusOption = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]

  return (
    <div className="space-y-6">
      {/* Featured image */}
      <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4">
        <div>
          <h2 className="font-serif text-lg text-fg">Featured image</h2>
          <p className="text-sm text-fg-muted mt-1">Main image shown on the project card and hero.</p>
        </div>

        {featuredImageUrl ? (
          <div className="grid md:grid-cols-[1fr_2fr] gap-4">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-hairline bg-muted">
              <Image src={featuredImageUrl} alt={featuredImageAlt || 'Featured image'} fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" unoptimized />
            </div>
            <div className="space-y-3">
              <MediaPickerField value={featuredImageUrl} onChange={setFeaturedImageUrl} onPick={handleFeaturedPick} mode="image" placeholder="/images/… or https://…" />
              <div>
                <label htmlFor="fea-alt" className="block text-xs text-fg-muted mb-1">Alt text</label>
                <input id="fea-alt" value={featuredImageAlt} onChange={e => setFeaturedImageAlt(e.target.value)} placeholder="Describe the image" className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" />
              </div>
            </div>
          </div>
        ) : (
          <MediaPickerField value={featuredImageUrl} onChange={setFeaturedImageUrl} onPick={handleFeaturedPick} mode="image" placeholder="Pick an image, upload, or paste URL" />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Title</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand text-lg" placeholder="Project title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Excerpt</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className="w-full px-4 py-3 bg-card border border-hairline rounded-xl text-fg focus:outline-none focus:ring-2 focus:ring-brand resize-none" placeholder="Short description of the project..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Description</label>
            <RichTextEditor value={body} onChange={setBody} minHeight={300} placeholder="Full project description..." />
          </div>

          {/* Gallery images */}
          <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg text-fg">Project Gallery</h2>
                <p className="text-sm text-fg-muted mt-1">Additional images showcasing the project.</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-hairline bg-muted aspect-[16/10]">
                    <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="200px" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <MediaPickerField
              value=""
              onChange={() => {}}
              onPick={addGalleryImage}
              mode="image"
              placeholder="Add image to gallery..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-hairline p-6 space-y-5">
            {/* Status */}
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusOption.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status === 'completed' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                {statusOption.label}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm">
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated-from-title" className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Category</label>
              <input value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" placeholder="e.g. Web App, Mobile, API" />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Tech Stack</label>
              <input value={techStackInput} onChange={e => setTechStackInput(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" placeholder="Next.js, TypeScript, Prisma" />
              <p className="text-xs text-fg-muted mt-1">Comma-separated tags</p>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-fg-muted">Duration</label>
              <div>
                <label className="block text-xs text-fg-muted mb-1">Start date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ongoing} onChange={e => setOngoing(e.target.checked)} className="h-4 w-4 accent-brand rounded" />
                <span className="text-sm text-fg">Ongoing project</span>
              </label>
              {!ongoing && (
                <div>
                  <label className="block text-xs text-fg-muted mb-1">End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" />
                </div>
              )}
            </div>

            {/* Links */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-fg-muted">Links</label>
              <input value={liveUrl} onChange={e => setLiveUrl(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" placeholder="Live URL" />
              <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" placeholder="GitHub URL" />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Display order</label>
              <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full px-3 py-2.5 bg-muted border border-hairline rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand text-sm" />
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-hairline">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-fg flex items-center gap-2">
                  <Eye className="h-4 w-4 text-fg-muted" /> Visible
                </span>
                <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className="h-4 w-4 accent-brand rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-fg flex items-center gap-2">
                  <Star className="h-4 w-4 text-fg-muted" /> Featured
                </span>
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="h-4 w-4 accent-brand rounded" />
              </label>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-brand hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : project ? 'Update project' : 'Create project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
