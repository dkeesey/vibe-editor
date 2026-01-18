/**
 * MicrotextEditor - React island for inline text editing
 *
 * When enabled, makes all [data-microtext] elements clickable.
 * Click opens a Tiptap editor positioned near the element.
 * Save writes back to the MDX frontmatter via API.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  pageSlug: string
  initialContent: Record<string, string>
}

export default function MicrotextEditor({ pageSlug, initialContent }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeElementRef = useRef<HTMLElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep it simple - just text, bold, italic
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder: 'Enter text...',
      }),
    ],
    content: '',
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[1.5em] px-3 py-2',
      },
    },
  })

  const close = useCallback(() => {
    setActiveId(null)
    setError(null)
    activeElementRef.current = null
  }, [])

  const save = useCallback(async () => {
    if (!activeId || !editor) return

    const newText = editor.getText().trim()
    if (!newText) {
      setError('Text cannot be empty')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/microtext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug,
          id: activeId,
          value: newText,
        }),
      })

      if (res.ok) {
        // Reload to show re-rendered markdown
        // (Could optimize later with client-side markdown rendering)
        window.location.reload()
      } else {
        const data = await res.json()
        setError(data.error || 'Save failed')
      }
    } catch (err) {
      setError('Network error')
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }, [activeId, editor, pageSlug, close])

  const openEditor = useCallback((el: HTMLElement) => {
    const id = el.dataset.microtext!
    // Use raw markdown from data attribute, fallback to innerText
    const text = el.dataset.microtextRaw || el.innerText
    const rect = el.getBoundingClientRect()

    activeElementRef.current = el
    setActiveId(id)
    setError(null)
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    })

    // Set content and focus
    editor?.commands.setContent(`<p>${text}</p>`)
    setTimeout(() => {
      editor?.commands.focus('end')
    }, 10)
  }, [editor])

  // Set up click handlers on microtext elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // If we're already editing, ignore
      if (activeId) return

      const el = (e.target as HTMLElement).closest('[data-microtext]') as HTMLElement
      if (el) {
        e.preventDefault()
        e.stopPropagation()
        openEditor(el)
      }
    }

    // Style editable elements
    const elements = document.querySelectorAll('[data-microtext]')
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.cursor = 'pointer'

      const handleEnter = () => {
        if (!activeId) {
          htmlEl.style.outline = '2px dashed #3b82f6'
          htmlEl.style.outlineOffset = '2px'
          htmlEl.style.borderRadius = '4px'
        }
      }
      const handleLeave = () => {
        htmlEl.style.outline = 'none'
      }

      htmlEl.addEventListener('mouseenter', handleEnter)
      htmlEl.addEventListener('mouseleave', handleLeave)

      // Store for cleanup
      ;(htmlEl as any)._vibeHandlers = { handleEnter, handleLeave }
    })

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const handlers = (htmlEl as any)._vibeHandlers
        if (handlers) {
          htmlEl.removeEventListener('mouseenter', handlers.handleEnter)
          htmlEl.removeEventListener('mouseleave', handlers.handleLeave)
          htmlEl.style.cursor = ''
          htmlEl.style.outline = ''
        }
      })
    }
  }, [activeId, openEditor])

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      save()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  if (!activeId) {
    // Show edit mode indicator
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
        ✏️ Edit Mode — Click any text to edit
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
        onClick={close}
      />

      {/* Editor popover */}
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          minWidth: position.width,
          maxWidth: 400,
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Editing: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{activeId}</code>
          </span>
          <span className="text-xs text-gray-400">⌘↵ to save</span>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />

        {/* Error */}
        {error && (
          <div className="px-3 py-2 bg-red-50 text-red-600 text-sm border-t border-red-100">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 p-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={close}
            disabled={saving}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
