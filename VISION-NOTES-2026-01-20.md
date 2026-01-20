# Vibe-Editor Strategic Vision Notes
*Session: 2026-01-20*

---

## What Problem Does Vibe-Editor Solve?

**The core tension:** Developer wants git. Client wants WYSIWYG. These have been mutually exclusive.

| Traditional Path | What Breaks |
|------------------|-------------|
| WordPress/Drupal | Developer loses git, gains database hell |
| Headless CMS (Contentful, Sanity) | $$$, another system to maintain, content divorced from code |
| "Just edit the file" | Client touches code, breaks things |
| Static site + markdown | Client can't see what they're editing |

**Vibe-editor solution:** Edit the content *where it appears*, but the edit writes to *the file the developer owns*. Both parties get what they need.

**One-line answer:** "Git-native WYSIWYG that makes Astro viable for client work without a headless CMS subscription."

---

## The Deeper Positioning: Content for the AI Age

| Era | Optimize For | Discovery Mechanism |
|-----|--------------|---------------------|
| 2005-2020 | Google keywords | Search engine crawling |
| 2020-2025 | Mobile UX + Core Web Vitals | Google ranking signals |
| **2025+** | **Structured, citable content** | **LLM retrieval + citation** |

Traditional site content:
```html
<p>We help businesses ship faster with our innovative platform...</p>
```
LLM sees: marketing fluff, can't cite, ignores it.

Microtext structure:
```yaml
microtext:
  value-prop: "Ship 40% faster"
  target-audience: "Series A startups"
  pricing: "$99/month"
```
LLM sees: extractable facts, can cite verbatim, includes in answers.

**This is the llms.txt play** - content pre-structured for AI extraction.

---

## Historical Parallel: Desktop Publishing

| Era | Tool | What It Enabled |
|-----|------|-----------------|
| 1985-2000 | QuarkXPress, PageMaker | Golden age of magazine design - designers *placed* content |
| 2004-2012 | WordPress, Drupal | Content divorced from design - writers filled forms |
| 2012-2020 | Squarespace, Webflow | In-context editing returns - but locked ecosystems |
| Now | Vibe-Editor | In-context + git ownership + AI structure |

**The insight:** When you can see where the words live *while you're writing them*, you write differently. The context shapes the content.

Ray Gun, Emigre, early Wired - designers were *placing text as a visual element*. The software made that possible. Before QuarkXPress, you handed copy to a typesetter and hoped.

**That direct manipulation unlocked a design sensibility that form-based CMSes destroyed.**

---

## What You Actually Built

**QuarkXPress:** Move boxes, resize boxes, edit text in boxes
**Vibe-Editor:** Edit text in boxes. That's it.

The boxes (structure) are **frozen by the developer**. The client can only change what's inside. That's the safety guarantee - the design can't break.

**The constraint is the feature.**

| System | Who Controls Structure | Who Controls Content |
|--------|------------------------|---------------------|
| QuarkXPress | Designer | Designer |
| WordPress | Theme + DB schema | Anyone with login |
| Squarespace | User (dangerous) | User |
| **Vibe-Editor** | **Developer (MDX)** | **Client (microtext only)** |

---

## MDX + YAML is LLM-Native

```yaml
---
microtext:
  headline: "Ship faster"
  features:
    - title: "Feature 1"
      desc: "Does X"
---

<Hero headline={microtext.headline} />
```

This is:
- **Structured** (YAML) - machines parse it perfectly
- **Unstructured** (markdown body) - humans read it naturally
- **Colocated** - one file, both modes
- **Version-controlled** - git diff shows exactly what changed

JSON alone is too rigid for prose. Markdown alone has no schema. MDX frontmatter is the hybrid that LLMs can both read and write cleanly.

---

## How This Changes AI Development Workflow

### Current Workflow (Without Vibe-Editor)

```
User: "Change the headline on the homepage"

AI:
1. Read the file (hunting for where headline lives)
2. Find it's in JSX: <h1 className="...">Old Headline</h1>
3. Use Edit tool to change the string
4. Hope I didn't break the className or tag structure
5. User reviews, deploy
```

**Risk:** AI might accidentally delete a quote, break a className, or edit the wrong h1.

### With Vibe-Editor MCP

```
User: "Change the headline on the homepage"

AI:
1. list_microtext("home") → see all editable IDs
2. edit_microtext("home", "hero-headline", "New Headline")
3. Done. Structure untouched.
```

**What changes:**
- AI can't break layout (frontmatter only)
- AI sees exactly what's editable (explicit boundaries)
- Dot notation means precision (`features.2.title` not "the third feature heading")

---

## New Capabilities Enabled

### 1. Git-Branched Content Testing

