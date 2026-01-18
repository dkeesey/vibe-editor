/**
 * SyncButton - Syncs localStorage drafts to server
 *
 * Shows pending draft count and syncs on click.
 * Listens for draft changes to update count.
 */

import { useState, useEffect, useCallback } from 'react'
import { getPageDrafts, syncDraftsToServer } from '../lib/microtext-store'

interface Props {
  pageSlug: string
}

export default function SyncButton({ pageSlug }: Props) {
  const [draftCount, setDraftCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const updateCount = useCallback(() => {
    const drafts = getPageDrafts(pageSlug)
    setDraftCount(Object.keys(drafts).length)
  }, [pageSlug])

  useEffect(() => {
    updateCount()

    // Listen for draft changes
    const handleDraftSaved = () => updateCount()
    window.addEventListener('microtext-draft-saved', handleDraftSaved)

    return () => {
      window.removeEventListener('microtext-draft-saved', handleDraftSaved)
    }
  }, [updateCount])

  const handleSync = async () => {
    if (draftCount === 0) return

    setSyncing(true)
    setResult(null)

    try {
      const res = await syncDraftsToServer(pageSlug)

      if (res.success) {
        setResult({
          success: true,
          message: `Synced ${res.synced} edit${res.synced !== 1 ? 's' : ''} to server`
        })
        updateCount()
        // Clear result after 3 seconds
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({
          success: false,
          message: res.errors.join(', ')
        })
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Network error - could not sync'
      })
    } finally {
      setSyncing(false)
    }
  }

  if (draftCount === 0 && !result) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 flex flex-col gap-2">
      {result && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          result.success
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {result.message}
        </div>
      )}

      {draftCount > 0 && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {syncing ? (
            <>
              <span className="animate-spin">↻</span>
              Syncing...
            </>
          ) : (
            <>
              <span>↑</span>
              Save {draftCount} draft{draftCount !== 1 ? 's' : ''} to server
            </>
          )}
        </button>
      )}
    </div>
  )
}
