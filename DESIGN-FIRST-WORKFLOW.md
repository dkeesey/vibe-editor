# Design-First Workflow with NanoBanana Pro 3

**The Pattern:** Microtext Structure → NanoBanana Design → shadcn Implementation → Editable Site

This workflow enables **AI-safe site generation** by constraining design outputs through component catalogs and semantic content structure.

## Why This Works

1. **Microtext provides semantic structure** - NanoBanana knows WHAT to design (hero, features, CTA)
2. **Vertical templates encode design knowledge** - Therapist ≠ Lawyer ≠ HVAC visual language
3. **Structured prompts prevent generic AI aesthetics** - Specific constraints = distinctive results
4. **shadcn components are copy/paste** - You own the code, can customize freely
5. **Vibe-editor makes it editable** - Client can update text, you can regenerate design if needed

## The Complete Workflow

### Step 1: Define Content Structure (Microtext)

Either start from a template or create custom microtext YAML:

```bash
# Use existing template
cp templates/therapist-emdr.yaml sites/oakland-therapy.yaml

# Or create custom structure
cat > sites/custom-site.yaml <<EOF
hero:
  headline: "Your Headline Here"
  subhead: "Supporting text"
  cta_primary: "Primary Action"

features:
  - title: "Feature 1"
    desc: "Description"
EOF
```

**Available templates:**
- `therapist-emdr.yaml` - Mental health practice
- `lawyer-personal-injury.yaml` - Law firm
- `home-service-hvac.yaml` - Home services
- (More coming: salon, art-foundation, etc.)

### Step 2: Generate Design Prompt

```bash
cd vibe-editor
npm run design therapist sites/oakland-therapy.yaml --mood calming --colors warm
```

**Output:**
1. **NanoBanana prompt** - Copy this to image generator
2. **Suggested components** - Which shadcn components to use
3. **Implementation hints** - Tailwind theme, layout pattern, accessibility notes

### Step 3: Generate Design with NanoBanana Pro 3

**In Antigravity IDE:**

```javascript
// Antigravity has native NanoBanana access
// Switch to NanoBanana Pro 3 model

// Paste the generated prompt
// NanoBanana creates visual mockup
```

**You get:**
- Full landing page design
- Color palette demonstration
- Typography hierarchy
- Component boundaries
- Mobile-responsive layouts

### Step 4: Implement with shadcn Components

**Use the suggested components list:**

```bash
# Install suggested components
npx shadcn@latest add card button badge typography

# Create component using design as reference
# microtext makes content editable
```

**Example implementation:**

```tsx
// src/components/sections/HeroSectionVibe.tsx
import { MicrotextReact } from '@/components/vibe/MicrotextReact';
import { Button } from '@/components/ui/button';

export function HeroSectionVibe({ microtext }) {
  return (
    <section className="bg-gradient-to-br from-sage-50 to-blue-50">
      {/* Design from NanoBanana, content from microtext */}
      <MicrotextReact
        id="hero.headline"
        as="h1"
        className="text-5xl font-bold text-sage-900"
        defaultValue={microtext.hero.headline}
      />

      <MicrotextReact
        id="hero.subhead"
        as="p"
        className="text-xl text-sage-700"
        defaultValue={microtext.hero.subhead}
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

### Step 5: Make It Editable

Convert to MDX with microtext frontmatter:

```mdx
---
layout: ../layouts/SiteLayout.astro
microtext:
  hero:
    headline: "Oakland EMDR Therapy"
    subhead: "Trauma healing with proven techniques"
    cta_primary: "Book Free Consultation"
  features:
    - title: "EMDR Certified"
      desc: "Trained in Eye Movement Desensitization"
---

import { HeroSectionVibe } from '../components/sections/HeroSectionVibe'
import { FeaturesGrid } from '../components/sections/FeaturesGrid'

<HeroSectionVibe client:load microtext={frontmatter.microtext} />
<FeaturesGrid client:visible microtext={frontmatter.microtext} />
```

Visit `localhost:4321?edit` → Click text → Edit inline → Saves to git

## Vertical-Specific Design Knowledge

The system encodes design best practices for each vertical:

### Therapist
- **Colors:** Sage green, soft blue, warm beige, muted purple
- **Mood:** Calming, trustworthy, professional without being clinical
- **Layout:** Generous whitespace, easy-to-read typography, clear CTAs
- **Avoid:** Aggressive CTAs, busy backgrounds, cold corporate feel

### Lawyer
- **Colors:** Navy blue, charcoal, gold accents, crisp white
- **Mood:** Authoritative, trustworthy, sophisticated
- **Layout:** Strong hierarchy, credentials prominent, case results visible
- **Avoid:** Playful elements, casual language, hidden credibility signals

### Home Service (HVAC, Plumbing, etc.)
- **Colors:** Tool orange, reliable blue, clean white, trust green
- **Mood:** Reliable, urgent-capable, local, no-nonsense
- **Layout:** Emergency contact prominent, service area map, before/after gallery
- **Avoid:** Overly corporate, hidden pricing, complex navigation

## Example: Oakland Therapist Site (End-to-End)

```bash
# 1. Generate design prompt
npm run design therapist templates/therapist-emdr.yaml --mood calming

# 2. Copy prompt to Antigravity + NanoBanana Pro 3
# (generates beautiful design mockup)

# 3. Implement with shadcn components
# (reference design, use microtext for content)

# 4. Deploy
git add .
git commit -m "Oakland therapy site - generated from microtext"
git push

# 5. Client can edit
# Visit oaklandtherapy.com?edit
# Click any text, edit inline, saves to git
```

**Result:** Professional, distinctive site in ~2 hours instead of 2 weeks.

## Why This Is Multiplicative

**Traditional approach:**
- Designer creates mockups (3-5 days)
- Developer implements (5-10 days)
- Content updates require developer (ongoing cost)
- Each site is custom work (doesn't scale)

**Design-first with vibe-editor:**
- Microtext structure defines content (15 min)
- NanoBanana generates design (5 min)
- Implement with shadcn components (2-4 hours)
- Client self-service editing (0 developer time)
- Templates reusable across sites (scales linearly)

**Multiplicative value:**
1. **Template library grows** - Each vertical template works for 100+ sites
2. **Design knowledge codified** - Best practices encoded in prompts
3. **Client independence** - Self-service editing via microtext
4. **Developer leverage** - Manage 50 sites with same tools

## Integration with Fast 5

Once site is live, add Fast 5 response system:

```yaml
# In microtext frontmatter
fast_5:
  chatbot_qualifier: true
  sms_cascade: true
  booking_integration: "housecall-pro"

  qualification_flow:
    - "What brings you in today?"
    - "Have you tried EMDR before?"
    - "Insurance or private pay?"

  trigger_score: 20  # Qualify before triggering Fast 5
```

**Complete system:**
- Beautiful site (NanoBanana design)
- Editable content (microtext)
- Lead qualification (AI chatbot)
- Fast 5 response (85% conversion)
- Client self-service (no developer needed)

## Next Steps

1. **Build component catalog** - Map microtext structures to shadcn components
2. **Add more verticals** - Salon, art foundation, real estate, etc.
3. **Automate implementation** - JSON → Astro components (json-render pattern)
4. **CLI tool** - `vibe create therapist "Oakland EMDR"` → full site

**The vision:** Natural language → Working site in 60 seconds.

---

**This workflow proves:** Structured content + constrained design vocabulary = AI-safe, distinctive sites at scale.
