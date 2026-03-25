#!/usr/bin/env node
/**
 * FIX-DATES.JS
 * Backdates articles to prevent future dates.
 * Today = 2026-03-25. Renumber all future articles 1/day from today.
 */

const fs = require('fs');
const path = require('path');

const INSIGHTS_DIR = path.join(__dirname, '..', 'content', 'insights');
const TODAY = new Date('2026-03-25');

// Get all article files sorted by current date (oldest first)
const files = fs.readdirSync(INSIGHTS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort();

// Separate past and future articles
const pastArticles = [];
const futureArticles = [];

files.forEach(file => {
  const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})-/);
  if (!dateMatch) return;
  
  const fileDate = new Date(dateMatch[1]);
  if (fileDate < TODAY) {
    pastArticles.push(file);
  } else {
    futureArticles.push(file);
  }
});

console.log(`Past articles (unchanged): ${pastArticles.length}`);
console.log(`Future articles (renumbering): ${futureArticles.length}`);

// Renumber future articles starting from today, one per day
let currentDate = new Date(TODAY);
const renames = [];

futureArticles.forEach((file) => {
  const dateStr = currentDate.toISOString().split('T')[0];
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const newFilename = `${dateStr}-${slug}`;
  
  if (file !== newFilename) {
    renames.push({ old: file, newFile: newFilename });
  }
  
  // Next day
  currentDate.setDate(currentDate.getDate() + 1);
});

console.log(`\nRenames needed: ${renames.length}`);

// Perform renames
let renamed = 0;
renames.forEach(({ old, newFile }) => {
  const oldPath = path.join(INSIGHTS_DIR, old);
  const newPath = path.join(INSIGHTS_DIR, newFile);
  
  try {
    fs.renameSync(oldPath, newPath);
    renamed++;
    if (renamed <= 5 || renamed % 20 === 0) {
      console.log(`  ${old} → ${newFile}`);
    }
  } catch (e) {
    console.error(`  FAILED: ${old} → ${newFile}: ${e.message}`);
  }
});

console.log(`\nDone! Renamed ${renamed} files.`);
console.log(`Date range: ${TODAY.toISOString().split('T')[0]} to ${currentDate.toISOString().split('T')[0]}`);
