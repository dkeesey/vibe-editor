#!/usr/bin/env tsx
/**
 * Design-First Workflow CLI
 *
 * Usage:
 *   npm run design therapist oakland-emdr.yaml
 *   npm run design lawyer johnson-law.yaml --mood professional --colors cool
 */

import { generateDesignPrompt, type DesignContext, type Vertical } from '../src/lib/design-prompt-generator';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: npm run design <vertical> <microtext-file.yaml> [options]

Verticals: therapist, lawyer, home-service, art-foundation, salon

Options:
  --mood <calming|professional|energetic|elegant|playful>
  --colors <warm|cool|neutral|vibrant>
  --layout <minimal|rich|balanced>

Example:
  npm run design therapist examples/oakland-emdr.yaml --mood calming --colors warm

Output:
  - NanoBanana prompt (copy to image generator)
  - Suggested shadcn components
  - Implementation hints (Tailwind theme, layout pattern)
  `);
  process.exit(1);
}

const vertical = args[0] as Vertical;
const microtextFile = args[1];

// Parse options
const options = {
  mood: args.includes('--mood') ? args[args.indexOf('--mood') + 1] as any : undefined,
  colorScheme: args.includes('--colors') ? args[args.indexOf('--colors') + 1] as any : undefined,
  layout: args.includes('--layout') ? args[args.indexOf('--layout') + 1] as any : undefined
};

// Load microtext
const microtextPath = path.resolve(microtextFile);
if (!fs.existsSync(microtextPath)) {
  console.error(`Error: File not found: ${microtextPath}`);
  process.exit(1);
}

const microtextContent = fs.readFileSync(microtextPath, 'utf-8');
const microtext = yaml.parse(microtextContent);

// Generate design prompt
const context: DesignContext = {
  vertical,
  microtext,
  preferences: options.mood || options.colorScheme || options.layout ? {
    mood: options.mood,
    colorScheme: options.colorScheme,
    layout: options.layout
  } : undefined
};

const result = generateDesignPrompt(context);

// Output results
console.log('\n' + '='.repeat(80));
console.log('NANOBANANA PRO 3 DESIGN PROMPT');
console.log('='.repeat(80) + '\n');
console.log(result.nanoBananaPrompt);
console.log('\n' + '='.repeat(80));
console.log('IMPLEMENTATION GUIDE');
console.log('='.repeat(80) + '\n');

console.log('📦 SUGGESTED SHADCN COMPONENTS:');
result.suggestedComponents.forEach(comp => console.log(`  - ${comp}`));

console.log('\n🎨 TAILWIND THEME COLORS:');
console.log('  Add to tailwind.config.js:');
console.log('  theme: {');
console.log('    extend: {');
console.log('      colors: {');
Object.entries(result.implementationHints.tailwindTheme).forEach(([key, value]) => {
  console.log(`        '${key}': /* ${value} */,`);
});
console.log('      }');
console.log('    }');
console.log('  }');

console.log('\n📐 LAYOUT PATTERN:');
console.log(`  ${result.implementationHints.layoutPattern}`);

console.log('\n♿ ACCESSIBILITY CHECKLIST:');
result.implementationHints.accessibilityNotes.forEach(note => {
  console.log(`  [ ] ${note}`);
});

console.log('\n' + '='.repeat(80));
console.log('NEXT STEPS:');
console.log('='.repeat(80));
console.log('1. Copy NanoBanana prompt above');
console.log('2. Generate design in NanoBanana Pro 3');
console.log('3. Implement using suggested shadcn components');
console.log('4. Apply Tailwind theme colors');
console.log('5. Test accessibility checklist');
console.log('6. Make content editable via microtext');
console.log('');
