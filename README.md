# Vibe Editor

**MDX-based inline editing for modern websites.**

Separate content from structure. Edit text in place. Works for humans and AI alike.

## The Concept

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
│         ↑                                       │
│    Editor writes here                           │
└─────────────────────────────────────────────────┘
```

- **Microtext** (frontmatter) = the words, editable in place
- **MDX body** = layout, components, Tailwind styling

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
open http://localhost:4321

# Enable edit mode
open http://localhost:4321?edit
```

## Usage

### 1. Define microtext in frontmatter

```mdx
---
layout: ../layouts/MdxLayout.astro
title: My Page
microtext:
  hero-headline: "Welcome to my site"
  hero-subhead: "We make great things"
  cta: "Get Started"
---
```

### 2. Use MicroText component in MDX

```mdx
import MicroText from '../components/MicroText.astro'

<MicroText id="hero-headline" as="h1" class="text-5xl font-bold" />
<MicroText id="hero-subhead" as="p" class="text-xl text-gray-600" />

<button class="bg-blue-500 text-white px-6 py-3 rounded">
  <MicroText id="cta" />
</button>
```

### 3. Edit in place

Add `?edit` to any URL to enable edit mode:

```
http://localhost:4321/?edit
http://localhost:4321/about?edit
```

Click any text → edit → save. Changes persist to the .mdx file.

## File Structure

```
src/
├── components/
│   ├── MicroText.astro      # Renders editable text
│   └── MicrotextEditor.tsx  # Tiptap editor (React island)
├── layouts/
│   └── MdxLayout.astro      # Page wrapper with edit mode
├── pages/
│   ├── api/
│   │   └── microtext.ts     # API for saving edits
│   └── index.mdx            # Example page
```

## Why This Architecture?

### For Developers
- Full MDX/React/Tailwind control over design
- Content changes don't require code changes
- Git-friendly: .mdx files version control naturally

### For Content Editors
- Click and type - no admin panel needed
- See changes in context immediately
- Can't accidentally break the design

### For AI
- Same interface as humans
- Can generate structure (MDX) or content (frontmatter) independently
- Clean separation enables targeted edits

## Extending

### Add more pages

Create new `.mdx` files in `src/pages/`:

```mdx
---
layout: ../layouts/MdxLayout.astro
title: About Us
microtext:
  about-title: "Our Story"
  about-content: "We started in a garage..."
---

import MicroText from '../components/MicroText.astro'

<MicroText id="about-title" as="h1" class="text-4xl font-bold" />
<MicroText id="about-content" as="p" class="mt-4" />
```

### Use with component libraries

Works great with shadcn/ui or any React components:

```mdx
import { Button } from '../components/ui/button'
import MicroText from '../components/MicroText.astro'

<Button size="lg">
  <MicroText id="cta" />
</Button>
```

### Rich text in microtext

Microtext values can contain markdown:

```yaml
microtext:
  hero: "Build **faster** with _less_ code"
```

Then render with markdown processing (see docs for setup).

## Tech Stack

- [Astro](https://astro.build) - Static site framework
- [MDX](https://mdxjs.com) - Markdown + JSX
- [React](https://react.dev) - For interactive editor
- [Tiptap](https://tiptap.dev) - Rich text editing
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing

## License

MIT