```bash
git checkout -b content/headline-experiment

# AI edits microtext variants
edit_microtext("home", "hero-headline", "Ship 40% Faster")

git push → Cloudflare preview URL

# Measure, compare, merge winner
git checkout main && git merge content/headline-experiment
```

Content variants live in version control. See exactly what changed, when, and roll back.

### 2. Intake-to-Site Pipeline

```
Client fills intake form:
  - Business name: "Oakland Brainspotting"
  - Tagline: "Heal trauma, restore calm"
  - Services: ["EMDR", "Brainspotting", "Somatic"]

↓

Script generates microtext frontmatter:
  microtext:
    business-name: "Oakland Brainspotting"
    hero-headline: "Heal trauma, restore calm"
    services:
      - title: "EMDR"
      - title: "Brainspotting"
      - title: "Somatic"

↓

Deploy template → Client edits in place from day 1
```

New client site in hours, not days. Microtext schema is your intake form.

### 3. Cross-Site Content Intelligence

```
"What CTAs convert best across my therapy clients?"

→ Pull microtext from all sites
→ Join with analytics (which pages convert)
→ Find: sites with "Schedule a Free Consultation"
   convert 2x better than "Contact Us"

→ Bulk update underperformers
```

Your portfolio becomes a dataset, not just a list of projects.

### 4. AI Content Partner Workflow

```
User: "Suggest better headlines for Walt's site"

AI:
1. list_microtext("walt-opie") → get current values
2. Generate 3 alternatives per headline
3. User picks favorites
4. edit_microtext for each → goes to localStorage (draft)
5. User reviews on actual page (yellow draft indicators)
6. Approve → sync to git
```

AI proposes, user approves, changes staged visually before commit.

### 5. Localization Without a CMS

```yaml
# en/index.mdx
microtext:
  hero-headline: "Ship faster"
  cta: "Get started"

# es/index.mdx
microtext:
  hero-headline: "Envía más rápido"
  cta: "Comenzar"
```

Same structure, different files. No translation plugin. Git tracks what's been translated.

### 6. Content Freshness Monitoring

```
"Flag any microtext that hasn't changed in 12 months"

→ Git log per microtext ID
→ Find stale: testimonials, pricing, team bios
→ Generate reminder: "This testimonial is from 2024"
```

Content decay is visible because changes are tracked.

### 7. Template Vertical Libraries

```
/templates/therapy-practice/
  microtext-schema.yaml  # Required fields for this vertical
  index.mdx              # Pre-wired components

/templates/saas-landing/
  microtext-schema.yaml
  index.mdx
```

Spin up a new site:
```bash
cp -r templates/therapy-practice clients/new-client
# Fill microtext → deploy
```

Your templates are reusable knowledge, not just code.

---

## From Developer Perspective: What Gets Faster

| Task | Today | With Vibe-Editor |
|------|-------|------------------|
| **New site setup** | Build from scratch or customize template, manually enter content | Clone vertical template, populate microtext from intake form, deploy |
| **Client onboarding** | Train on CMS, credentials, "don't touch this" warnings | "Click any text. Edit. Save." |
| **"Change my headline" request** | You open file, edit, commit, deploy | Client does it. Or their chatbot does. |
| **"Update all our CTAs"** | Open each page, find CTA, edit, repeat | One script or AI command across all pages |
| **Content audit** | Manual review, spreadsheet tracking | Query microtext, diff against last quarter |
| **Multi-site consistency** | Hope you remember the pattern | Schema enforces it, AI can verify |

**What compresses:**
- Client support for content: **→ 0**
- New site spin-up: **hours → minutes**
- Your role: content updater → **structural architect**

---

## From Client Perspective: What Gets Easier

| Task | Today (Typical CMS) | With Vibe-Editor |
|------|---------------------|------------------|
| **Change a typo** | Log into admin, find page, find field, edit, save, publish | Click typo on page, fix, save |
| **Update pricing** | Email developer, wait | Click price, change it |
| **See the change** | Preview button, separate view | Instant, on the actual page |
| **Break the site** | Possible (wrong field, bad HTML) | Impossible (microtext only) |
| **Version history** | Maybe, depends on CMS | Full git history, can rollback |
| **Ask AI for help** | "Sorry, I can't access your CMS" | AI edits directly via MCP |

**What they gain:**
- Zero wait time for content changes
- Zero fear of breaking things
- Their own AI assistant can make changes

---

## The Chatbot Endgame

