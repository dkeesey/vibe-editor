# Antigravity Integration - NanoBanana Design Generation

**Workflow:** Claude Code generates JSON → Writes to coordination.db → Antigravity processes with get-image tool

## For Antigravity: How to Process Design Tasks

When user says "check queue", follow this protocol:

### Step 1: Query Coordination Database

```javascript
// In Antigravity session
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = `${process.env.HOME}/.claude/coordination.db`;
const db = new sqlite3.Database(dbPath);
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

// Get pending design tasks
const tasks = await dbAll(`
  SELECT * FROM tasks
  WHERE type = 'generate-design'
  AND assigned_to = 'antigravity'
  AND status = 'pending'
  ORDER BY created_at ASC
`);

console.log(`Found ${tasks.length} design tasks in queue`);
```

### Step 2: Process Each Task with get-image

```javascript
for (const task of tasks) {
  const taskData = JSON.parse(task.data);
  const { nanoBananaJSON, agRequest, vertical, microtextFile } = taskData;

  console.log(`Processing task ${task.id}: ${task.description}`);

  // Update status to 'processing'
  await dbRun(
    `UPDATE tasks SET status = ? WHERE id = ?`,
    ['processing', task.id]
  );

  // Call get-image with NanoBanana Pro 3
  try {
    const imageResult = await get_image(
      agRequest.prompt,  // Stringified JSON
      {
        model: 'nanobanana-pro-3',
        format: agRequest.format,
        width: agRequest.size.width,
        height: agRequest.size.height
      }
    );

    // Save result
    const outputPath = `output/designs/${vertical}-${Date.now()}.${agRequest.format}`;
    // (get-image tool should save automatically, but store path)

    await dbRun(
      `UPDATE tasks SET status = ?, result = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      ['completed', JSON.stringify({ outputPath, ...imageResult }), task.id]
    );

    console.log(`✅ Task ${task.id} complete: ${outputPath}`);

    // If micro-shift variations requested
    if (nanoBananaJSON.microShift) {
      console.log(`Generating ${nanoBananaJSON.microShift.variations.length} ${nanoBananaJSON.microShift.type} variations...`);

      for (const variation of nanoBananaJSON.microShift.variations) {
        const variantJSON = {
          ...nanoBananaJSON,
          prompt: {
            ...nanoBananaJSON.prompt,
            description: `${nanoBananaJSON.prompt.description} (${variation.description})`
          }
        };

        const variantResult = await get_image(
          JSON.stringify(variantJSON, null, 2),
          {
            model: 'nanobanana-pro-3',
            format: agRequest.format,
            width: agRequest.size.width,
            height: agRequest.size.height
          }
        );

        console.log(`  ✅ Variation ${variation.id} complete`);
      }
    }

  } catch (error) {
    console.error(`❌ Task ${task.id} failed:`, error);
    await dbRun(
      `UPDATE tasks SET status = ?, result = ? WHERE id = ?`,
      ['failed', JSON.stringify({ error: error.message }), task.id]
    );
  }
}
```

### Step 3: Report Results

```javascript
console.log('\n' + '='.repeat(80));
console.log('DESIGN GENERATION COMPLETE');
console.log('='.repeat(80));
console.log(`Processed: ${tasks.length} tasks`);
console.log(`Output: output/designs/`);
console.log('\nNext steps:');
console.log('1. Review generated designs');
console.log('2. Implement using suggested shadcn components');
console.log('3. Make content editable via microtext');
```

## For Claude Code: Queueing Design Tasks

### Generate and Queue Task

```bash
cd vibe-editor

# Basic design generation
npm run design:json therapist templates/therapist-emdr.yaml

# With micro-shift variations (3 color palettes)
npm run design:json therapist templates/therapist-emdr.yaml --micro-shift color:3

# With preferences
npm run design:json lawyer templates/lawyer-personal-injury.yaml --mood professional --colors cool

# With layout variations
npm run design:json home-service templates/home-service-hvac.yaml --micro-shift layout:4
```

This writes task to `~/.claude/coordination.db` with:
- Type: `generate-design`
- Data: NanoBanana JSON + AG request format
- Assigned to: `antigravity`
- Status: `pending`

### Tell User

```
✅ Task queued for Antigravity

