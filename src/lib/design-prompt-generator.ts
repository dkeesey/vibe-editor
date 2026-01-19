/**
 * NanoBanana Design Prompt Generator
 *
 * Takes microtext structure + vertical context → generates optimized design prompt
 * Bridges semantic content structure to visual design direction
 */

export type Vertical = 'therapist' | 'lawyer' | 'home-service' | 'art-foundation' | 'salon' | 'general';

export interface DesignContext {
  vertical: Vertical;
  microtext: Record<string, any>;
  preferences?: {
    colorScheme?: 'warm' | 'cool' | 'neutral' | 'vibrant';
    mood?: 'calming' | 'professional' | 'energetic' | 'elegant' | 'playful';
    layout?: 'minimal' | 'rich' | 'balanced';
  };
}

export interface DesignPromptOutput {
  nanoBananaPrompt: string;
  suggestedComponents: string[];
  implementationHints: {
    tailwindTheme: Record<string, string>;
    layoutPattern: string;
    accessibilityNotes: string[];
  };
}

// Vertical-specific design vocabularies
const VERTICAL_STYLES: Record<Vertical, {
  colors: string[];
  mood: string;
  layoutPriorities: string[];
  avoidPatterns: string[];
}> = {
  therapist: {
    colors: ['sage green', 'soft blue', 'warm beige', 'muted purple'],
    mood: 'calming, trustworthy, professional without being clinical',
    layoutPriorities: ['generous whitespace', 'easy-to-read typography', 'clear CTAs', 'credentials visibility'],
    avoidPatterns: ['aggressive CTAs', 'busy backgrounds', 'cold corporate feel', 'stock photo clichés']
  },
  lawyer: {
    colors: ['navy blue', 'charcoal', 'gold accents', 'crisp white'],
    mood: 'authoritative, trustworthy, sophisticated',
    layoutPriorities: ['strong hierarchy', 'credentials prominent', 'case results', 'consultation CTA'],
    avoidPatterns: ['playful elements', 'rounded corners everywhere', 'casual language', 'cutesy icons']
  },
  'home-service': {
    colors: ['tool orange', 'reliable blue', 'clean white', 'trust green'],
    mood: 'reliable, urgent-capable, local, no-nonsense',
    layoutPriorities: ['emergency contact prominent', 'service area map', 'before/after gallery', 'instant booking'],
    avoidPatterns: ['overly corporate', 'slow-loading images', 'hidden pricing', 'complex navigation']
  },
  'art-foundation': {
    colors: ['gallery white', 'accent from featured artwork', 'sophisticated neutrals'],
    mood: 'elegant, scholarly, accessible',
    layoutPriorities: ['artwork showcase', 'donor recognition', 'exhibition calendar', 'research access'],
    avoidPatterns: ['busy layouts competing with art', 'generic museum aesthetics', 'difficult navigation']
  },
  salon: {
    colors: ['chic black', 'rose gold', 'blush pink', 'clean white'],
    mood: 'stylish, welcoming, aspirational',
    layoutPriorities: ['portfolio/gallery', 'booking CTA', 'stylist bios', 'pricing transparency'],
    avoidPatterns: ['outdated beauty trends', 'stock salon photos', 'hard-to-read text on images']
  },
  general: {
    colors: ['brand-appropriate palette'],
    mood: 'professional, modern, accessible',
    layoutPriorities: ['clear value prop', 'trust signals', 'responsive design'],
    avoidPatterns: ['generic templates', 'unreadable fonts', 'missing CTAs']
  }
};

// Map microtext structure to layout sections
function analyzeMicrotextStructure(microtext: Record<string, any>): {
  sections: string[];
  complexity: 'simple' | 'medium' | 'complex';
} {
  const sections: string[] = [];
  let totalElements = 0;

  for (const [key, value] of Object.entries(microtext)) {
    if (key.includes('hero')) sections.push('hero');
    if (key.includes('feature')) sections.push('features');
    if (key.includes('testimonial')) sections.push('testimonials');
    if (key.includes('cta')) sections.push('cta');
    if (key.includes('about')) sections.push('about');
    if (key.includes('service')) sections.push('services');
    if (key.includes('pricing')) sections.push('pricing');
    if (key.includes('contact')) sections.push('contact');
    if (key.includes('gallery')) sections.push('gallery');

    if (Array.isArray(value)) totalElements += value.length;
    if (typeof value === 'object' && value !== null) totalElements += Object.keys(value).length;
  }

  const uniqueSections = [...new Set(sections)];
  const complexity = totalElements < 5 ? 'simple' : totalElements < 12 ? 'medium' : 'complex';

  return { sections: uniqueSections, complexity };
}

