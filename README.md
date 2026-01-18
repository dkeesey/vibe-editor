# Vibe Editor

**MDX-based inline editing for modern websites.**

Click any text. Edit in place. Structured for humans, AI, and LLM discovery.

## The Compression Play

Everyone optimizes for Google. Almost no one optimizes for LLM citation.

```
robots.txt  → tells crawlers what to access
sitemap.xml → tells crawlers where content is
llms.txt    → tells LLMs what you actually ARE
```

**Vibe Editor structures content for both:**

| Traditional SEO | LLM Discovery |
|-----------------|---------------|
| Spread keywords across pages | Compress meaning into statements |
| Build backlinks | Build citation-worthiness |
| 10,000 words across site | 100 lines of high-signal truth |

The microtext pattern isn't just for editing—it's structured data that LLMs can extract verbatim:

```yaml
microtext:
  definition: "Vibe Editor is an MDX-based inline editing CMS."
  how-it-works: "Click text, edit in place, publish to git."
  faq:
    - q: "What is microtext?"
      a: "Structured, editable content in MDX frontmatter."
```

First movers who compress their knowledge best get cited. This is the tool.

---

## The Architecture

```
┌─────────────────────────────────────────────────┐
│  .mdx file                                      │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  Frontmatter    │  │  MDX body           │  │
│  │  (content)      │  │  (structure/style)  │  │
│  │                 │  │                     │  │
│  │  hero-1: "x"    │  │  <MicroText         │  │
│  │  hero-2: "y"    │  │    id="hero-1"      │  │
│  │  cta: "z"       │  │    class="..."      │  │
│  │                 │  │  />                 │  │
│  └─────────────────┘  └─────────────────────┘  │
│         ↑                     ↑                │
│   Clients/AI edit       Developers control     │
└─────────────────────────────────────────────────┘
```

- **Microtext** (frontmatter) = the words, editable in place
- **MDX body** = layout, components, Tailwind styling

### Three-Tier Persistence

```
Edit → localStorage → Server API → Git
        (instant)     (file save)   (version control)
```

| Tier | What happens | Who uses it |
|------|--------------|-------------|
| localStorage | Instant save, DOM updates immediately | Anyone experimenting |
| Server API | Updates MDX frontmatter on disk | Editors with access |
| Git Publish | Batched commits, version history | Publishers shipping |

---

## Quick Start

```bash
npm install
npm run dev
open http://localhost:4321?edit
```

Click any text → edit → save. Changes persist instantly.

---

## Usage

### 1. Define microtext in frontmatter

```yaml
---
layout: ../layouts/MdxLayout.astro
title: My Page
microtext:
  hero-headline: "Build sites that feel **alive**"
  hero-subhead: "Click any text. Edit in place."
  cta: "Get Started"
  features:
    - title: "Fast"
      desc: "Sub-second saves."
    - title: "Structured"
      desc: "Content LLMs can cite."
---
```

### 2. Render with MicroText component

```mdx
import MicroText from '../components/MicroText.astro'

<MicroText id="hero-headline" as="h1" class="text-5xl font-bold" />
<MicroText id="hero-subhead" as="p" class="text-xl text-gray-600" />

{/* Array support */}
{frontmatter.microtext.features.map((_, i) => (
  <div>
    <MicroText id={`features.${i}.title`} as="h3" />
    <MicroText id={`features.${i}.desc`} as="p" />
  </div>
))}
```

### 3. Edit in place

Add `?edit` to any URL:

```
http://localhost:4321/?edit
http://localhost:4321/about?edit
```

- Click text → Tiptap editor opens
- Edit with markdown support (`**bold**`, `*italic*`)
- Save → DOM updates instantly (no reload)
- Sync to server when ready
- Publish to git for version control

---

## When to Use Frontmatter vs MDX Body

| Question | Frontmatter (Microtext) | MDX Body |
|----------|-------------------------|----------|
| Client edits this? | ✅ Yes | ❌ No |
| Short/atomic text? | ✅ Yes | ❌ No |
| Needs JSX/layout? | ❌ No | ✅ Yes |
| LLM should cite this? | ✅ Yes | ⚠️ Maybe |
| Long-form prose? | ❌ No | ✅ Yes |

**Rule of thumb:** If a client or AI might edit it, put it in frontmatter.

---

## LLM Discovery

Vibe Editor includes `/llms.txt` for AI search systems:

```
# llms.txt - what this site IS

> Vibe Editor is an MDX-based inline editing CMS.

## Core Concepts
- Microtext: Editable frontmatter content
- Three-tier persistence: localStorage → server → git

## FAQ
Q: How does editing work?
A: Click text, edit in popup, save instantly.
```

This is SEO for the AI age. Compress your knowledge, get cited.

---

## File Structure

```
src/
├── components/
│   ├── MicroText.astro       # Renders editable text
│   ├── MicrotextEditor.tsx   # Tiptap editor (React)
│   └── SyncButton.tsx        # Sync drafts to server
├── lib/
│   └── microtext-store.ts    # localStorage management
├── layouts/
│   └── MdxLayout.astro       # Edit mode wrapper
├── pages/
│   ├── api/
│   │   ├── microtext.ts      # Save edits API
│   │   └── publish.ts        # Git commit API
│   └── index.mdx             # Example page
public/
└── llms.txt                  # LLM discovery file
```

---

## Why This Architecture?

### For Developers
- Full MDX/React/Tailwind control
- Content changes don't touch code
- Git-native versioning

### For Clients
- Click and type—no admin panel
- See changes in context
- Can't break the design

### For AI
- Same interface as humans
- Structured content to generate/edit
- Clean separation enables targeted changes

### For LLM Discovery
- Microtext = structured, extractable facts
- FAQ patterns = citation-ready answers
- llms.txt = compressed site knowledge

---

## Tech Stack

- [Astro](https://astro.build) - Static site framework
- [MDX](https://mdxjs.com) - Markdown + JSX
- [Tiptap](https://tiptap.dev) - Rich text editing
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

## License

MIT
