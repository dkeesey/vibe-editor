/**
 * PublishButton - Batches content changes and commits to git
 *
 * Tracks unpublished changes and provides a single "Publish" action
 * that commits all pending edits.
 */

import { useState, useEffect, useCallback } from 'react'

export default function PublishButton() {
  const [changeCount, setChangeCount] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Check for unpublished changes
  const checkChanges = useCallback(async () => {
    try {
      const res = await fetch('/api/publish')
      if (res.ok) {
        const data = await res.json()
        setChangeCount(data.unpublishedChanges || 0)
      }
    } catch (err) {
      console.error('Failed to check changes:', err)
    }
  }, [])

  // Check on mount and after saves
  useEffect(() => {
    checkChanges()

    // Listen for microtext saves
    const handleSave = () => {
      // Small delay to let file write complete
      setTimeout(checkChanges, 500)
    }

    window.addEventListener('microtext-saved', handleSave)
    return () => window.removeEventListener('microtext-saved', handleSave)
  }, [checkChanges])

  const publish = async () => {
    setPublishing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Content update: ${changeCount} edit(s)`
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
        setChangeCount(0)
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage(data.error || 'Publish failed')
      }
    } catch (err) {
      setMessage('Network error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      {changeCount > 0 ? (
        <>
          <button
            onClick={publish}
            disabled={publishing}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-colors"
          >
            {publishing ? (
              <>
                <span className="animate-spin">⏳</span>
                Publishing...
              </>
            ) : (
              <>
                <span>📤</span>
                Publish {changeCount} change{changeCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </>
      ) : (
        <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
          ✓ All changes published
        </div>
      )}

      {message && (
        <div className={`px-3 py-2 rounded-lg text-sm ${
          message.includes('failed') || message.includes('error')
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}