// Generate shadcn component recommendations
function suggestComponents(sections: string[]): string[] {
  const componentMap: Record<string, string[]> = {
    hero: ['Card with backdrop blur', 'Typography (h1, p)', 'Button'],
    features: ['Card grid', 'Icon components', 'Badge'],
    testimonials: ['Card with Avatar', 'Blockquote styling'],
    cta: ['Button', 'Card with background'],
    services: ['Accordion', 'Tabs', 'Card grid'],
    pricing: ['Card with variant styling', 'Badge', 'Button'],
    contact: ['Form components', 'Input', 'Textarea', 'Button'],
    gallery: ['Carousel', 'Dialog for lightbox', 'Aspect ratio wrapper']
  };

  const components = new Set<string>();
  sections.forEach(section => {
    componentMap[section]?.forEach(comp => components.add(comp));
  });

  return [...components];
}

// Generate NanoBanana prompt
export function generateDesignPrompt(context: DesignContext): DesignPromptOutput {
  const vertical = VERTICAL_STYLES[context.vertical];
  const structure = analyzeMicrotextStructure(context.microtext);
  const colorScheme = context.preferences?.colorScheme || 'neutral';
  const mood = context.preferences?.mood || vertical.mood;
  const layout = context.preferences?.layout || 'balanced';

  // Build the NanoBanana prompt
  const prompt = `Create a modern, ${mood} landing page design for a ${context.vertical} website.

LAYOUT STRUCTURE:
${structure.sections.map(s => `- ${s.charAt(0).toUpperCase() + s.slice(1)} section`).join('\n')}

VISUAL DIRECTION:
- Color palette: ${vertical.colors.join(', ')} (${colorScheme} scheme)
- Mood: ${mood}
- Layout style: ${layout} (${structure.complexity} complexity)
- Design priorities: ${vertical.layoutPriorities.join(', ')}

DESIGN REQUIREMENTS:
- Mobile-first responsive design
- Clear visual hierarchy (F-pattern reading flow)
- Generous whitespace (breathing room between sections)
- Accessible color contrast (WCAG AA minimum)
- Modern typography (readable at all sizes)
- Clear call-to-action buttons (not aggressive)
- Professional without being generic

AVOID:
${vertical.avoidPatterns.map(p => `- ${p}`).join('\n')}

TECHNICAL CONSTRAINTS:
- Implement with Tailwind CSS utility classes
- Use shadcn/ui component vocabulary
- Optimize for fast loading (minimal imagery weight)
- Support dark mode consideration

OUTPUT FORMAT:
Full landing page mockup showing:
1. Hero section with headline hierarchy
2. ${structure.sections.filter(s => s !== 'hero').join(', ')}
3. Clear spacing and component boundaries
4. Color palette demonstration
5. Typography scale in use`;

  // Generate implementation hints
  const tailwindColors = vertical.colors.reduce((acc, color, i) => {
    const key = color.split(' ').map((w, j) => j === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
    acc[`brand-${i + 1}`] = key;
    return acc;
  }, {} as Record<string, string>);

  const layoutPatterns: Record<string, string> = {
    simple: 'Single column with centered content, max-width container',
    medium: 'Grid layout with sidebar, feature cards in 3-column grid',
    complex: 'Multi-section with varied layouts, use of Tabs/Accordion for organization'
  };

  const accessibilityNotes = [
    'Ensure 4.5:1 contrast ratio for body text',
    'Use semantic HTML (nav, main, section, article)',
    'Add ARIA labels to icon-only buttons',
    'Test keyboard navigation flow',
    vertical.layoutPriorities.includes('credentials') ? 'Make credentials easily scannable (not buried)' : '',
    vertical.layoutPriorities.includes('emergency contact') ? 'Emergency contact must be thumb-reachable on mobile' : ''
  ].filter(Boolean);

  return {
    nanoBananaPrompt: prompt,
    suggestedComponents: suggestComponents(structure.sections),
    implementationHints: {
      tailwindTheme: tailwindColors,
      layoutPattern: layoutPatterns[structure.complexity],
      accessibilityNotes
    }
  };
}

// Example usage:
// const context: DesignContext = {
//   vertical: 'therapist',
//   microtext: {
//     hero: {
//       headline: 'Oakland EMDR Therapy',
//       subhead: 'Trauma healing with proven techniques',
//       cta: 'Book Free Consultation'
//     },
//     features: [
//       { title: 'EMDR Certified', desc: 'Trained in Eye Movement Desensitization' },
//       { title: 'Insurance Accepted', desc: 'Blue Shield, Aetna, United' },
//       { title: 'Evening Hours', desc: 'Available until 8pm' }
//     ]
//   },
//   preferences: {
//     colorScheme: 'warm',
//     mood: 'calming'
//   }
// };
//
// const result = generateDesignPrompt(context);
// console.log(result.nanoBananaPrompt); // Send to NanoBanana Pro 3
// console.log(result.suggestedComponents); // Use these shadcn components
// console.log(result.implementationHints); // Guide implementation
