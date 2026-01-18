/**
 * Microtext LocalStorage Store
 *
 * Manages client-side draft edits before they're synced to server.
 *
 * Storage format:
 *   Key: `vibe:${pageSlug}:${microtextId}`
 *   Value: { value: string, timestamp: number }
 */

const PREFIX = 'vibe:'

export interface DraftEdit {
  value: string
  timestamp: number
}

export interface PendingEdits {
  [key: string]: DraftEdit
}

/**
 * Get the storage key for a microtext item
 */
function getKey(pageSlug: string, id: string): string {
  return `${PREFIX}${pageSlug}:${id}`
}

/**
 * Save a draft edit to localStorage
 */
export function saveDraft(pageSlug: string, id: string, value: string): void {
  const key = getKey(pageSlug, id)
  const draft: DraftEdit = {
    value,
    timestamp: Date.now()
  }
  localStorage.setItem(key, JSON.stringify(draft))

  // Dispatch event for other components to react
  window.dispatchEvent(new CustomEvent('microtext-draft-saved', {
    detail: { pageSlug, id, value }
  }))
}

/**
 * Get a draft edit from localStorage
 */
export function getDraft(pageSlug: string, id: string): DraftEdit | null {
  const key = getKey(pageSlug, id)
  const stored = localStorage.getItem(key)
  if (!stored) return null

  try {
    return JSON.parse(stored) as DraftEdit
  } catch {
    return null
  }
}

/**
 * Get all pending drafts for a page
 */
export function getPageDrafts(pageSlug: string): PendingEdits {
  const drafts: PendingEdits = {}
  const prefix = `${PREFIX}${pageSlug}:`

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) {
      const id = key.slice(prefix.length)
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          drafts[id] = JSON.parse(stored)
        } catch {
          // Skip invalid entries
        }
      }
    }
  }

  return drafts
}

/**
 * Clear a specific draft
 */
export function clearDraft(pageSlug: string, id: string): void {
  const key = getKey(pageSlug, id)
  localStorage.removeItem(key)
}

/**
 * Clear all drafts for a page
 */
export function clearPageDrafts(pageSlug: string): void {
  const prefix = `${PREFIX}${pageSlug}:`
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key))
}

/**
 * Get count of pending drafts for a page
 */
export function getDraftCount(pageSlug: string): number {
  return Object.keys(getPageDrafts(pageSlug)).length
}

/**
 * Sync all drafts to server
 */
export async function syncDraftsToServer(pageSlug: string): Promise<{ success: boolean; synced: number; errors: string[] }> {
  const drafts = getPageDrafts(pageSlug)
  const ids = Object.keys(drafts)

  if (ids.length === 0) {
    return { success: true, synced: 0, errors: [] }
  }

  const errors: string[] = []
  let synced = 0

  for (const id of ids) {
    try {
      const res = await fetch('/api/microtext', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug,
          id,
          value: drafts[id].value
        })
      })

      if (res.ok) {
        clearDraft(pageSlug, id)
        synced++
      } else {
        const data = await res.json()
        errors.push(`${id}: ${data.error || 'Failed'}`)
      }
    } catch (err) {
      errors.push(`${id}: Network error`)
    }
  }

  return {
    success: errors.length === 0,
    synced,
    errors
  }
}
