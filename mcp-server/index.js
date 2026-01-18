#!/usr/bin/env node

/**
 * Vibe Editor MCP Server
 *
 * Exposes vibe-editor functionality to AI assistants via MCP.
 *
 * Tools:
 * - list_microtext: Get all microtext for a page
 * - edit_microtext: Edit a specific microtext key
 * - ai_edit: Natural language editing
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
