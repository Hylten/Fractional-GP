#!/usr/bin/env node
/**
 * FIX-ALL-DATES.CJS
 * Properly assigns unique sequential dates to all articles.
 * Uses 3-phase approach: collect → temp rename → final rename.
 */

const fs = require('fs');
const path = require('path');

const DIR = '/Users/jonasthevathason/AI Agents =)/Alpha-Architect/content/insights';
const START = new Date('2026-03-25');

// Phase 1: Collect all slugs
const slugs = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/^\d{4}-\d{2}-\d{2}-/, ''))
  .sort();

console.log(`Total articles: ${slugs.length}`);

// Phase 2: Rename all to temp names (unique prefix)
slugs.forEach((slug, i) => {
  const oldName = fs.readdirSync(DIR).find(f => f.endsWith(slug));
  if (oldName) {
    fs.renameSync(path.join(DIR, oldName), path.join(DIR, `__temp_${i}`));
  }
});

// Phase 3: Rename from temp to final sequential dates
let date = new Date(START);
let count = 0;

for (let i = 0; i < slugs.length; i++) {
  const tempName = `__temp_${i}`;
  const slug = slugs[i];
  const dateStr = date.toISOString().split('T')[0];
  const finalName = `${dateStr}-${slug}`;
  
  try {
    fs.renameSync(path.join(DIR, tempName), path.join(DIR, finalName));
    count++;
  } catch (e) {
    console.error(`Failed: ${tempName} → ${finalName}: ${e.message}`);
  }
  
  date.setDate(date.getDate() + 1);
}

const endDate = new Date(date);
endDate.setDate(endDate.getDate() - 1);

console.log(`Renamed ${count} articles`);
console.log(`Range: ${START.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

// Verify
const finalFiles = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
const dates = finalFiles.map(f => f.slice(0, 10));
const uniqueDates = new Set(dates);
console.log(`Final: ${finalFiles.length} articles, ${uniqueDates.size} unique dates`);
if (finalFiles.length !== uniqueDates.size) {
  console.log('WARNING: Duplicate dates detected!');
}
