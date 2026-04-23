'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, Save } from 'lucide-react'
import { MediaPickerField } from './MediaPickerField'

interface ContentRow {
  id: string
  page: string
  section: string
  fieldKey: string
  value: string
  fieldType: string
  updatedAt: Date
}

interface ContentEditorProps {
  page: string
  initialRows: ContentRow[]
}

function groupBySection(rows: ContentRow[]): Record<string, ContentRow[]> {
  return rows.reduce<Record<string, ContentRow[]>>((acc, row) => {
    if (!acc[row.section]) acc[row.section] = []
    acc[row.section].push(row)
    return acc
  }, {})
}

function FieldEditor({ row, page }: { row: ContentRow; page: string }) {
  const [value, setValue] = useState(row.value)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: row.fieldType === 'html' ? row.value : '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[120px] focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (row.fieldType === 'html') setValue(editor.getHTML())
    },
  })

  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          section: row.section,
          field_key: row.fieldKey,
          value,
          field_type: row.fieldType,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLastSaved(new Date(data.updated_at))
      toast.success('Saved!')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }, [page, row.section, row.fieldKey, row.fieldType, value])

  const label = row.fieldKey.replace(/_/g, ' ')

  return (
    <div className="border border-hairline rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-hairline">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-fg-muted capitalize">{label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-fg-muted">
            {row.fieldType}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-ink-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Save className="h-3 w-3" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-card">
        {row.fieldType === 'html' && editor ? (
          <div>
            <div className="flex gap-1 p-2 border-b border-hairline flex-wrap">
              {[
                { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
                { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
                { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
                { label: 'UL', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                { label: '❝', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
              ].map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.action}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    btn.active
                      ? 'bg-brand text-white'
                      : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-600'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <EditorContent editor={editor} />
          </div>
        ) : row.fieldType === 'json' ? (
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-transparent text-fg font-mono text-xs focus:outline-none resize-y"
          />
        ) : row.fieldType === 'bool' ? (
          <div className="px-4 py-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value === 'true'}
                onChange={e => setValue(e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-sm text-fg-muted">Enabled</span>
            </label>
          </div>
        ) : row.fieldType === 'image' ? (
          <div className="px-4 py-3">
            <MediaPickerField value={value} onChange={setValue} />
          </div>
        ) : (
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={value.length > 120 ? 4 : 2}
            className="w-full px-4 py-3 bg-transparent text-fg text-sm focus:outline-none resize-y"
          />
        )}
      </div>
    </div>
  )
}

function SectionGroup({ section, rows, page }: { section: string; rows: ContentRow[]; page: string }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-card rounded-2xl border border-hairline overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
      >
        <h2 className="font-serif text-xl text-fg capitalize">{section}</h2>
        {open ? <ChevronUp className="h-5 w-5 text-ink-400" /> : <ChevronDown className="h-5 w-5 text-ink-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-hairline pt-4">
          {rows.map(row => (
            <FieldEditor key={row.id} row={row} page={page} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ContentEditor({ page, initialRows }: ContentEditorProps) {
  const grouped = groupBySection(initialRows)

  if (initialRows.length === 0) {
    return (
      <div className="text-center py-24 text-ink-500">
        <p className="text-lg mb-2">No content rows found for <strong>{page}</strong>.</p>
        <p className="text-sm">Run the seed to populate content, or add rows via the API.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([section, rows]) => (
        <SectionGroup key={section} section={section} rows={rows} page={page} />
      ))}
    </div>
  )
}
