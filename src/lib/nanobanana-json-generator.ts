/**
 * NanoBanana Pro 3 JSON Generator
 *
 * Generates structured JSON prompts for Antigravity's get-image tool
 * Supports micro-shift style variations for A/B testing
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
  microShift?: {
    colorVariations?: number;  // Generate N color palette variations
    layoutVariations?: number; // Generate N layout variations
    typographyVariations?: number; // Generate N typography variations
  };
}

export interface NanoBananaJSON {
  prompt: {
    description: string;
    style: {
      mood: string[];
      colors: string[];
      typography: string[];
      layout: string;
    };
    structure: {
      sections: string[];
      hierarchy: string[];
      spacing: string;
    };
    constraints: {
      platform: string;
      responsive: boolean;
      accessibility: string[];
      avoid: string[];
    };
  };
  microShift?: {
    type: 'color' | 'layout' | 'typography';
    variations: any[];
  };
  metadata: {
    vertical: string;
    complexity: string;
    components: string[];
  };
}

// Vertical-specific design vocabularies
const VERTICAL_STYLES: Record<Vertical, {
  colors: string[];
  colorHex: string[];
  mood: string[];
  typography: string[];
  layoutPriorities: string[];
  avoidPatterns: string[];
}> = {
  therapist: {
    colors: ['sage green', 'soft blue', 'warm beige', 'muted purple'],
    colorHex: ['#8B9D83', '#A8C5DD', '#E8D5C4', '#B8A4C9'],
    mood: ['calming', 'trustworthy', 'professional', 'warm', 'accessible'],
    typography: ['readable serif for body', 'clean sans for headings', 'generous line height', 'comfortable size'],
    layoutPriorities: ['generous whitespace', 'easy-to-read typography', 'clear CTAs', 'credentials visibility'],
    avoidPatterns: ['aggressive CTAs', 'busy backgrounds', 'cold corporate feel', 'stock photo clichés']
  },
  lawyer: {
    colors: ['navy blue', 'charcoal', 'gold accent', 'crisp white'],
    colorHex: ['#1E3A5F', '#2C2C2C', '#D4AF37', '#FFFFFF'],
    mood: ['authoritative', 'trustworthy', 'sophisticated', 'serious', 'established'],
    typography: ['strong serif headings', 'professional sans body', 'clear hierarchy', 'bold CTAs'],
    layoutPriorities: ['strong hierarchy', 'credentials prominent', 'case results', 'consultation CTA'],
    avoidPatterns: ['playful elements', 'rounded corners everywhere', 'casual language', 'cutesy icons']
  },
  'home-service': {
    colors: ['tool orange', 'reliable blue', 'clean white', 'trust green'],
    colorHex: ['#FF6B35', '#1E88E5', '#FFFFFF', '#4CAF50'],
    mood: ['reliable', 'urgent-capable', 'local', 'no-nonsense', 'friendly'],
    typography: ['bold sans headings', 'readable body', 'large phone numbers', 'clear pricing'],
    layoutPriorities: ['emergency contact prominent', 'service area map', 'before/after gallery', 'instant booking'],
    avoidPatterns: ['overly corporate', 'slow-loading images', 'hidden pricing', 'complex navigation']
  },
  'art-foundation': {
    colors: ['gallery white', 'artwork accent', 'sophisticated gray', 'subtle gold'],
    colorHex: ['#F8F8F8', '#C41E3A', '#4A4A4A', '#B8976D'],
    mood: ['elegant', 'scholarly', 'accessible', 'refined', 'inspiring'],
    typography: ['elegant serif', 'museum-quality typography', 'generous margins', 'subtle hierarchy'],
    layoutPriorities: ['artwork showcase', 'donor recognition', 'exhibition calendar', 'research access'],
    avoidPatterns: ['busy layouts competing with art', 'generic museum aesthetics', 'difficult navigation']
  },
  salon: {
    colors: ['chic black', 'rose gold', 'blush pink', 'clean white'],
    colorHex: ['#000000', '#B76E79', '#FFD1DC', '#FFFFFF'],
    mood: ['stylish', 'welcoming', 'aspirational', 'modern', 'chic'],
    typography: ['elegant sans', 'stylish headings', 'clean body', 'sophisticated hierarchy'],
    layoutPriorities: ['portfolio/gallery', 'booking CTA', 'stylist bios', 'pricing transparency'],
    avoidPatterns: ['outdated beauty trends', 'stock salon photos', 'hard-to-read text on images']
  },
  general: {
    colors: ['brand primary', 'brand secondary', 'neutral', 'accent'],
    colorHex: ['#0066CC', '#00CC66', '#333333', '#FF6600'],
    mood: ['professional', 'modern', 'accessible', 'clean'],
    typography: ['modern sans', 'readable body', 'clear hierarchy'],
    layoutPriorities: ['clear value prop', 'trust signals', 'responsive design'],
    avoidPatterns: ['generic templates', 'unreadable fonts', 'missing CTAs']
  }
};

// Generate micro-shift variations
function generateMicroShiftVariations(
  vertical: Vertical,
  type: 'color' | 'layout' | 'typography',
  count: number
): any[] {
  const verticalStyle = VERTICAL_STYLES[vertical];
  const variations: any[] = [];

  switch (type) {
    case 'color':
      // Generate color palette variations
      for (let i = 0; i < count; i++) {
        variations.push({
          id: `color-v${i + 1}`,
          palette: {
            primary: verticalStyle.colorHex[0],
            secondary: verticalStyle.colorHex[1],
            accent: verticalStyle.colorHex[(i + 2) % verticalStyle.colorHex.length],
            neutral: verticalStyle.colorHex[(i + 3) % verticalStyle.colorHex.length]
          },
          description: `Color variation ${i + 1}: ${verticalStyle.colors[0]} dominant`
        });
      }
      break;

    case 'layout':
      // Generate layout variations
      const layouts = ['F-pattern (traditional)', 'Z-pattern (dynamic)', 'grid-based (modern)', 'asymmetric (creative)'];
      for (let i = 0; i < Math.min(count, layouts.length); i++) {
        variations.push({
          id: `layout-v${i + 1}`,
          pattern: layouts[i],
          spacing: i % 2 === 0 ? 'generous' : 'compact',
          description: `Layout variation ${i + 1}: ${layouts[i]}`
        });
      }
      break;

    case 'typography':
      // Generate typography variations
      const typePairings = [
        { heading: 'serif', body: 'sans-serif' },
        { heading: 'sans-serif', body: 'sans-serif' },
        { heading: 'display', body: 'serif' },
        { heading: 'modern sans', body: 'geometric sans' }
      ];
      for (let i = 0; i < Math.min(count, typePairings.length); i++) {
        variations.push({
          id: `type-v${i + 1}`,
          pairing: typePairings[i],
          scale: i % 2 === 0 ? 'generous (1.25)' : 'tight (1.125)',
          description: `Typography variation ${i + 1}: ${typePairings[i].heading} headings`
        });
      }
      break;
  }

  return variations;
}

// Analyze microtext structure
function analyzeMicrotextStructure(microtext: Record<string, any>): {
  sections: string[];
  hierarchy: string[];
  complexity: 'simple' | 'medium' | 'complex';
} {
  const sections: string[] = [];
  const hierarchy: string[] = [];
  let totalElements = 0;

  for (const [key, value] of Object.entries(microtext)) {
    if (key.includes('hero')) {
      sections.push('hero');
      hierarchy.push('hero (primary)');
    }
    if (key.includes('feature')) {
      sections.push('features');
      hierarchy.push('features (secondary)');
    }
    if (key.includes('testimonial')) {
      sections.push('testimonials');
      hierarchy.push('testimonials (social proof)');
    }
    if (key.includes('cta')) hierarchy.push('CTA (action)');
    if (key.includes('about')) {
      sections.push('about');
      hierarchy.push('about (credibility)');
    }
    if (key.includes('service')) {
      sections.push('services');
      hierarchy.push('services (offerings)');
    }
    if (key.includes('pricing')) {
      sections.push('pricing');
      hierarchy.push('pricing (conversion)');
    }
    if (key.includes('contact')) {
      sections.push('contact');
      hierarchy.push('contact (action)');
    }

    if (Array.isArray(value)) totalElements += value.length;
    if (typeof value === 'object' && value !== null) totalElements += Object.keys(value).length;
  }

  const uniqueSections = [...new Set(sections)];
  const complexity = totalElements < 5 ? 'simple' : totalElements < 12 ? 'medium' : 'complex';

  return { sections: uniqueSections, hierarchy: [...new Set(hierarchy)], complexity };
}

// Suggest components
function suggestComponents(sections: string[]): string[] {
  const componentMap: Record<string, string[]> = {
    hero: ['Card with backdrop blur', 'Typography (h1, p)', 'Button'],
    features: ['Card grid', 'Icon components', 'Badge'],
    testimonials: ['Card with Avatar', 'Blockquote styling'],
    services: ['Accordion', 'Tabs', 'Card grid'],
    pricing: ['Card with variant styling', 'Badge', 'Button'],
    contact: ['Form components', 'Input', 'Textarea', 'Button']
  };

  const components = new Set<string>();
  sections.forEach(section => {
    componentMap[section]?.forEach(comp => components.add(comp));
  });

  return [...components];
}

// Generate NanoBanana JSON prompt
export function generateNanoBananaJSON(context: DesignContext): NanoBananaJSON {
  const vertical = VERTICAL_STYLES[context.vertical];
  const structure = analyzeMicrotextStructure(context.microtext);
  const colorScheme = context.preferences?.colorScheme || 'neutral';
  const mood = context.preferences?.mood || vertical.mood[0];
  const layout = context.preferences?.layout || 'balanced';

  const json: NanoBananaJSON = {
    prompt: {
      description: `Modern ${mood} landing page design for ${context.vertical} website with ${structure.complexity} complexity`,
      style: {
        mood: vertical.mood,
        colors: vertical.colors,
        typography: vertical.typography,
        layout: `${layout} layout with ${structure.complexity} complexity`
      },
      structure: {
        sections: structure.sections,
        hierarchy: structure.hierarchy,
        spacing: structure.complexity === 'simple' ? 'generous' : structure.complexity === 'medium' ? 'balanced' : 'varied'
      },
      constraints: {
        platform: 'web (Tailwind CSS + shadcn/ui)',
        responsive: true,
        accessibility: [
          'WCAG AA minimum contrast (4.5:1)',
          'Semantic HTML structure',
          'Clear visual hierarchy',
          'Touch-friendly buttons (44px minimum)',
          'Readable typography (16px base minimum)'
        ],
        avoid: vertical.avoidPatterns
      }
    },
    metadata: {
      vertical: context.vertical,
      complexity: structure.complexity,
      components: suggestComponents(structure.sections)
    }
  };

  // Add micro-shift variations if requested
  if (context.microShift) {
    if (context.microShift.colorVariations) {
      json.microShift = {
        type: 'color',
        variations: generateMicroShiftVariations(context.vertical, 'color', context.microShift.colorVariations)
      };
    } else if (context.microShift.layoutVariations) {
      json.microShift = {
        type: 'layout',
        variations: generateMicroShiftVariations(context.vertical, 'layout', context.microShift.layoutVariations)
      };
    } else if (context.microShift.typographyVariations) {
      json.microShift = {
        type: 'typography',
        variations: generateMicroShiftVariations(context.vertical, 'typography', context.microShift.typographyVariations)
      };
    }
  }

  return json;
}

// Format for Antigravity get-image tool
export interface AntigravityImageRequest {
  prompt: string; // Stringified JSON for NanoBanana
  model: 'nanobanana-pro-3';
  format: 'png' | 'jpg';
  size?: {
    width: number;
    height: number;
  };
}

export function formatForAntigravity(json: NanoBananaJSON, format: 'png' | 'jpg' = 'png'): AntigravityImageRequest {
  return {
    prompt: JSON.stringify(json, null, 2),
    model: 'nanobanana-pro-3',
    format,
    size: {
      width: 1920,  // Desktop mockup
      height: 3840  // Long landing page
    }
  };
}

// Example usage:
// const context: DesignContext = {
//   vertical: 'therapist',
//   microtext: { /* ... */ },
//   preferences: { mood: 'calming', colorScheme: 'warm' },
//   microShift: { colorVariations: 3 }  // Generate 3 color variations
// };
//
// const json = generateNanoBananaJSON(context);
// const agRequest = formatForAntigravity(json);
//
// In Antigravity:
// await get_image(agRequest.prompt, { model: 'nanobanana-pro-3', format: 'png' });
