#!/usr/bin/env node
/**
 * FIX-DATES-V2.JS
 * Properly backdates articles: 1 per day starting from today.
 * No duplicates.
 */

const fs = require('fs');
const path = require('path');

const INSIGHTS_DIR = path.join(__dirname, '..', 'content', 'insights');
const START_DATE = new Date('2026-03-25');

// Get all article files
const files = fs.readdirSync(INSIGHTS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort();

console.log(`Total articles: ${files.length}`);

// Rename all files to sequential dates starting from START_DATE
let currentDate = new Date(START_DATE);
let renamed = 0;

files.forEach((file) => {
  const dateStr = currentDate.toISOString().split('T')[0];
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const newFilename = `${dateStr}-${slug}`;
  
  if (file !== newFilename) {
    const oldPath = path.join(INSIGHTS_DIR, file);
    const newPath = path.join(INSIGHTS_DIR, newFilename);
    
    try {
      fs.renameSync(oldPath, newPath);
      renamed++;
    } catch (e) {
      console.error(`FAILED: ${file} → ${newFilename}: ${e.message}`);
    }
  }
  
  // Next day
  currentDate.setDate(currentDate.getDate() + 1);
});

const endDate = new Date(currentDate);
endDate.setDate(endDate.getDate() - 1);

console.log(`Renamed: ${renamed} files`);
console.log(`Date range: ${START_DATE.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

// Verify no duplicates
const newFiles = fs.readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.md'));
const dates = newFiles.map(f => f.match(/^(\d{4}-\d{2}-\d{2})-/)?.[1]).filter(Boolean);
const uniqueDates = [...new Set(dates)];
console.log(`Unique dates: ${uniqueDates.length} (should equal ${newFiles.length})`);
