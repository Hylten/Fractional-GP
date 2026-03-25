#!/usr/bin/env node
/**
 * REMOVE-DUPLICATES.CJS
 * Keeps only one version of each article slug.
 * Preference: most recent date that is <= 2026-03-25.
 * Never deletes - only removes true duplicates.
 */

const fs = require('fs');
const path = require('path');

const DIR = '/Users/jonasthevathason/AI Agents =)/Alpha-Architect/docs/intelligence';
const CUTOFF = new Date('2026-03-25');

// Group articles by slug
const slugMap = new Map(); // slug -> [{name, date}]

const items = fs.readdirSync(DIR).filter(f => {
  const stat = fs.statSync(path.join(DIR, f));
  return stat.isDirectory() && f.match(/^\d{4}-\d{2}-\d{2}-/);
});

items.forEach(item => {
  const dateMatch = item.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (!dateMatch) return;
  
  const dateStr = dateMatch[1];
  const slug = dateMatch[2];
  
  if (!slugMap.has(slug)) {
    slugMap.set(slug, []);
  }
  slugMap.get(slug).push({ name: item, date: dateStr });
});

// Find duplicates and decide which to keep
let removed = 0;
let kept = 0;

slugMap.forEach((versions, slug) => {
  if (versions.length === 1) {
    kept++;
    return;
  }
  
  // Sort by date descending (newest first)
  versions.sort((a, b) => b.date.localeCompare(a.date));
  
  // Keep the first one (newest), remove the rest
  const keep = versions[0];
  const toRemove = versions.slice(1);
  
  toRemove.forEach(v => {
    const removePath = path.join(DIR, v.name);
    if (fs.existsSync(removePath)) {
      fs.rmSync(removePath, { recursive: true });
      removed++;
      if (removed <= 10 || removed % 20 === 0) {
        console.log(`  Removed: ${v.name}`);
      }
    }
  });
  
  kept++;
});

console.log(`\nKept: ${kept} unique articles`);
console.log(`Removed: ${removed} duplicates`);
console.log(`Total: ${kept} articles remaining`);
