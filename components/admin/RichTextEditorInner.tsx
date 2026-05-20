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
  Subscript,
  Superscript,
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
  Font,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
  Alignment,
  Highlight,
  FindAndReplace,
  Autoformat,
  PasteFromOffice,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersText,
  SpecialCharactersMathematical,
  SpecialCharactersLatin,
  WordCount,
  Fullscreen,
  PageBreak,
  HtmlEmbed,
  ShowBlocks,
  TextTransformation,
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
  const wordCountRef = useRef<HTMLDivElement | null>(null)

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
      Subscript,
      Superscript,
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
      Font,
      FontFamily,
      FontSize,
      FontColor,
      FontBackgroundColor,
      Alignment,
      Highlight,
      FindAndReplace,
      Autoformat,
      PasteFromOffice,
      SelectAll,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersText,
      SpecialCharactersMathematical,
      SpecialCharactersLatin,
      WordCount,
      Fullscreen,
      PageBreak,
      HtmlEmbed,
      ShowBlocks,
      TextTransformation,
    ],
    toolbar: {
      items: [
        'undo', 'redo',
        '|',
        'heading',
        '|',
        'fontFamily', 'fontSize',
        '|',
        'bold', 'italic', 'underline', 'strikethrough',
        'subscript', 'superscript',
        'code', 'removeFormat',
        '|',
        'fontColor', 'fontBackgroundColor', 'highlight',
        '|',
        'alignment',
        '|',
        'bulletedList', 'numberedList', 'todoList',
        '|',
        'blockQuote', 'codeBlock', 'horizontalLine', 'pageBreak',
        '|',
        'link', 'insertImage', 'mediaEmbed', 'insertTable', 'htmlEmbed', 'specialCharacters',
        '|',
        'outdent', 'indent',
        '|',
        'findAndReplace', 'showBlocks', 'sourceEditing', 'fullscreen',
      ],
      shouldNotGroupWhenFull: false,
    },
    heading: {
      options: [
        { model: 'paragraph' as const, title: 'Paragraph', class: '' },
        { model: 'heading1' as const, view: 'h1', title: 'Heading 1', class: '' },
        { model: 'heading2' as const, view: 'h2', title: 'Heading 2', class: '' },
        { model: 'heading3' as const, view: 'h3', title: 'Heading 3', class: '' },
        { model: 'heading4' as const, view: 'h4', title: 'Heading 4', class: '' },
      ],
    },
    fontFamily: {
      options: [
        'default',
        'Inter, sans-serif',
        'Playfair Display, serif',
        'Arial, Helvetica, sans-serif',
        'Georgia, serif',
        'Courier New, Courier, monospace',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
      ],
    },
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 24, 28, 32, 36],
    },
    fontColor: {
      columns: 6,
      documentColors: 12,
    },
    fontBackgroundColor: {
      columns: 6,
      documentColors: 12,
    },
    alignment: {
      options: ['left', 'center', 'right', 'justify'],
    },
    highlight: {
      options: [
        { model: 'yellowMarker', class: '', title: 'Yellow marker', color: 'var(--ck-highlight-marker-yellow)', type: 'marker' as const },
        { model: 'greenMarker', class: '', title: 'Green marker', color: 'var(--ck-highlight-marker-green)', type: 'marker' as const },
        { model: 'pinkMarker', class: '', title: 'Pink marker', color: 'var(--ck-highlight-marker-pink)', type: 'marker' as const },
        { model: 'blueMarker', class: '', title: 'Blue marker', color: 'var(--ck-highlight-marker-blue)', type: 'marker' as const },
        { model: 'redPen', class: '', title: 'Red pen', color: 'var(--ck-highlight-pen-red)', type: 'pen' as const },
        { model: 'greenPen', class: '', title: 'Green pen', color: 'var(--ck-highlight-pen-green)', type: 'pen' as const },
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
    wordCount: {
      container: wordCountRef.current ?? undefined,
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
        .ck-editor-wrapper .ck-word-count {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: var(--color-fg-muted, #6b7280);
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
            if (wordCountRef.current) {
              const wordCountPlugin = editor.plugins.get('WordCount')
              wordCountRef.current.appendChild(wordCountPlugin.wordCountContainer)
            }
          }}
          onChange={(_event, editor) => {
            const data = editor.getData()
            onChange(data)
          }}
        />
        <div ref={wordCountRef} />
      </div>
    </div>
  )
}
