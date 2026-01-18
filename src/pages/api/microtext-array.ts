/**
 * API Route: /api/microtext-array
 *
 * Manage array-based microtext (add/remove items)
 *
 * POST - Add or remove items from a microtext array
 *
 * Request body:
 *   { pageSlug: string, arrayPath: string, action: 'add' | 'remove', index?: number, template?: object }
 *
 * Examples:
 *   Add: { pageSlug: "index", arrayPath: "features", action: "add", template: { title: "New Feature", desc: "Description" } }
 *   Remove: { pageSlug: "index", arrayPath: "features", action: "remove", index: 2 }
 */

import type { APIRoute } from 'astro'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const PAGES_DIR = path.join(process.cwd(), 'src/pages')

// Helper to get a nested value by dot-notation path
function getNestedValue(obj: any, pathStr: string): any {
  if (!pathStr) return obj
  return pathStr.split('.').reduce((current, key) => {
    if (current === undefined || current === null) return undefined
    const index = parseInt(key, 10)
    if (!isNaN(index) && Array.isArray(current)) {
      return current[index]
    }
    return current[key]
  }, obj)
}

// Helper to set a nested value by dot-notation path
function setNestedValue(obj: any, pathStr: string, value: any): void {
  const parts = pathStr.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const nextKey = parts[i + 1]
    const nextIsIndex = !isNaN(parseInt(nextKey, 10))

    if (current[key] === undefined) {
      current[key] = nextIsIndex ? [] : {}
    }
    current = current[key]
  }

  const lastKey = parts[parts.length - 1]
  current[lastKey] = value
}

async function getFilePath(pageSlug: string): Promise<string | null> {
  const slug = !pageSlug || pageSlug === '' ? 'index' : pageSlug
  const safePath = path.normalize(slug).replace(/^(\.\.(\/|\\|$))+/, '')

  let filePath = path.join(PAGES_DIR, `${safePath}.mdx`)

  try {
    const realPath = await fs.realpath(filePath)
    if (realPath.startsWith(PAGES_DIR)) return filePath
  } catch {
    try {
      filePath = path.join(PAGES_DIR, safePath, 'index.mdx')
      const realPath = await fs.realpath(filePath)
      if (realPath.startsWith(PAGES_DIR)) return filePath
    } catch {
      return null
    }
  }
  return null
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { pageSlug, arrayPath, action, index, template } = body

    // Validate
    if (!arrayPath || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: arrayPath, action' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!['add', 'remove'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'action must be "add" or "remove"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'remove' && index === undefined) {
      return new Response(
        JSON.stringify({ error: 'index is required for remove action' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const filePath = await getFilePath(pageSlug)
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: `Page not found: ${pageSlug}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Read and parse
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data: frontmatter, content: mdxBody } = matter(fileContent)

    if (!frontmatter.microtext) {
      frontmatter.microtext = {}
    }

    // Get or create the array
    let arr = getNestedValue(frontmatter.microtext, arrayPath)
    if (!Array.isArray(arr)) {
      arr = []
    }

    let result: { action: string; arrayPath: string; index?: number; item?: any }

    if (action === 'add') {
      // Add new item with template or default
      const newItem = template || { title: 'New Item', desc: 'Description' }
      arr.push(newItem)
      result = { action: 'add', arrayPath, index: arr.length - 1, item: newItem }
    } else {
      // Remove item at index
      if (index < 0 || index >= arr.length) {
        return new Response(
          JSON.stringify({ error: `Index ${index} out of bounds (array length: ${arr.length})` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      const removed = arr.splice(index, 1)[0]
      result = { action: 'remove', arrayPath, index, item: removed }
    }

    // Write back
    setNestedValue(frontmatter.microtext, arrayPath, arr)
    const updatedFile = matter.stringify(mdxBody, frontmatter)
    await fs.writeFile(filePath, updatedFile, 'utf-8')

    console.log(`[microtext-array] ${action} at ${arrayPath}[${result.index}]`)

    return new Response(
      JSON.stringify({ success: true, ...result, newLength: arr.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[microtext-array] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to modify array' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET - Get array info
export const GET: APIRoute = async ({ url }) => {
  try {
    const pageSlug = url.searchParams.get('pageSlug') || 'index'
    const arrayPath = url.searchParams.get('arrayPath')

    if (!arrayPath) {
      return new Response(
        JSON.stringify({ error: 'arrayPath is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const filePath = await getFilePath(pageSlug)
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'Page not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data: frontmatter } = matter(fileContent)

    const arr = getNestedValue(frontmatter.microtext || {}, arrayPath) || []

    return new Response(
      JSON.stringify({ arrayPath, items: arr, length: arr.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to read array' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
