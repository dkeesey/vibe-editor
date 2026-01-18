/**
 * ArrayControls - UI for adding/removing items from microtext arrays
 *
 * Provides:
 * - Add button for arrays (shows at end of array section)
 * - Remove button for individual items
 *
 * Usage in MDX:
 *   <ArrayControls client:load arrayPath="features" pageSlug="index">
 *     ... array items rendered here ...
 *   </ArrayControls>
 */

import { useState } from 'react'

interface AddButtonProps {
  pageSlug: string
  arrayPath: string
  template?: Record<string, string>
  label?: string
}

export function AddItemButton({ pageSlug, arrayPath, template, label = 'Add Item' }: AddButtonProps) {
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    try {
      const res = await fetch('/api/microtext-array', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug,
          arrayPath,
          action: 'add',
          template: template || { title: 'New Item', desc: 'Add a description' }
        })
      })

      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add item')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg transition-colors disabled:opacity-50"
    >
      <span className="text-lg">+</span>
      {adding ? 'Adding...' : label}
    </button>
  )
}

interface RemoveButtonProps {
  pageSlug: string
  arrayPath: string
  index: number
}

export function RemoveItemButton({ pageSlug, arrayPath, index }: RemoveButtonProps) {
  const [removing, setRemoving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleRemove = async () => {
    if (!confirming) {
      setConfirming(true)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setRemoving(true)
    try {
      const res = await fetch('/api/microtext-array', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug,
          arrayPath,
          action: 'remove',
          index
        })
      })

      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to remove item')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setRemoving(false)
      setConfirming(false)
    }
  }

  if (removing) {
    return (
      <span className="text-xs text-gray-400">Removing...</span>
    )
  }

  return (
    <button
      onClick={handleRemove}
      className={`p-1 rounded transition-colors ${
        confirming
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      }`}
      title={confirming ? 'Click again to confirm' : 'Remove item'}
    >
      {confirming ? '✓ Confirm' : '×'}
    </button>
  )
}

interface ArrayItemWrapperProps {
  pageSlug: string
  arrayPath: string
  index: number
  children: React.ReactNode
  className?: string
}

export function ArrayItemWrapper({ pageSlug, arrayPath, index, children, className = '' }: ArrayItemWrapperProps) {
  return (
    <div className={`group relative ${className}`}>
      {/* Remove button - shows on hover */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <RemoveItemButton pageSlug={pageSlug} arrayPath={arrayPath} index={index} />
      </div>
      {children}
    </div>
  )
}
