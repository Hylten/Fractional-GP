#!/usr/bin/env node
/**
 * BACKDATE-ARTICLES.CJS
 * Backdates articles: 1 per day working BACKWARDS from today.
 * Today (March 25) = newest article, oldest article = furthest back.
 */

const fs = require('fs');
const path = require('path');

const DIR = '/Users/jonasthevathason/AI Agents =)/Alpha-Architect/content/insights';
const TODAY = new Date('2026-03-25');

// Get all slugs sorted (oldest first = will be assigned oldest date)
const slugs = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/^\d{4}-\d{2}-\d{2}-/, ''))
  .sort();

console.log(`Total articles: ${slugs.length}`);

// Phase 1: Rename all to temp names
slugs.forEach((slug, i) => {
  const oldName = fs.readdirSync(DIR).find(f => f.endsWith(slug));
  if (oldName) {
    fs.renameSync(path.join(DIR, oldName), path.join(DIR, `__temp_${i}`));
  }
});

// Phase 2: Calculate date range
// Newest article (last slug) = TODAY
// Oldest article (first slug) = TODAY - (total - 1) days
const totalDays = slugs.length - 1;
const startDate = new Date(TODAY);
startDate.setDate(startDate.getDate() - totalDays);

console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${TODAY.toISOString().split('T')[0]}`);

// Phase 3: Rename from temp to final dates (sequential from startDate)
let date = new Date(startDate);
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

console.log(`Renamed ${count} articles`);

// Verify
const finalFiles = fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
const dates = finalFiles.map(f => f.slice(0, 10));
const uniqueDates = new Set(dates);
console.log(`Final: ${finalFiles.length} articles, ${uniqueDates.size} unique dates`);
if (finalFiles.length !== uniqueDates.size) {
  console.log('WARNING: Duplicate dates detected!');
}
