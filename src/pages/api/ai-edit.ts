/**
 * AI Edit Endpoint - Natural language content editing
 *
 * Accepts plain English instructions, figures out which microtext to change.
 *
 * POST /api/ai-edit
 * {
 *   "instruction": "Make the headline more urgent",
 *   "pageSlug": "index",
 *   "apply": false  // true to apply, false for preview
 * }
 */

import type { APIRoute } from 'astro'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

interface AiEditRequest {
  instruction: string
  pageSlug: string
  apply?: boolean
}

interface MicrotextChange {
  id: string
  oldValue: string
  newValue: string
  reasoning: string
}

interface AiEditResponse {
  success: boolean
  changes?: MicrotextChange[]
  error?: string
  applied?: boolean
}

// Flatten nested microtext into id -> value map
function flattenMicrotext(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      result[fullKey] = value
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          result[`${fullKey}.${index}`] = item
        } else if (typeof item === 'object') {
          Object.assign(result, flattenMicrotext(item, `${fullKey}.${index}`))
        }
      })
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenMicrotext(value, fullKey))
    }
  }

  return result
}

// Call Claude to interpret the instruction
async function interpretInstruction(
  instruction: string,
  microtext: Record<string, string>
): Promise<MicrotextChange[]> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const microtextList = Object.entries(microtext)
    .map(([id, value]) => `- ${id}: "${value}"`)
    .join('\n')

  const prompt = `You are a content editor. Given the current microtext values and an instruction, determine what changes to make.

Current microtext:
${microtextList}

Instruction: "${instruction}"

Respond with a JSON array of changes. Each change should have:
- id: the microtext key to change
- oldValue: current value (must match exactly)
- newValue: the new value
- reasoning: brief explanation

Only include changes that are needed. If the instruction is unclear or no changes are needed, return an empty array.

Respond ONLY with valid JSON array, no other text. Example:
[{"id": "hero-headline", "oldValue": "Old text", "newValue": "New text", "reasoning": "Made it shorter"}]`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text || '[]'

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []
    return JSON.parse(jsonMatch[0])
  } catch {
    console.error('Failed to parse AI response:', content)
    return []
  }
}

// Apply changes to the MDX file
async function applyChanges(
  pageSlug: string,
  changes: MicrotextChange[]
): Promise<void> {
  const pagesDir = path.join(process.cwd(), 'src', 'pages')
  const filePath = path.join(pagesDir, `${pageSlug}.mdx`)

  const content = await fs.readFile(filePath, 'utf-8')
  const { data, content: mdxBody } = matter(content)

  if (!data.microtext) {
    throw new Error('No microtext found in frontmatter')
  }

  // Apply each change
  for (const change of changes) {
    setNestedValue(data.microtext, change.id, change.newValue)
  }

  // Write back
  const newContent = matter.stringify(mdxBody, data)
  await fs.writeFile(filePath, newContent, 'utf-8')
}

// Helper to set nested values
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
  const index = parseInt(lastKey, 10)

  if (!isNaN(index) && Array.isArray(current)) {
    current[index] = value
  } else {
    current[lastKey] = value
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: AiEditRequest = await request.json()
    const { instruction, pageSlug, apply = false } = body

    if (!instruction || !pageSlug) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing instruction or pageSlug' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Read current microtext
    const pagesDir = path.join(process.cwd(), 'src', 'pages')
    const filePath = path.join(pagesDir, `${pageSlug}.mdx`)

    let fileContent: string
    try {
      fileContent = await fs.readFile(filePath, 'utf-8')
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: `Page not found: ${pageSlug}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data } = matter(fileContent)

    if (!data.microtext) {
      return new Response(
        JSON.stringify({ success: false, error: 'No microtext in page frontmatter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Flatten microtext for AI
    const flatMicrotext = flattenMicrotext(data.microtext)

    // Get AI interpretation
    const changes = await interpretInstruction(instruction, flatMicrotext)

    if (changes.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          changes: [],
          applied: false,
          message: 'No changes needed'
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Apply if requested
    if (apply) {
      await applyChanges(pageSlug, changes)
    }

    const response: AiEditResponse = {
      success: true,
      changes,
      applied: apply
    }

    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI edit error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
