# Vibe-Editor Session Context - 2026-01-18

## What We Accomplished Today

### 1. **Tested MCP Integration** ✅
- Confirmed vibe-editor MCP tools working (list_pages, list_microtext, edit_microtext)
- Successfully edited microtext from Claude Code conversation
- Verified persistence to MDX files
- AI edit endpoint needs ANTHROPIC_API_KEY configuration (optional feature)

### 2. **Discovered json-render Pattern** ✅
- Found Vercel Labs json-render: AI → JSON → UI with guardrails
- Maps perfectly to vibe-editor architecture
- Enables AI-safe site generation (component catalog prevents hallucinations)
- Can generate sites from natural language prompts

### 3. **Defined Complete Architecture** ✅

**The Stack:**
```
Astro + MDX
  ↓
Microtext (YAML frontmatter - structured content)
  ↓
MicroText.astro (wrapper component with data-microtext attrs)
  ↓
React islands (inline editing)
  ↓
API persistence (/api/microtext)
  ↓
Git commits
  ↓
GitHub Actions → Cloudflare Pages
```

**The Fast 5 Engine:**
```
Google/FB Ad Lead Form
  ↓
Cloudflare Worker (0 seconds)
  ↓
Multi-channel cascade:
  - Chatbot qualifier (website)
  - SMS (immediate)
  - Email (30 sec)
  - Voice (2 min)
  ↓
AI qualifies via conversation
  ↓
Books on HouseCall Pro
```

### 4. **Clarified Research Tools** ✅
- WebSearch (built-in) = Default for research (free, unlimited, excellent)
- Gemini grounded = 500 free/day with usage tracking (gemini-grounded-tracked.sh)
- Created usage tracker: check-gemini-grounding.sh

### 5. **Identified Real Use Cases** ✅

**Primary market:** Developers managing 5-50 client sites

**Target verticals:**
- Therapists (HIPAA-compliant, booking, insurance)
- Lawyers (consultations, case types, urgency)
- Home services (plumbing, HVAC, electrical)
- Art foundations (exhibitions, donors, researchers)

**Core value prop:**
- Fast 5 promise (85% conversion vs 10-15% without)
- Client self-service via AI chat
- Developer CLI manages entire portfolio
- $0 hosting (Cloudflare Pages free tier)

---

## Current State: What Exists

### Vibe-Editor Repo ✅
**Location:** `/Users/deankeesey/Workspace/vibe-editor/`

**Working features:**
- Astro + MDX + React
- Microtext pattern in frontmatter
- MicroText.astro wrapper component
- Inline editing (browser)
- MCP server (Claude integration)
- API endpoints (microtext, publish)
- Git integration

**MCP Tools tested:**
```bash
mcp__vibe-editor__list_pages       # ✅ Works
mcp__vibe-editor__list_microtext   # ✅ Works
mcp__vibe-editor__edit_microtext   # ✅ Works
mcp__vibe-editor__ai_edit          # ⚠️ Needs API key config
```

### deankeesey.com Portfolio ✅
**Location:** `/Users/deankeesey/Workspace/dk-sites/dk-portfolio/`

**Current tech:**
- Astro v4
- React components (HeroSection, Timeline, Skills)
- Tailwind + shadcn/ui
- Content hardcoded in React components
- Animated gradient background + floating circles

**Migration needed:** Convert to vibe-editor model (make text editable)

---

## Key Insights & Decisions

### 1. **The Microtext Pattern IS the Innovation**
```yaml
# NOT this (traditional CMS):
content: "<h1>Long HTML...</h1>"

# BUT this (vibe-editor):
microtext:
  hero-headline: "Ship faster with AI"
  features:
    - title: "Feature 1"
      desc: "Description"
```

