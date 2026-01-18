#!/usr/bin/env node

/**
 * Vibe Editor MCP Server
 *
 * Exposes vibe-editor functionality to AI assistants via MCP.
 * Enables Claude to compose, edit, and manage entire MDX sites with JSON.
 *
 * Page Tools:
 * - list_pages: List all MDX pages
 * - list_microtext: Get all microtext for a page
 * - edit_microtext: Edit a specific microtext key
 * - ai_edit: Natural language editing (requires ANTHROPIC_API_KEY)
 * - create_page: Create new page from JSON spec
 * - delete_page: Delete a page (protects index)
 * - compose_site: Bulk create pages from site schema
 *
 * Site Config Tools:
 * - get_site_config: Read nav, footer, social, metadata
 * - update_site_config: Update site config (deep merge)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

// Configuration - set via environment or default
const VIBE_EDITOR_URL = process.env.VIBE_EDITOR_URL || 'http://localhost:4321'
const VIBE_EDITOR_ROOT = process.env.VIBE_EDITOR_ROOT || process.cwd().replace('/mcp-server', '')

// Flatten nested microtext into id -> value map
function flattenMicrotext(obj, prefix = '') {
  const result = {}

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

// Read microtext from a page
async function getMicrotext(pageSlug) {
  const filePath = path.join(VIBE_EDITOR_ROOT, 'src', 'pages', `${pageSlug}.mdx`)

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const { data } = matter(content)
    return data.microtext ? flattenMicrotext(data.microtext) : {}
  } catch (error) {
    throw new Error(`Page not found: ${pageSlug}`)
  }
}

// List available pages
async function listPages() {
  const pagesDir = path.join(VIBE_EDITOR_ROOT, 'src', 'pages')
  const files = await fs.readdir(pagesDir)
  return files
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace('.mdx', ''))
}

// Generate MDX content from page spec
function generatePageMDX(spec) {
  const { title, description, layout = 'Layout', microtext = {}, body = '' } = spec

  const frontmatter = {
    title,
    description,
    layout,
    microtext
  }

  // Default body template if none provided
  const defaultBody = `
import { Microtext } from '../components/Microtext'

# <Microtext id="headline" />

<Microtext id="subhead" />
`

  return matter.stringify(body || defaultBody, frontmatter)
}

// Create a new page
async function createPage(pageSlug, spec) {
  const filePath = path.join(VIBE_EDITOR_ROOT, 'src', 'pages', `${pageSlug}.mdx`)

  // Check if page already exists
  try {
    await fs.access(filePath)
    throw new Error(`Page already exists: ${pageSlug}`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }

  const content = generatePageMDX(spec)
  await fs.writeFile(filePath, content, 'utf-8')
  return { created: pageSlug, path: filePath }
}

// Delete a page
async function deletePage(pageSlug) {
  // Prevent deletion of index
  if (pageSlug === 'index') {
    throw new Error('Cannot delete index page')
  }

  const filePath = path.join(VIBE_EDITOR_ROOT, 'src', 'pages', `${pageSlug}.mdx`)
  await fs.unlink(filePath)
  return { deleted: pageSlug }
}

// Compose multiple pages from site schema
async function composeSite(schema) {
  const { pages, globalMicrotext = {} } = schema
  const results = []

  for (const [slug, spec] of Object.entries(pages)) {
    // Merge global microtext with page-specific
    const mergedSpec = {
      ...spec,
      microtext: { ...globalMicrotext, ...spec.microtext }
    }

    try {
      const result = await createPage(slug, mergedSpec)
      results.push({ ...result, status: 'created' })
    } catch (e) {
      results.push({ page: slug, status: 'error', error: e.message })
    }
  }

  return { results, totalPages: Object.keys(pages).length }
}

// Site config path
const SITE_CONFIG_PATH = path.join(VIBE_EDITOR_ROOT, 'src', 'config', 'site.json')

// Read site config
async function getSiteConfig() {
  try {
    const content = await fs.readFile(SITE_CONFIG_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (e) {
    return { name: 'Untitled Site', nav: [], footer: {}, social: {} }
  }
}

// Update site config (deep merge)
async function updateSiteConfig(updates) {
  const current = await getSiteConfig()
  const updated = deepMerge(current, updates)
  await fs.writeFile(SITE_CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}

// Deep merge utility
function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

// Create the MCP server
const server = new Server(
  {
    name: 'vibe-editor',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_pages',
        description: 'List all MDX pages available for editing',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'list_microtext',
        description: 'Get all microtext content for a page. Returns key-value pairs of editable text.',
        inputSchema: {
          type: 'object',
          properties: {
            pageSlug: {
              type: 'string',
              description: 'Page slug (e.g., "index", "about")'
            }
          },
          required: ['pageSlug']
        }
      },
      {
        name: 'edit_microtext',
        description: 'Edit a specific microtext value by its key',
        inputSchema: {
          type: 'object',
          properties: {
            pageSlug: {
              type: 'string',
              description: 'Page slug (e.g., "index")'
            },
            id: {
              type: 'string',
              description: 'Microtext key (e.g., "hero-headline", "features.0.title")'
            },
            value: {
              type: 'string',
              description: 'New value for the microtext'
            }
          },
          required: ['pageSlug', 'id', 'value']
        }
      },
      {
        name: 'ai_edit',
        description: 'Edit content using natural language. Describe what you want to change and the AI will figure out which microtext to update.',
        inputSchema: {
          type: 'object',
          properties: {
            pageSlug: {
              type: 'string',
              description: 'Page slug (e.g., "index")'
            },
            instruction: {
              type: 'string',
              description: 'Natural language instruction (e.g., "Make the headline more urgent")'
            },
            apply: {
              type: 'boolean',
              description: 'Whether to apply changes immediately (default: false for preview)',
              default: false
            }
          },
          required: ['pageSlug', 'instruction']
        }
      },
      {
        name: 'create_page',
        description: 'Create a new MDX page with microtext. Provide a JSON spec with title, description, and microtext.',
        inputSchema: {
          type: 'object',
          properties: {
            pageSlug: {
              type: 'string',
              description: 'URL slug for the page (e.g., "about", "pricing")'
            },
            spec: {
              type: 'object',
              description: 'Page specification',
              properties: {
                title: { type: 'string', description: 'Page title' },
                description: { type: 'string', description: 'Meta description' },
                layout: { type: 'string', description: 'Layout component (default: Layout)' },
                microtext: { type: 'object', description: 'Key-value pairs of editable content' },
                body: { type: 'string', description: 'MDX body content (optional, uses template if not provided)' }
              },
              required: ['title']
            }
          },
          required: ['pageSlug', 'spec']
        }
      },
      {
        name: 'delete_page',
        description: 'Delete an MDX page (cannot delete index)',
        inputSchema: {
          type: 'object',
          properties: {
            pageSlug: {
              type: 'string',
              description: 'Page slug to delete'
            }
          },
          required: ['pageSlug']
        }
      },
      {
        name: 'compose_site',
        description: 'Create multiple pages from a site schema JSON. Allows bulk page creation with shared global microtext.',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'object',
              description: 'Site schema with pages and optional globalMicrotext',
              properties: {
                globalMicrotext: { type: 'object', description: 'Shared microtext for all pages' },
                pages: {
                  type: 'object',
                  description: 'Map of pageSlug -> page spec'
                }
              },
              required: ['pages']
            }
          },
          required: ['schema']
        }
      },
      {
        name: 'get_site_config',
        description: 'Get the site configuration including nav, footer, social links, and site metadata.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'update_site_config',
        description: 'Update site configuration. Supports partial updates (deep merge). Use to modify nav, footer, social links, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            updates: {
              type: 'object',
              description: 'Partial config to merge. E.g., { "nav": [{ "label": "Home", "href": "/" }] }',
              properties: {
                name: { type: 'string', description: 'Site name' },
                tagline: { type: 'string', description: 'Site tagline' },
                nav: {
                  type: 'array',
                  description: 'Navigation items',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      href: { type: 'string' }
                    }
                  }
                },
                footer: {
                  type: 'object',
                  description: 'Footer config with copyright and links'
                },
                social: {
                  type: 'object',
                  description: 'Social media links'
                }
              }
            }
          },
          required: ['updates']
        }
      }
    ]
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'list_pages': {
        const pages = await listPages()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ pages }, null, 2)
            }
          ]
        }
      }

      case 'list_microtext': {
        const { pageSlug } = args
        const microtext = await getMicrotext(pageSlug)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ pageSlug, microtext }, null, 2)
            }
          ]
        }
      }

      case 'edit_microtext': {
        const { pageSlug, id, value } = args

        // Call the API endpoint
        const response = await fetch(`${VIBE_EDITOR_URL}/api/microtext`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageSlug, id, value })
        })

        const result = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      }

      case 'ai_edit': {
        const { pageSlug, instruction, apply = false } = args

        // Call the AI edit endpoint
        const response = await fetch(`${VIBE_EDITOR_URL}/api/ai-edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageSlug, instruction, apply })
        })

        const result = await response.json()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      }

      case 'create_page': {
        const { pageSlug, spec } = args
        const result = await createPage(pageSlug, spec)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      }

      case 'delete_page': {
        const { pageSlug } = args
        const result = await deletePage(pageSlug)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      }

      case 'compose_site': {
        const { schema } = args
        const result = await composeSite(schema)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      }

      case 'get_site_config': {
        const config = await getSiteConfig()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(config, null, 2)
            }
          ]
        }
      }

      case 'update_site_config': {
        const { updates } = args
        const result = await updateSiteConfig(updates)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ updated: true, config: result }, null, 2)
            }
          ]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2)
        }
      ],
      isError: true
    }
  }
})

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Vibe Editor MCP server running')
}

main().catch(console.error)
