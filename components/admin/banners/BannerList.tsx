'use client'

import {
  Pencil, Trash2, Copy, ChevronDown, ChevronUp,
  Eye, EyeOff, Megaphone,
} from 'lucide-react'
import { Banner, KIND_COLORS } from './banner-types'

interface BannerListProps {
  items: Banner[]
  expanded: string | null
  onToggleExpand: (id: string | null) => void
  onEdit: (b: Banner) => void
  onToggleEnabled: (b: Banner) => void
  onDuplicate: (b: Banner) => void
  onRemove: (b: Banner) => void
}

export function BannerList({ items, expanded, onToggleExpand, onEdit, onToggleEnabled, onDuplicate, onRemove }: BannerListProps) {
  return (
    <>
      {items.length === 0 ? (
        <div className="text-center py-16 text-fg-muted">
          <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No banners yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(b => {
            const isExpanded = expanded === b.id
            return (
              <div key={b.id} className="rounded-xl border border-hairline bg-card overflow-hidden">
                {/* Summary row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => onToggleEnabled(b)}
                    title={b.enabled ? 'Disable' : 'Enable'}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                      b.enabled ? 'text-green-500 hover:bg-green-500/10' : 'text-fg-muted hover:bg-muted'
                    }`}
                  >
                    {b.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => onToggleExpand(isExpanded ? null : b.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${KIND_COLORS[b.kind] || 'bg-muted text-fg-muted'}`}>
                      {b.kind}
                    </span>
                    <span className="text-sm font-medium text-fg truncate">{b.name}</span>
                    {b.title && <span className="hidden sm:inline text-xs text-fg-muted truncate">&mdash; {b.title}</span>}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-fg-muted ml-auto flex-shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-fg-muted ml-auto flex-shrink-0" />}
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-fg-muted hover:text-brand hover:bg-brand/10 transition-colors" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDuplicate(b)} className="p-1.5 rounded-lg text-fg-muted hover:text-blue-500 hover:bg-blue-500/10 transition-colors" title="Duplicate">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onRemove(b)} className="p-1.5 rounded-lg text-fg-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-hairline px-4 py-3 bg-muted/30">
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                      <div><dt className="text-fg-muted">Placement</dt><dd className="text-fg font-medium">{b.placement}</dd></div>
                      <div><dt className="text-fg-muted">Theme</dt><dd className="text-fg font-medium">{b.theme}</dd></div>
                      <div><dt className="text-fg-muted">Priority</dt><dd className="text-fg font-medium">{b.priority}</dd></div>
                      <div><dt className="text-fg-muted">Dismissable</dt><dd className="text-fg font-medium">{b.dismissable ? 'Yes' : 'No'}</dd></div>
                      {b.body && <div className="col-span-2 md:col-span-4"><dt className="text-fg-muted">Body</dt><dd className="text-fg mt-0.5">{b.body}</dd></div>}
                      {b.ctaLabel && <div><dt className="text-fg-muted">CTA</dt><dd className="text-fg font-medium">{b.ctaLabel}</dd></div>}
                      {b.startsAt && <div><dt className="text-fg-muted">Starts</dt><dd className="text-fg font-medium">{new Date(b.startsAt).toLocaleDateString()}</dd></div>}
                      {b.endsAt && <div><dt className="text-fg-muted">Ends</dt><dd className="text-fg font-medium">{new Date(b.endsAt).toLocaleDateString()}</dd></div>}
                      {b.devices.length > 0 && <div><dt className="text-fg-muted">Devices</dt><dd className="text-fg font-medium">{b.devices.join(', ')}</dd></div>}
                    </dl>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
