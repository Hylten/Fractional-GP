#!/usr/bin/env node
/**
 * RENAME-SEQUENTIAL.CJS
 * Renames all articles with sequential dates from 2026-03-25.
 */

const fs = require('fs');
const path = require('path');

const DIR = '/Users/jonasthevathason/AI Agents =)/Alpha-Architect/content/insights';
const START = new Date('2026-03-25');

// Get files sorted
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort();

// First, rename to temp names to avoid conflicts
const tempNames = files.map((f, i) => `temp_${i}_${f}`);
files.forEach((f, i) => {
  fs.renameSync(path.join(DIR, f), path.join(DIR, tempNames[i]));
});

// Now rename from temp to final sequential dates
let date = new Date(START);
let renamed = 0;

tempNames.forEach((temp, i) => {
  const match = temp.match(/^temp_\d+_(.+)$/);
  const slug = match[1].replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const dateStr = date.toISOString().split('T')[0];
  const finalName = `${dateStr}-${slug}`;
  
  fs.renameSync(path.join(DIR, temp), path.join(DIR, finalName));
  renamed++;
  
  date.setDate(date.getDate() + 1);
});

const endDate = new Date(date);
endDate.setDate(endDate.getDate() - 1);

console.log(`Renamed ${renamed} articles`);
console.log(`${START.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`);
