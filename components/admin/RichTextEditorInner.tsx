'use client'

import { useState, useEffect, useRef } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Link,
  Paragraph,
  Heading,
  BlockQuote,
  CodeBlock,
  Code,
  List,
  TodoList,
  Image,
  ImageUpload,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageCaption,
  SimpleUploadAdapter,
  HorizontalLine,
  Indent,
  IndentBlock,
  MediaEmbed,
  Table,
  TableToolbar,
  Undo,
  RemoveFormat,
  SourceEditing,
  GeneralHtmlSupport,
  type EditorConfig,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

interface RichTextEditorInnerProps {
  value: string
  onChange: (data: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditorInner({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
}: RichTextEditorInnerProps) {
  const [ready, setReady] = useState(false)
  const editorRef = useRef<ClassicEditor | null>(null)

  // Sync external value changes into the editor (e.g. form reset)
  useEffect(() => {
    if (editorRef.current && editorRef.current.getData() !== value) {
      editorRef.current.setData(value || '')
    }
  }, [value])

  const editorConfig: EditorConfig = {
    plugins: [
      Essentials,
      Bold,
      Italic,
      Strikethrough,
      Underline,
      Link,
      Paragraph,
      Heading,
      BlockQuote,
      CodeBlock,
      Code,
      List,
      TodoList,
      Image,
      ImageUpload,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageCaption,
      SimpleUploadAdapter,
      HorizontalLine,
      Indent,
      IndentBlock,
      MediaEmbed,
      Table,
      TableToolbar,
      Undo,
      RemoveFormat,
      SourceEditing,
      GeneralHtmlSupport,
    ],
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'bold', 'italic', 'underline', 'strikethrough', 'code', 'removeFormat',
        '|',
        'bulletedList', 'numberedList', 'todoList',
        '|',
        'blockQuote', 'codeBlock', 'horizontalLine',
        '|',
        'link', 'insertImage', 'mediaEmbed', 'insertTable',
        '|',
        'outdent', 'indent',
        '|',
        'sourceEditing',
      ],
      shouldNotGroupWhenFull: false,
    },
    heading: {
      options: [
        { model: 'paragraph' as const, title: 'Paragraph', class: '' },
        { model: 'heading1' as const, view: 'h1', title: 'Heading 1', class: '' },
        { model: 'heading2' as const, view: 'h2', title: 'Heading 2', class: '' },
        { model: 'heading3' as const, view: 'h3', title: 'Heading 3', class: '' },
      ],
    },
    image: {
      toolbar: [
        'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
        '|',
        'toggleImageCaption', 'imageTextAlternative',
        '|',
        'resizeImage',
      ],
      upload: {
        types: ['jpeg', 'png', 'gif', 'webp', 'svg+xml'],
      },
    },
    simpleUpload: {
      uploadUrl: '/api/admin/media/upload-ckeditor',
      withCredentials: true,
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
    },
    placeholder,
    htmlSupport: {
      allow: [
        { name: /.*/, attributes: true, classes: true, styles: true },
      ],
    },
  }

  return (
    <div className="ck-editor-wrapper" style={{ ['--ck-editor-min-height' as string]: `${minHeight}px` }}>
      <style>{`
        .ck-editor-wrapper .ck-editor__editable_inline {
          min-height: var(--ck-editor-min-height, 300px) !important;
        }
        .ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          background: var(--color-card, #fff) !important;
          color: var(--color-fg, #1a1a1a) !important;
          border-color: var(--color-hairline, #e5e7eb) !important;
        }
        .ck-editor-wrapper .ck.ck-toolbar {
          background: var(--color-muted, #f9fafb) !important;
          border-color: var(--color-hairline, #e5e7eb) !important;
        }
        .ck-editor-wrapper .ck.ck-editor {
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid var(--color-hairline, #e5e7eb);
        }
      `}</style>

      {!ready && (
        <div
          className="border border-hairline rounded-xl bg-muted animate-pulse flex items-center justify-center text-fg-muted"
          style={{ minHeight: `${minHeight}px` }}
        >
          Loading editor...
        </div>
      )}

      <div style={{ display: ready ? 'block' : 'none' }}>
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={value}
          onReady={(editor) => {
            editorRef.current = editor
            setReady(true)
          }}
          onChange={(_event, editor) => {
            const data = editor.getData()
            onChange(data)
          }}
        />
      </div>
    </div>
  )
}
