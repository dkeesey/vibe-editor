/**
 * API Route: /api/publish
 *
 * POST - Commit all pending content changes to git
 *
 * This batches all microtext edits into a single commit.
 */

import type { APIRoute } from 'astro'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}))
    const message = body.message || `Content update ${new Date().toISOString()}`

    const cwd = process.cwd()

    // Check if there are any changes to commit
    const { stdout: status } = await execAsync('git status --porcelain src/pages/', { cwd })

    if (!status.trim()) {
      return new Response(
        JSON.stringify({ success: true, message: 'No changes to publish' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stage all content changes
    await execAsync('git add src/pages/', { cwd })

    // Commit with message
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd })

    // Count files changed
    const files = status.trim().split('\n').length

    console.log(`[publish] Committed ${files} file(s): ${message}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Published ${files} change(s)`,
        filesChanged: files
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[publish] Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({ error: `Publish failed: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET - Check if there are unpublished changes
export const GET: APIRoute = async () => {
  try {
    const cwd = process.cwd()
    const { stdout: status } = await execAsync('git status --porcelain src/pages/', { cwd })

    const changes = status.trim() ? status.trim().split('\n').length : 0

    return new Response(
      JSON.stringify({ unpublishedChanges: changes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to check status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