**Why it matters:**
- Structured (AI can understand)
- Semantic (keys describe purpose)
- Bounded (can't break layout)
- Safe (AI editing won't inject code)

### 2. **json-render Validates the Architecture**
- Vercel Labs built same pattern independently
- Proves: AI needs constrained vocabulary for safe UI generation
- Vibe-editor's component catalog = json-render's guardrails
- Can generate entire sites from prompts safely

### 3. **Fast 5 = The Killer Feature**
- Statistics: 85% conversion within 5min vs 10-15% next day
- Multi-channel cascade (chat → SMS → email → voice)
- AI chatbot qualifies before triggering Fast 5 (saves time)
- HouseCall Pro integration for home services booking

### 4. **WebSearch > Gemini for Development Research**
- Built-in, free, unlimited, excellent quality
- Proved with json-render research (found everything needed)
- Gemini available but unnecessary complexity
- Keep it simple

### 5. **Git + GitHub + Cloudflare = Perfect Fit**
- Each client site = git repo
- GitHub Actions handles deployment
- Cloudflare Pages free tier (generous)
- Developer owns code, can edit manually if needed
- CLI orchestrates across all repos

---

## What to Build Next

### Option 1: Migrate deankeesey.com (Proof of Concept)
**Why:** Shows vibe-editor works on real production site
**Effort:** 2-4 hours
**Steps:**
1. Convert index.astro → index.mdx
2. Extract content to microtext frontmatter
3. Create HeroSectionVibe.tsx (microtext-aware)
4. Add inline editing
5. Test: visit ?edit, click text, save

**Result:** Dean's portfolio becomes editable via Claude MCP

### Option 2: Build Component Catalog (json-render Integration)
**Why:** Enables AI site generation
**Effort:** 4-6 hours
**Steps:**
1. Define vibe-catalog.ts (therapist, lawyer, home-service components)
2. Create JSON schema for each component
3. Build generator: JSON → Astro components
4. Test: Natural language → JSON → working site

**Result:** `vibe create "Oakland therapist, EMDR" → live site in 60 sec`

### Option 3: Build Fast 5 Engine (Ad → Contact → Book)
**Why:** Highest business value (85% conversion)
**Effort:** 1-2 weeks
**Steps:**
1. Webhook handler (Google Ads → Cloudflare Worker)
2. SMS cascade (Twilio integration)
3. AI qualification (conversation analysis)
4. HouseCall Pro booking
5. Analytics tracking

**Result:** Complete lead-to-booking automation

### Option 4: Build CLI Tool (Portfolio Management)
**Why:** Manage multiple client sites from terminal
**Effort:** 3-5 days
**Steps:**
1. Multi-site config (`~/.vibe/sites.json`)
2. Commands: create, edit, status, deploy
3. MCP integration (edit from Claude)
4. Template system (therapist, lawyer, etc.)

**Result:** `vibe edit megtherapy.com "change hours" → deployed`

---

## Key Files & Locations

### Vibe-Editor (Prototype)
```
/Users/deankeesey/Workspace/vibe-editor/
  src/
    components/
      MicroText.astro           # Wrapper component
      MicrotextEditor.tsx       # Inline editor
    pages/
      index.mdx                 # Example page
      api/
        microtext.ts            # Persistence API
        publish.ts              # Git commit API
  mcp-server/
    index.js                    # MCP server for Claude
```

### deankeesey.com (Migration Target)
```
/Users/deankeesey/Workspace/dk-sites/dk-portfolio/
  src/
    components/
      sections/
        HeroSection.tsx         # Needs migration
        EnterpriseExperienceTimeline.tsx
        SkillsMatrix.tsx
    pages/
      index.astro               # Convert to index.mdx
```

### Research Scripts
```
~/.claude/scripts/
  gemini-grounded-tracked.sh    # Gemini with usage tracking
  check-gemini-grounding.sh     # View usage stats
```

---

## Technical Decisions Made

### Stack Choices ✅
- **Framework:** Astro (already proven with dk-portfolio)
- **Styling:** Tailwind + shadcn/ui (copy/paste, not npm)
- **Hosting:** Cloudflare Pages (free tier, edge network)
- **Git:** GitHub (Actions for CI/CD)
- **SMS:** Twilio
- **Email:** SendGrid
- **Booking:** HouseCall Pro API

### Architecture Patterns ✅
- **Content:** Microtext in MDX frontmatter (YAML)
- **Components:** Copy/paste shadcn-style (own the code)
- **Editing:** Inline via React islands
- **Persistence:** API → Git → Deploy
- **AI Safety:** Component catalog (json-render pattern)

### Vertical Templates ✅
```
therapist:
  - HIPAA compliance notices
  - Insurance list component
  - Booking integration (SimplePractice)
  - Services grid (EMDR, Brainspotting, etc.)

lawyer:
  - Practice areas
  - Consultation booking
  - Case results
  - Professional credentials

home-service:
  - Service area map
  - Emergency callout notice
  - Pricing tiers
  - Before/after gallery
```

---

## Open Questions

1. **Should deankeesey.com be first migration?**
   - Pro: Real production site, validates approach
   - Pro: Dean can dogfood the product
   - Con: Takes time from building product features

2. **Which vertical to target first?**
   - Therapists: High margins, recurring revenue, known pain
   - Home services: Larger market, Fast 5 most valuable
   - Lawyers: High-value clients, urgency matters

3. **Pricing model?**
   - B2B2C: Charge developers $20/site, they charge clients $50-100
   - Direct: Charge clients $29-99/mo
   - Freemium: Free tier (3 sites), paid tiers scale

4. **How to handle client AI assistant auth?**
   - Scoped API keys per site?
   - Allowed domains whitelist?
   - JWT tokens with site_id claim?

---

## Next Session: Recommended Focus

### Quick Win: Migrate deankeesey.com (2-4 hours)
**Why this first:**
- Proves vibe-editor works on production site
- Dean can demo to clients ("I edit my site from Claude")
- Identifies edge cases with real content
- Creates screenshot-worthy demo

**Steps:**
1. Copy MicroText infrastructure from vibe-editor
2. Convert index.astro → index.mdx with microtext
3. Create HeroSectionVibe.tsx
4. Test inline editing
5. Deploy

**Success criteria:**
- Visit deankeesey.com?edit
- Click headline, edit text, save
- Changes persist to git
- Auto-deploys to production

### Then: Component Catalog Design (4-6 hours)
**After migration proves the pattern:**
1. Extract learnings from dk-portfolio migration
2. Design therapist component catalog
3. Build JSON → Astro generator
4. Test: "Oakland therapist" → working site

---

## Session Artifacts

### Created Files
- `/Users/deankeesey/.claude/scripts/gemini-grounded-tracked.sh` (usage tracking)
- `/Users/deankeesey/.claude/scripts/check-gemini-grounding.sh` (stats viewer)
- `/Users/deankeesey/.claude/data/gemini-grounding-usage.json` (tracking data)

### Modified Files
- None (research/planning session)

### Key URLs Referenced
- https://github.com/vercel-labs/json-render (json-render pattern)
- https://json-render.org/ (documentation)
- https://deankeesey.com/ (migration target)

---

## Resources & Documentation

### Bundles to Load When Needed
```bash
# Component patterns
cat ~/.claude/bundles/domains/frontend-dev/index.json

# WordPress patterns (for client migrations)
cat ~/.claude/bundles/domains/wordpress/index.json

# Testing strategy
cat ~/.claude/bundles/testing-strategy.md

# API direct access
cat ~/.claude/bundles/api-direct-access.md
```

### External Docs
- Astro: https://docs.astro.build
- Cloudflare Pages: https://developers.cloudflare.com/pages
- HouseCall Pro API: https://docs.housecallpro.com
- Twilio SMS: https://www.twilio.com/docs/sms

---

## The Vision (Where This Goes)

### Month 1: Proof of Concept
- Migrate deankeesey.com ✅
- Build component catalog (therapist vertical)
- Generate 1 test site from natural language
- Demo: "Oakland therapist" → live site in 60 sec

### Month 2: Fast 5 Integration
- Build ad webhook → SMS cascade
- Integrate HouseCall Pro
- Test with 1 home service client
- Prove: 85% conversion rate

### Month 3: Multi-Client CLI
- Manage 5-10 client sites from CLI
- Template library (3 verticals)
- Client AI assistants (self-service editing)
- Demo: Developer manages 10 clients effortlessly

### Month 6: Platform
- 50+ client sites
- Component marketplace
- White-label for agencies
- Revenue: $5K/mo at $100/client

---

## Critical Success Factors

1. **Keep it simple** - WebSearch > Gemini, Git > Database, Copy/paste > npm
2. **Start small** - Migrate 1 site before building CLI
3. **Prove value** - Fast 5 conversion rates speak louder than features
4. **Own the code** - Clients own repos, not locked into platform
5. **Real pain** - "Never miss a lead" > "Pretty website builder"

---

## End of Session Context

**Time:** 2026-01-18, late evening
**Status:** Research & planning complete, ready for implementation
**User:** Going to bed, forking session for continuation
**Recommendation:** Start with deankeesey.com migration (quick win, validates approach)
