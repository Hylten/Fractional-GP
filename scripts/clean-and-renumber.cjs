#!/usr/bin/env node
/**
 * CLEAN-AND-RENUMBER.CJS
 * Cleans duplicates and renumbers all articles with sequential dates.
 * 1 article per day starting from 2026-03-25.
 */

const fs = require('fs');
const path = require('path');

const INSIGHTS_DIR = path.join(__dirname, '..', 'content', 'insights');
const START_DATE = new Date('2026-03-25');

// Get all article files
const files = fs.readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.md'));

// Group by slug (everything after the date)
const slugMap = new Map();

files.forEach(file => {
  const match = file.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  if (!match) return;
  
  const slug = match[1];
  const dateStr = file.match(/^(\d{4}-\d{2}-\d{2})/)[1];
  
  // Keep the most recent date version
  if (!slugMap.has(slug) || dateStr > slugMap.get(slug).date) {
    // Delete old file if exists
    if (slugMap.has(slug)) {
      const oldFile = `${slugMap.get(slug).date}-${slug}`;
      try { fs.unlinkSync(path.join(INSIGHTS_DIR, oldFile)); } catch(e) {}
    }
    slugMap.set(slug, { date: dateStr, file });
  } else {
    // Delete this older duplicate
    try { fs.unlinkSync(path.join(INSIGHTS_DIR, file)); } catch(e) {}
  }
});

console.log(`Unique articles after dedup: ${slugMap.size}`);

// Get sorted unique slugs
const uniqueArticles = [...slugMap.entries()]
  .sort((a, b) => a[1].date.localeCompare(b[1].date))
  .map(([slug]) => slug);

// Rename all to sequential dates
let currentDate = new Date(START_DATE);
let renamed = 0;

uniqueArticles.forEach(slug => {
  const dateStr = currentDate.toISOString().split('T')[0];
  const newFilename = `${dateStr}-${slug}`;
  const oldFilename = `${slugMap.get(slug).date}-${slug}`;
  
  if (oldFilename !== newFilename) {
    const oldPath = path.join(INSIGHTS_DIR, oldFilename);
    const newPath = path.join(INSIGHTS_DIR, newFilename);
    
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      renamed++;
    }
  }
  
  currentDate.setDate(currentDate.getDate() + 1);
});

const endDate = new Date(currentDate);
endDate.setDate(endDate.getDate() - 1);

console.log(`Renamed: ${renamed} files`);
console.log(`Date range: ${START_DATE.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
console.log(`Total articles: ${uniqueArticles.length}`);

// Verify
const finalFiles = fs.readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.md'));
const dates = finalFiles.map(f => f.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1]).filter(Boolean);
const uniqueDates = [...new Set(dates)];
console.log(`Final check - articles: ${finalFiles.length}, unique dates: ${uniqueDates.length}`);
