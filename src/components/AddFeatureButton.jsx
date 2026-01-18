/**
 * AddFeatureButton - Adds a new feature to the array
 */

import { useState } from 'react'

export default function AddFeatureButton({ pageSlug, arrayPath }) {
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
          template: { title: 'New Feature', desc: 'Describe this feature' }
        })
      })

      if (res.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Add failed:', err)
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
      {adding ? 'Adding...' : 'Add Feature'}
    </button>
  )
}
