#!/usr/bin/env node
// Generate design/generated/inventory.json + design/tokens.md from sprout-app's
// artifact-design-system.css (the stylesheet injectBaseStyles ships into every
// canvas), and lint the design/ docs against that inventory.
//
// Generate:  node scripts/sync-design-inventory.mjs --css <path-to-css> --commit <sprout-app-sha>
// Lint:      node scripts/sync-design-inventory.mjs --lint
//
// The CSS lives at apps/server/src/services/mastra/tools/artifact-design-system.css
// in sprout-app. Fetch main's copy without touching a checkout:
//   git -C <sprout-app> show origin/main:apps/server/src/services/mastra/tools/artifact-design-system.css > /tmp/ads.css

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design');
const INVENTORY = path.join(DESIGN, 'generated', 'inventory.json');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

function parseCss(css) {
  const tokens = {};
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    if (!(m[1] in tokens)) tokens[m[1]] = m[2].trim();
  }
  const classes = new Set();
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of stripped.matchAll(/\.([a-zA-Z][a-zA-Z0-9-]*)/g)) classes.add(m[1]);
  const keyframes = [...stripped.matchAll(/@keyframes\s+([a-zA-Z0-9-]+)/g)].map((m) => m[1]);
  return { tokens, classes: [...classes].sort(), keyframes: [...new Set(keyframes)].sort() };
}

function groupTokens(tokens) {
  const groups = new Map();
  const ramps = ['sprout', 'brand', 'gray', 'red', 'green', 'yellow', 'orange', 'violet', 'pink', 'blue-dark'];
  const bucket = (name) => {
    for (const p of ['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'spacing', 'radius']) {
      if (name.startsWith(`--${p}-`)) return p;
    }
    for (const r of ramps) if (new RegExp(`^--${r}-\\d`).test(name)) return `ramp:${r}`;
    for (const p of ['bg', 'text', 'border', 'fg']) if (name.startsWith(`--${p}-`)) return `semantic:${p}`;
    return 'misc';
  };
  for (const [name, value] of Object.entries(tokens)) {
    const g = bucket(name);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push([name, value]);
  }
  return groups;
}

function renderTokensMd(inv) {
  const groups = groupTokens(inv.tokens);
  const titles = {
    'font-family': 'Font family', 'font-weight': 'Font weights', 'font-size': 'Font sizes',
    'line-height': 'Line heights', 'letter-spacing': 'Letter spacing',
    spacing: 'Spacing scale', radius: 'Radius scale',
    'semantic:bg': 'Semantic — backgrounds', 'semantic:text': 'Semantic — text',
    'semantic:border': 'Semantic — borders', 'semantic:fg': 'Semantic — foreground/icons',
    misc: 'Base', };
  const order = ['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'spacing', 'radius',
    'ramp:sprout', 'ramp:brand', 'ramp:gray', 'ramp:red', 'ramp:green', 'ramp:yellow', 'ramp:orange',
    'ramp:violet', 'ramp:pink', 'ramp:blue-dark', 'semantic:bg', 'semantic:text', 'semantic:border', 'semantic:fg', 'misc'];
  let out = `# Design Tokens — Canvas Runtime (GENERATED)

> **GENERATED FILE — do not edit by hand.** Regenerate with
> \`node scripts/sync-design-inventory.mjs --css <artifact-design-system.css> --commit <sha>\`.
> Source: \`apps/server/src/services/mastra/tools/artifact-design-system.css\` @ sprout-app \`${inv.sourceCommit}\`.

Every token below is a CSS custom property available inside EVERY canvas via the
injected base stylesheet. Use \`var(--token)\` — never hardcode hex, px sizes, or
font stacks where a token exists (the server analyzer flags hex as a design error).

`;
  for (const key of order) {
    if (!groups.has(key)) continue;
    const title = titles[key] ?? `Color ramp — ${key.split(':')[1]}`;
    out += `## ${title}\n\n| Token | Value |\n| --- | --- |\n`;
    for (const [n, v] of groups.get(key)) out += `| \`${n}\` | \`${v}\` |\n`;
    out += '\n';
  }
  out += `## Class + keyframe inventory

The complete list of classes and keyframes the runtime injects lives in
[\`generated/inventory.json\`](generated/inventory.json). \`components.md\`,
\`motion.md\`, and \`layout.md\` document how to use them; the lint mode of the
sync script verifies those docs never reference a class or token that does not
exist at runtime.
`;
  return out;
}

function generate() {
  const cssPath = flag('--css');
  const commit = flag('--commit') ?? 'unknown';
  if (!cssPath) { console.error('need --css <path>'); process.exit(1); }
  const css = fs.readFileSync(cssPath, 'utf8');
  const inv = { sourceCommit: commit, generatedBy: 'scripts/sync-design-inventory.mjs', ...parseCss(css) };
  fs.mkdirSync(path.dirname(INVENTORY), { recursive: true });
  fs.writeFileSync(INVENTORY, JSON.stringify(inv, null, 2) + '\n');
  fs.writeFileSync(path.join(DESIGN, 'tokens.md'), renderTokensMd(inv));
  console.log(`inventory: ${Object.keys(inv.tokens).length} tokens, ${inv.classes.length} classes, ${inv.keyframes.length} keyframes`);
  console.log('wrote design/generated/inventory.json + design/tokens.md');
}

function lint() {
  const inv = JSON.parse(fs.readFileSync(INVENTORY, 'utf8'));
  const classSet = new Set(inv.classes);
  const tokenSet = new Set(Object.keys(inv.tokens));
  const mdFiles = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && e.name !== 'generated') walk(p);
      else if (e.name.endsWith('.md')) mdFiles.push(p);
    }
  };
  walk(DESIGN);
  let failures = 0;
  for (const file of mdFiles) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    for (const m of text.matchAll(/var\((--[a-z0-9-]+)/gi)) {
      if (m[1] === '--token') continue; // generic placeholder used in prose
      if (!tokenSet.has(m[1])) { failures++; console.error(`${rel}: unknown token ${m[1]}`); }
    }
    // Kit classes referenced in HTML snippets: verify every class that shares a
    // prefix with the kit namespace. Doc-local custom classes must be prefixed
    // with `x-` in skeletons, so anything unprefixed is claimed to be kit.
    // `screen` is not injected CSS but IS an authoring convention the server
    // analyzer keys on (empty-screen + screen-switching rules) — allowlisted.
    const CONVENTION = new Set(['screen']);
    for (const m of text.matchAll(/class="([^"]+)"/g)) {
      for (const cls of m[1].split(/\s+/).filter(Boolean)) {
        if (cls.startsWith('x-') || CONVENTION.has(cls)) continue;
        if (!classSet.has(cls)) { failures++; console.error(`${rel}: unknown kit class .${cls}`); }
      }
    }
  }
  if (failures) { console.error(`\nLINT FAILED: ${failures} unknown reference(s)`); process.exit(1); }
  console.log(`lint OK — ${mdFiles.length} docs checked against ${INVENTORY}`);
}

if (args.includes('--lint')) lint();
else generate();
