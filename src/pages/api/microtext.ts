/**
 * API Route: /api/microtext
 *
 * POST - Update a microtext value in an MDX file's frontmatter
 *
 * Request body:
 *   { pageSlug: string, id: string, value: string }
 *
 * The pageSlug maps to src/pages/{pageSlug}.mdx
 */

import type { APIRoute } from 'astro'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const PAGES_DIR = path.join(process.cwd(), 'src/pages')

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { pageSlug, id, value } = body

    // Validate required fields
    if (!id || value === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, value' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Handle empty slug as index
    const slug = !pageSlug || pageSlug === '' ? 'index' : pageSlug

    // Prevent path traversal attacks
    const safePath = path.normalize(slug).replace(/^(\.\.(\/|\\|$))+/, '')

    // Check for .mdx file
    let filePath = path.join(PAGES_DIR, `${safePath}.mdx`)
    let realPath: string

    try {
      realPath = await fs.realpath(filePath)
    } catch {
      // Try without extension (in case it's a directory with index.mdx)
      try {
        filePath = path.join(PAGES_DIR, safePath, 'index.mdx')
        realPath = await fs.realpath(filePath)
      } catch {
        return new Response(
          JSON.stringify({ error: `Page not found: ${slug}` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Verify file is within pages directory
    if (!realPath.startsWith(PAGES_DIR)) {
      return new Response(
        JSON.stringify({ error: 'Invalid path' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Read the MDX file
    const fileContent = await fs.readFile(filePath, 'utf-8')

    // Parse frontmatter
    const { data: frontmatter, content: mdxBody } = matter(fileContent)

    // Ensure microtext object exists
    if (!frontmatter.microtext) {
      frontmatter.microtext = {}
    }

    // Update the specific key
    const oldValue = frontmatter.microtext[id]
    frontmatter.microtext[id] = value

    // Reconstruct the file
    const updatedFile = matter.stringify(mdxBody, frontmatter)

    // Write back
    await fs.writeFile(filePath, updatedFile, 'utf-8')

    console.log(`[microtext] Updated ${slug}#${id}: "${oldValue}" → "${value}"`)

    return new Response(
      JSON.stringify({
        success: true,
        updated: { id, value, previousValue: oldValue },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[microtext] Update error:', error)

    return new Response(
      JSON.stringify({ error: 'Failed to update microtext' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET - Fetch microtext for a page
export const GET: APIRoute = async ({ url }) => {
  try {
    const pageSlug = url.searchParams.get('pageSlug') || 'index'

    const safePath = path.normalize(pageSlug).replace(/^(\.\.(\/|\\|$))+/, '')
    const filePath = path.join(PAGES_DIR, `${safePath}.mdx`)

    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data: frontmatter } = matter(fileContent)

    return new Response(
      JSON.stringify({ microtext: frontmatter.microtext || {} }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      return new Response(
        JSON.stringify({ error: 'Page not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Failed to read microtext' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
