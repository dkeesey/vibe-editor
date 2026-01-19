#!/usr/bin/env tsx
/**
 * NanoBanana JSON Design Generator with AG Delegation
 *
 * Usage:
 *   npm run design:json therapist oakland-emdr.yaml --colors warm --micro-shift color:3
 *   npm run design:json lawyer johnson-law.yaml --mood professional
 */

import { generateNanoBananaJSON, formatForAntigravity, type DesignContext, type Vertical } from '../src/lib/nanobanana-json-generator';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: npm run design:json <vertical> <microtext-file.yaml> [options]

Verticals: therapist, lawyer, home-service, art-foundation, salon

Options:
  --mood <calming|professional|energetic|elegant|playful>
  --colors <warm|cool|neutral|vibrant>
  --layout <minimal|rich|balanced>
  --micro-shift <type:count>
    Examples:
      --micro-shift color:3     (3 color palette variations)
      --micro-shift layout:4    (4 layout variations)
      --micro-shift type:2      (2 typography variations)

Example:
  npm run design:json therapist templates/therapist-emdr.yaml --mood calming --micro-shift color:3

Output:
  - NanoBanana JSON prompt (written to coordination.db)
  - Task queued for Antigravity
  - Tell AG: "check queue"
  `);
  process.exit(1);
}

const vertical = args[0] as Vertical;
const microtextFile = args[1];

// Parse options
const options = {
  mood: args.includes('--mood') ? args[args.indexOf('--mood') + 1] as any : undefined,
  colorScheme: args.includes('--colors') ? args[args.indexOf('--colors') + 1] as any : undefined,
  layout: args.includes('--layout') ? args[args.indexOf('--layout') + 1] as any : undefined,
  microShift: args.includes('--micro-shift') ? args[args.indexOf('--micro-shift') + 1] : undefined
};

// Parse micro-shift parameter
let microShift: any = undefined;
if (options.microShift) {
  const [type, count] = options.microShift.split(':');
  if (type === 'color') {
    microShift = { colorVariations: parseInt(count) };
  } else if (type === 'layout') {
    microShift = { layoutVariations: parseInt(count) };
  } else if (type === 'type') {
    microShift = { typographyVariations: parseInt(count) };
  }
}

// Load microtext
const microtextPath = path.resolve(microtextFile);
if (!fs.existsSync(microtextPath)) {
  console.error(`Error: File not found: ${microtextPath}`);
  process.exit(1);
}

const microtextContent = fs.readFileSync(microtextPath, 'utf-8');
const microtext = yaml.parse(microtextContent);

// Generate NanoBanana JSON
const context: DesignContext = {
  vertical,
  microtext,
  preferences: options.mood || options.colorScheme || options.layout ? {
    mood: options.mood,
    colorScheme: options.colorScheme,
    layout: options.layout
  } : undefined,
  microShift
};

const nanoBananaJSON = generateNanoBananaJSON(context);
const agRequest = formatForAntigravity(nanoBananaJSON);

// Write to coordination.db
const coordinationDbPath = path.join(process.env.HOME!, '.claude/coordination.db');
const db = new sqlite3.Database(coordinationDbPath);

// Ensure tasks table exists
await new Promise<void>((resolve, reject) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      data TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      assigned_to TEXT,
      result TEXT,
      completed_at TIMESTAMP
    )
  `, (err) => err ? reject(err) : resolve());
});

// Insert task for Antigravity
const taskData = {
  nanoBananaJSON,
  agRequest,
  vertical: context.vertical,
  microtextFile: path.basename(microtextFile)
};

let taskId: number;
await new Promise<void>((resolve, reject) => {
  db.run(
    `INSERT INTO tasks (type, description, data, assigned_to) VALUES (?, ?, ?, ?)`,
    [
      'generate-design',
      `Generate NanoBanana design for ${vertical} (${path.basename(microtextFile)})`,
      JSON.stringify(taskData, null, 2),
      'antigravity'
    ],
    function(err) {
      if (err) reject(err);
      else {
        taskId = this.lastID;
        resolve();
      }
    }
  );
});

console.log('\n' + '='.repeat(80));
console.log('✅ TASK QUEUED FOR ANTIGRAVITY');
console.log('='.repeat(80) + '\n');

console.log(`Task ID: ${taskId}`);
console.log(`Type: generate-design`);
console.log(`Vertical: ${context.vertical}`);
console.log(`File: ${path.basename(microtextFile)}`);
if (microShift) {
  const type = microShift.colorVariations ? 'color' : microShift.layoutVariations ? 'layout' : 'typography';
  const count = microShift.colorVariations || microShift.layoutVariations || microShift.typographyVariations;
  console.log(`Micro-shift: ${count} ${type} variations`);
}

console.log('\n' + '='.repeat(80));
console.log('NANOBANANA JSON PREVIEW');
console.log('='.repeat(80) + '\n');
console.log(JSON.stringify(nanoBananaJSON, null, 2));

console.log('\n' + '='.repeat(80));
console.log('NEXT STEPS');
console.log('='.repeat(80));
console.log('1. Switch to Antigravity IDE');
console.log('2. Tell AG: "check queue"');
console.log('3. AG will run get-image with NanoBanana Pro 3');
console.log('4. Design mockup saved to output/');
console.log('5. Implement using suggested components');
console.log('');

console.log('📦 SUGGESTED COMPONENTS:');
nanoBananaJSON.metadata.components.forEach(comp => console.log(`  - ${comp}`));
console.log('');

db.close();