```
Client: "Hey, can you change our homepage headline to
        'Find Your Calm' and make all the CTAs say
        'Book a Free Consultation'?"

Client's AI (with MCP access):
  → list_microtext("home")
  → edit_microtext("home", "hero-headline", "Find Your Calm")
  → edit_microtext("home", "cta-1", "Book a Free Consultation")
  → edit_microtext("home", "cta-2", "Book a Free Consultation")

AI: "Done. Refresh to see the changes. Want me to sync
     to production?"

Client: "Yes"

AI: → sync_to_server()
    → publish_to_git()

AI: "Live now."
```

**Developer is not in this loop.**

---

## What Developer Still Owns

| Still Developer | Not Developer Anymore |
|-----------------|----------------------|
| New page structures | Text changes |
| Design updates | Copy tweaks |
| New components | CTA wording |
| Schema decisions (what's editable) | Filling in the schema |
| Template creation | Template population |
| Strategic consultation | "Make it say X instead" |

---

## Business Model Implications

### The Actual Stack

```
Website (vibe-editor)     ← Self-service, client edits
        ↓
Ads (traffic)             ← Developer optimizes
        ↓
Nurture (email/SMS)       ← Developer builds sequences
        ↓
Fast 5 (qualification)    ← Developer designs flow
        ↓
Booked appointments       ← The money
```

**The website is the front door.** It needs to not be a problem.

### Old Model vs New Model

**Old model:**
- Setup fee + hourly support
- Profit from client helplessness
- Doesn't scale (developer time = client content changes)

**Vibe-editor model:**
- Setup fee + optional retainer for structural work
- Client independence = developer freedom
- Scales (50 sites, same support load as 5)

### Support Scaling Path

**Phase 1 (Now):**
- Client self-serve via click-to-edit
- Developer answers occasional "how do I..." questions

**Phase 2 (10+ clients):**
- Chatbot handles "how do I..." via MCP
- Developer only sees structural requests

**Phase 3 (Success):**
- Zendesk/Intercom for edge cases
- Chatbot handles 90% of content requests
- Developer fully in ads/nurture/conversion work

---

## Positioning Strategy

**The play:**
```
Moat (internal):     Vibe-editor makes operation faster
                     Clients get self-serve, competitors don't

Reputation (external): "Dean solves problems others haven't"
                       Share insights, not the full implementation
                       Vet before claiming
```

Not selling the tool. Selling the *outcome* the tool enables, building reputation by being visibly thoughtful about the problem space.

### Vetting Path

| Checkpoint | Evidence Needed |
|------------|-----------------|
| **Works for you** | Built 2-3 client sites with it, no major friction |
| **Clients actually use it** | They edit without calling you |
| **Chatbot integration works** | MCP tested, client-facing AI can make changes |
| **Survives edge cases** | Weird content, markdown in microtext, array mutations |
| **Scales** | 10+ sites, still manageable |

### Reputation Sequence

```
Solve problem → Vet solution → Share pattern → Become known

Not:

Have idea → Announce solution → Hope it works
```

Currently on step 2. That's the right place to be.

---

## Simpler Framing (Revised After Discussion)

The earlier sections explore interesting possibilities, but may overthink it.

**The actual value is simple:**

| For You | "Can you edit this text" is off your plate |
|---------|---------------------------------------------|
| For Client | They can do it themselves |
| For Client's AI | It can do it without knowing Astro |

**For a sophisticated LLM like Claude?** Marginal improvement. Claude can edit JSX fine. Microtext is cleaner but not transformative.

**Where it actually matters:** A client's chatbot (a dumber model with MCP access) can safely edit content without understanding the codebase. Microtext lowers the bar for what can safely make changes.

---

## The Honest Framing

> "Vibe-editor makes text editing a solved problem so it's never your problem again."

Not a paradigm shift. Just one less thing to think about.

**Is that enough?**

For the moat + getting out of support + letting clients own their content: **yes.**

The website is just the front door. The real work is ads → nurture → appointments. Vibe-editor removes the website from your support burden so you can focus on what makes money.

---

## What's Actually Being Claimed

| Claim | Status |
|-------|--------|
| Clients can edit without breaking things | Real, testable |
| Developer gets out of content support | Real, if clients use it |
| Client's AI can make changes | Real, MCP works |
| LLM can "reason about content for SEO" | Probably overthinking it |
| Paradigm shift for content management | No - incremental improvement |
| Good enough to be a competitive moat | Probably yes |

---

## Summary

**Vibe-editor makes text editing a solved problem.**

- Content exposed as structured microtext in frontmatter
- Clients click-to-edit without touching code
- Client's AI can operate via MCP without knowing the codebase
- Git provides version history
- Developer never handles "change this text" requests again

That's it. Not a revolution. Just a good tool that removes friction.

The fancy stuff (A/B testing, cross-site intelligence, AI optimization) is possible but not the core value. The core value is: **text editing is no longer your problem.**
