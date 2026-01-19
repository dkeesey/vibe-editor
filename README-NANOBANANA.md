# NanoBanana Design-First Workflow

**Generate professional, distinctive websites from microtext structure in 2-4 hours instead of 2 weeks.**

## The Complete System

```
Microtext YAML → NanoBanana JSON → AG get-image → shadcn Implementation → Editable Site
```

### What You Get

1. **Structured Prompt Generator** - Encodes vertical-specific design knowledge
2. **Micro-Shift Variations** - A/B test color/layout/typography automatically
3. **CC ↔ AG Coordination** - Efficient quota usage via delegation
4. **Vertical Templates** - Therapist, lawyer, HVAC (more coming)
5. **Component Mapping** - Which shadcn components to use

## Quick Start

### 1. Define Content (Microtext)

```yaml
# templates/therapist-emdr.yaml
hero:
  headline: "Oakland EMDR Therapy"
  subhead: "Trauma healing with proven techniques"
  cta_primary: "Book Free Consultation"

features:
  - title: "EMDR Certified"
    desc: "Trained in trauma processing"
  - title: "Insurance Accepted"
    desc: "Blue Shield, Aetna, United"
```

### 2. Generate Design (Claude Code)

```bash
cd vibe-editor

# Basic design
npm run design:json therapist templates/therapist-emdr.yaml

# With 3 color variations (micro-shift)
npm run design:json therapist templates/therapist-emdr.yaml --micro-shift color:3

# With preferences
npm run design:json therapist templates/therapist-emdr.yaml \
  --mood calming \
  --colors warm \
  --micro-shift color:3
```

**Output:**
```
✅ TASK QUEUED FOR ANTIGRAVITY
Task ID: 42
Type: generate-design
Vertical: therapist
Micro-shift: 3 color variations

NEXT STEPS:
1. Switch to Antigravity IDE
2. Tell AG: "check queue"
3. AG will generate designs with NanoBanana Pro 3
```

### 3. Process Queue (Antigravity)

In Antigravity IDE:
```
User: "check queue"

AG runs the queue processor, calls get-image for each task
```

**AG generates:**
- Base design mockup (1920x3840 landing page)
- 3 color variations (micro-shift)
- Saves to `output/designs/`

### 4. Implement Design (Claude Code)

```tsx
// src/components/sections/HeroSectionVibe.tsx
import { MicrotextReact } from '@/components/vibe/MicrotextReact';
import { Button } from '@/components/ui/button';

export function HeroSectionVibe({ microtext }) {
  return (
    <section className="bg-gradient-to-br from-sage-50 to-blue-50 py-24">
      <MicrotextReact
        id="hero.headline"
        as="h1"
        className="text-5xl font-bold text-sage-900"
        defaultValue={microtext.hero.headline}
      />

      <Button>
        <MicrotextReact
          id="hero.cta_primary"
          defaultValue={microtext.hero.cta_primary}
        />
      </Button>
    </section>
  );
}
```

### 5. Make Editable

```mdx
---
layout: ../layouts/SiteLayout.astro
microtext:
  hero:
    headline: "Oakland EMDR Therapy"
    subhead: "Trauma healing with proven techniques"
    cta_primary: "Book Free Consultation"
---

import { HeroSectionVibe } from '../components/sections/HeroSectionVibe'

<HeroSectionVibe client:load microtext={frontmatter.microtext} />
```

Visit `localhost:4321?edit` → Click text → Edit inline

## Available Templates

- **Therapist** (`templates/therapist-emdr.yaml`)
  - EMDR specialist, mental health practice
  - Calming colors, generous whitespace
  - Credentials, insurance, booking focus

- **Lawyer** (`templates/lawyer-personal-injury.yaml`)
  - Personal injury attorney
  - Authoritative design, case results
  - Free consultation, credentials prominent

- **Home Service** (`templates/home-service-hvac.yaml`)
  - HVAC company
  - Emergency service, service area map
  - Transparent pricing, same-day CTA

## Micro-Shift Variations

Generate A/B test variations automatically:

### Color Variations
```bash
--micro-shift color:3
```
- Variation 1: Primary color dominant
- Variation 2: Secondary color dominant
- Variation 3: Accent color dominant

