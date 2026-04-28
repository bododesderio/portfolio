'use client'

import dynamic from 'next/dynamic'

interface RichTextEditorProps {
  value: string
  onChange: (data: string) => void
  placeholder?: string
  minHeight?: number
}

const RichTextEditorInner = dynamic(
  () => import('./RichTextEditorInner'),
  {
    ssr: false,
    loading: () => (
      <div
        className="border border-hairline rounded-lg bg-muted animate-pulse flex items-center justify-center text-fg-muted"
        style={{ minHeight: '300px' }}
      >
        Loading editor...
      </div>
    ),
  }
)

export function RichTextEditor(props: RichTextEditorProps) {
  return <RichTextEditorInner {...props} />
}
