# Vibe Editor MCP Server

MCP (Model Context Protocol) server that lets AI assistants edit vibe-editor content directly.

## Tools

| Tool | Description |
|------|-------------|
| `list_pages` | List all MDX pages available for editing |
| `list_microtext` | Get all microtext for a page (key-value pairs) |
| `edit_microtext` | Edit a specific microtext by key |
| `ai_edit` | Natural language editing ("make the headline shorter") |

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Register with Claude Code

Add to your `~/.claude/mcp_servers.json`:

```json
{
  "vibe-editor": {
    "command": "node",
    "args": ["/path/to/vibe-editor/mcp-server/index.js"],
    "env": {
      "VIBE_EDITOR_URL": "http://localhost:4321",
      "VIBE_EDITOR_ROOT": "/path/to/vibe-editor"
    }
  }
}
```

### 3. Start vibe-editor dev server

```bash
# In the vibe-editor root
npm run dev
```

### 4. Restart Claude Code

The MCP server will be available after restart.

## Usage Examples

Once registered, you can ask Claude:

```
"List the pages in my vibe-editor site"
→ Calls list_pages

"Show me the content on the index page"
→ Calls list_microtext with pageSlug: "index"

"Change the headline to 'Ship faster'"
→ Calls edit_microtext with id: "hero-headline", value: "Ship faster"

"Make the CTA more urgent"
→ Calls ai_edit with instruction, returns preview, then applies
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VIBE_EDITOR_URL` | `http://localhost:4321` | URL of running vibe-editor |
| `VIBE_EDITOR_ROOT` | Parent of mcp-server dir | Path to vibe-editor project |

## API Endpoints Used

The MCP server calls these vibe-editor API endpoints:

- `POST /api/microtext` - Direct microtext edits
- `POST /api/ai-edit` - Natural language edits (requires ANTHROPIC_API_KEY in vibe-editor)