### Layout Variations
```bash
--micro-shift layout:4
```
- F-pattern (traditional)
- Z-pattern (dynamic)
- Grid-based (modern)
- Asymmetric (creative)

### Typography Variations
```bash
--micro-shift type:2
```
- Serif headings + Sans body
- Modern sans + Geometric sans

## Vertical-Specific Design Knowledge

The system encodes proven design patterns for each vertical:

### Therapist
- **Colors:** Sage green, soft blue, warm beige, muted purple
- **Mood:** Calming, trustworthy, professional without clinical
- **Avoid:** Aggressive CTAs, busy backgrounds, cold corporate feel

### Lawyer
- **Colors:** Navy blue, charcoal, gold accents
- **Mood:** Authoritative, sophisticated, established
- **Avoid:** Playful elements, casual language, hidden credentials

### Home Service
- **Colors:** Tool orange, reliable blue, trust green
- **Mood:** Reliable, urgent-capable, local, no-nonsense
- **Avoid:** Corporate feel, hidden pricing, complex navigation

## How Coordination Works

```
Claude Code (CC)                    Antigravity (AG)
     │                                    │
     │ 1. Generate NanoBanana JSON        │
     │ 2. Write to coordination.db        │
     │    (type: generate-design)         │
     │    (assigned_to: antigravity)      │
     ├────────────────────────────────────>
     │                                    │
     │                              3. User: "check queue"
     │                              4. Query coordination.db
     │                              5. Process tasks
     │                              6. Call get-image (NanoBanana)
     │                              7. Generate variations
     │                              8. Save to output/
     │                              9. Update task status
     │                                    │
     │<────────────────────────────────────
     │ 10. Review designs                 │
     │ 11. Implement with shadcn          │
```

## Why This Is Multiplicative

**Traditional Workflow:**
- Designer: 3-5 days for mockups
- Developer: 5-10 days implementation
- Content updates: Ongoing developer time
- **Each site = custom work (doesn't scale)**

**Design-First with Vibe-Editor:**
- Microtext: 15 minutes
- NanoBanana: 5 minutes (automated)
- Implementation: 2-4 hours
- Content updates: Client self-service
- **Templates reusable across 100+ sites**

**Multiplicative Effects:**
1. Template library grows (each vertical → 100+ sites)
2. Design knowledge codified (consistent quality)
3. Client independence (self-service editing)
4. Developer leverage (manage 50 sites, same tools)

## Integration with Fast 5

Once site is live, add Fast 5 response:

```yaml
# In microtext frontmatter
fast_5:
  chatbot_qualifier: true
  sms_cascade: true
  booking_integration: "housecall-pro"
  trigger_score: 20  # Qualify before triggering
```

**Complete System:**
- Beautiful site (NanoBanana design)
- Editable content (microtext)
- Lead qualification (AI chatbot)
- Fast 5 response (85% conversion)
- Client self-service (no developer)

## Files Created

```
vibe-editor/
├── src/lib/
│   ├── design-prompt-generator.ts      # Text prompt generator
│   └── nanobanana-json-generator.ts    # JSON + micro-shift
├── scripts/
│   ├── generate-design.ts              # CLI for text prompts
│   └── generate-design-json.ts         # CLI for JSON + queue
├── templates/
│   ├── therapist-emdr.yaml
│   ├── lawyer-personal-injury.yaml
│   └── home-service-hvac.yaml
├── DESIGN-FIRST-WORKFLOW.md           # End-to-end workflow
├── ANTIGRAVITY-INTEGRATION.md         # AG queue processing
└── README-NANOBANANA.md               # This file
```

## Next Steps

1. **Test workflow** - Generate designs for each template
2. **Add verticals** - Salon, real estate, restaurant, etc.
3. **Build component catalog** - Automate shadcn component selection
4. **CLI tool** - `vibe create therapist "Oakland EMDR"` → full site

## Vision

**Natural language → Working site in 60 seconds**

The system already has all the pieces:
- Microtext structure (semantic content)
- NanoBanana JSON (design generation)
- Component catalog (implementation)
- Vibe-editor (client editing)
- Fast 5 (lead conversion)

**Final step:** Automate the implementation (JSON → Astro components, json-render pattern)

---

**Built with:** Claude Code (orchestration) + Antigravity (image generation) + NanoBanana Pro 3 (design)
