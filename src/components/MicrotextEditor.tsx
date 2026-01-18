/**
 * MicrotextEditor - React island for inline text editing
 *
 * Saves to localStorage first (instant), then can sync to server.
 * Updates DOM immediately without page reload.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { marked } from 'marked'
import { saveDraft, getDraft, getPageDrafts } from '../lib/microtext-store'

interface Props {
  pageSlug: string
  initialContent: Record<string, string>
}

export default function MicrotextEditor({ pageSlug, initialContent }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 })
  const [draftCount, setDraftCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const activeElementRef = useRef<HTMLElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[1.5em] px-3 py-2',
      },
    },
  })

  // Update draft count
  const updateDraftCount = useCallback(() => {
    const drafts = getPageDrafts(pageSlug)
    setDraftCount(Object.keys(drafts).length)
  }, [pageSlug])

  // Hydrate DOM with localStorage drafts on mount
  useEffect(() => {
    const drafts = getPageDrafts(pageSlug)

    Object.entries(drafts).forEach(([id, draft]) => {
      const el = document.querySelector(`[data-microtext="${id}"]`) as HTMLElement
      if (el) {
        // Parse markdown and update DOM
        const html = marked.parseInline(draft.value) as string
        el.innerHTML = html
        el.dataset.microtextRaw = draft.value
        // Add indicator that this is a draft
        el.classList.add('has-draft')
      }
    })

    updateDraftCount()
  }, [pageSlug, updateDraftCount])

  const close = useCallback(() => {
    setActiveId(null)
    setError(null)
    activeElementRef.current = null
  }, [])

  const save = useCallback(() => {
    if (!activeId || !editor) return

    const newText = editor.getText().trim()
    if (!newText) {
      setError('Text cannot be empty')
      return
    }

    // Save to localStorage (instant)
    saveDraft(pageSlug, activeId, newText)

    // Update DOM immediately
    if (activeElementRef.current) {
      const html = marked.parseInline(newText) as string
      activeElementRef.current.innerHTML = html
      activeElementRef.current.dataset.microtextRaw = newText
      activeElementRef.current.classList.add('has-draft')
    }

    updateDraftCount()
    close()
  }, [activeId, editor, pageSlug, close, updateDraftCount])

  const openEditor = useCallback((el: HTMLElement) => {
    const id = el.dataset.microtext!
    // Check localStorage first, then fall back to current value
    const draft = getDraft(pageSlug, id)
    const text = draft?.value || el.dataset.microtextRaw || el.innerText
    const rect = el.getBoundingClientRect()

    activeElementRef.current = el
    setActiveId(id)
    setError(null)
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    })

    editor?.commands.setContent(`<p>${text}</p>`)
    setTimeout(() => {
      editor?.commands.focus('end')
    }, 10)
  }, [editor, pageSlug])

  // Set up click handlers
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (activeId) return

      const el = (e.target as HTMLElement).closest('[data-microtext]') as HTMLElement
      if (el) {
        e.preventDefault()
        e.stopPropagation()
        openEditor(el)
      }
    }

    const elements = document.querySelectorAll('[data-microtext]')
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.cursor = 'pointer'

      const handleEnter = () => {
        if (!activeId) {
          const hasDraft = htmlEl.classList.contains('has-draft')
          htmlEl.style.outline = hasDraft ? '2px dashed #f59e0b' : '2px dashed #3b82f6'
          htmlEl.style.outlineOffset = '2px'
          htmlEl.style.borderRadius = '4px'
        }
      }
      const handleLeave = () => {
        htmlEl.style.outline = 'none'
      }

      htmlEl.addEventListener('mouseenter', handleEnter)
      htmlEl.addEventListener('mouseleave', handleLeave)
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
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
        <span>✏️ Edit Mode</span>
        {draftCount > 0 && (
          <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
            {draftCount} draft{draftCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
        onClick={close}
      />

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
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Editing: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">{activeId}</code>
          </span>
          <span className="text-xs text-gray-400">⌘↵ to save</span>
        </div>

        <EditorContent editor={editor} className="prose prose-sm max-w-none" />

        {error && (
          <div className="px-3 py-2 bg-red-50 text-red-600 text-sm border-t border-red-100">
            {error}
          </div>
        )}

        <div className="flex gap-2 p-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={save}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
          >
            Save Draft
          </button>
          <button
            onClick={close}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
