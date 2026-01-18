/**
 * FeatureCard - Wrapper for feature items with remove button
 */

import { useState } from 'react'

export default function FeatureCard({ pageSlug, arrayPath, index, icon, colorClass, children }) {
  const [removing, setRemoving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleRemove = async () => {
    if (!confirming) {
      setConfirming(true)
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
      }
    } catch (err) {
      console.error('Remove failed:', err)
    } finally {
      setRemoving(false)
      setConfirming(false)
    }
  }

  return (
    <div className="group relative p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <button
        onClick={handleRemove}
        disabled={removing}
        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all z-10 ${
          confirming
            ? 'bg-red-500 text-white'
            : 'bg-white border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-300'
        }`}
        title={confirming ? 'Click again to confirm' : 'Remove feature'}
      >
        {removing ? '...' : confirming ? '✓' : '×'}
      </button>

      <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>

      {children}
    </div>
  )
}
