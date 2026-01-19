# Test Vibe Editor MCP Integration

## Mission
Test the newly built MCP server by having Claude directly edit vibe-editor content from conversation.

## Context (What We Built Today)

### Vibe Editor - MDX Inline Editing CMS
Built a complete inline editing system with "The Compression Play" framing:
- **Microtext pattern**: Structured frontmatter content that's safe for AI to edit
- **Three-tier persistence**: localStorage → Server API → Git
- **Real-time DOM updates**: Edit in place, see changes instantly

### AI-Native Features Just Added
1. **Natural Language Endpoint** (`/api/ai-edit`)
   - Accepts plain English: "Make the headline more urgent"
   - Uses Claude API to interpret which microtext to change
   - Returns preview before applying

2. **MCP Server** (`mcp-server/`)
   - Tools: `list_pages`, `list_microtext`, `edit_microtext`, `ai_edit`
   - Just registered with Claude Code: `claude mcp add vibe-editor ...`
   - Confirmed connected: `claude mcp list` shows ✓

### Key Insight
The MDX format (structured frontmatter + unstructured body) is the perfect LLM format:
- Frontmatter = API (safe for machines)
- MDX body = implementation (references the API)

## Key Files
- `/Users/deankeesey/Workspace/vibe-editor/mcp-server/index.js` - MCP server
- `/Users/deankeesey/Workspace/vibe-editor/src/pages/api/ai-edit.ts` - Natural language endpoint
- `/Users/deankeesey/Workspace/vibe-editor/src/pages/index.mdx` - Test page with microtext

## The Plan
1. Start vibe-editor dev server: `./start-dev.sh` (loads ANTHROPIC_API_KEY)
2. Test MCP tools in fresh session:
   - `mcp__vibe-editor__list_pages` - Should list index
   - `mcp__vibe-editor__list_microtext` - Should show all microtext
   - `mcp__vibe-editor__edit_microtext` - Direct edit by key
   - `mcp__vibe-editor__ai_edit` - Natural language edit
3. Verify changes in browser

## Success Criteria
- [ ] MCP tools appear in Claude's available tools
- [ ] Can list microtext from conversation
- [ ] Can edit microtext directly (e.g., change headline)
- [ ] Can use natural language ("make the CTA more urgent")
- [ ] Changes persist to the MDX file

## Watch Out For
- Dev server must be running for API calls to work
- ANTHROPIC_API_KEY needed for ai_edit endpoint (use `./start-dev.sh`)
- MCP uses localhost:4321 - ensure that port is available

## Current Microtext on Index Page
```yaml
hero-headline: "Create magic with every click"
hero-subhead: "Click any text. Edit in place. Ship *instantly*."
cta-primary: "Try It Now"
cta-secondary: "Learn More"
features:
  - title: "Inline Editing"
    desc: "No more switching between preview and code. Just **click** and type."
  - title: "MDX Powered"
    desc: "Full component flexibility. *Tailwind* styling. React islands."
  - title: "AI Ready"
    desc: "Same interface for humans and AI. Generate, edit, iterate."
```

## Test Commands to Try
```
"List the pages in vibe-editor"
"Show me the microtext on the index page"
"Change the headline to 'Ship faster with AI'"
"Make the CTA more urgent"
```

## Repo
https://github.com/dkeesey/vibe-editor