Next steps:
1. Switch to Antigravity IDE
2. Tell AG: "check queue"
3. AG will generate designs with NanoBanana Pro 3
```

## Micro-Shift Variations Explained

Micro-shift generates multiple design variations with subtle differences for A/B testing:

### Color Variations
```bash
npm run design:json therapist template.yaml --micro-shift color:3
```
Generates 3 designs with different color palette combinations:
- Variation 1: Sage green dominant
- Variation 2: Soft blue dominant
- Variation 3: Warm beige dominant

### Layout Variations
```bash
npm run design:json lawyer template.yaml --micro-shift layout:4
```
Generates 4 designs with different layout patterns:
- F-pattern (traditional)
- Z-pattern (dynamic)
- Grid-based (modern)
- Asymmetric (creative)

### Typography Variations
```bash
npm run design:json salon template.yaml --micro-shift type:2
```
Generates 2 designs with different typography pairings:
- Serif headings + Sans body
- Modern sans headings + Geometric sans body

## NanoBanana JSON Structure

The JSON sent to get-image follows this structure:

```json
{
  "prompt": {
    "description": "Modern calming landing page for therapist website",
    "style": {
      "mood": ["calming", "trustworthy", "professional"],
      "colors": ["sage green", "soft blue", "warm beige", "muted purple"],
      "typography": ["readable serif", "clean sans headings"],
      "layout": "balanced layout with complex complexity"
    },
    "structure": {
      "sections": ["hero", "features", "testimonials", "contact"],
      "hierarchy": ["hero (primary)", "features (secondary)", ...],
      "spacing": "varied"
    },
    "constraints": {
      "platform": "web (Tailwind CSS + shadcn/ui)",
      "responsive": true,
      "accessibility": ["WCAG AA contrast", "semantic HTML", ...],
      "avoid": ["aggressive CTAs", "busy backgrounds", ...]
    }
  },
  "microShift": {
    "type": "color",
    "variations": [
      {
        "id": "color-v1",
        "palette": { "primary": "#8B9D83", ... },
        "description": "Color variation 1: sage green dominant"
      }
    ]
  },
  "metadata": {
    "vertical": "therapist",
    "complexity": "complex",
    "components": ["Card with backdrop blur", "Button", ...]
  }
}
```

## Complete Example Workflow

### In Claude Code:
```bash
# 1. User has microtext structure ready
cat templates/therapist-emdr.yaml

# 2. Generate design with 3 color variations
npm run design:json therapist templates/therapist-emdr.yaml --micro-shift color:3

# Output:
# ✅ Task queued for Antigravity
# Task ID: 42
# Tell AG: "check queue"
```

### In Antigravity:
```
User: "check queue"

AG: Found 1 design task in queue
    Processing task 42: Generate NanoBanana design for therapist

    Calling get-image with NanoBanana Pro 3...
    ✅ Base design complete: output/designs/therapist-1768734000.png

    Generating 3 color variations...
    ✅ Variation color-v1 complete
    ✅ Variation color-v2 complete
    ✅ Variation color-v3 complete

    DESIGN GENERATION COMPLETE
    Processed: 1 task
    Output: output/designs/
```

### Back in Claude Code:
```bash
# 3. Review designs
open output/designs/therapist-*.png

# 4. Implement chosen design
# Use suggested components + microtext pattern
# (HeroSectionVibe.tsx with MicrotextReact)

# 5. Deploy
git add . && git commit -m "Oakland therapy site"
```

## Benefits of This Workflow

1. **Quota Efficiency** - Image generation uses AG's free NanoBanana access (not CC's Claude quota)
2. **Parallel Processing** - CC queues multiple tasks, AG processes batch
3. **Micro-Shift Iterations** - Generate 3-5 variations per design automatically
4. **Async Workflow** - CC continues working while AG generates designs
5. **Shared Database** - Both IDEs coordinate via coordination.db

## Troubleshooting

**AG can't find tasks:**
```sql
-- Check coordination.db
sqlite3 ~/.claude/coordination.db "SELECT * FROM tasks WHERE assigned_to='antigravity';"
```

**get-image fails:**
- Verify NanoBanana Pro 3 model available in AG
- Check JSON structure is valid
- Ensure output/ directory exists

**Micro-shift variations not generating:**
- Check `microShift` object in task data
- Verify variation count is reasonable (2-5)
