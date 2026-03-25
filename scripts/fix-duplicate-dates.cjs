#!/usr/bin/env node
/**
 * FIX-DUPLICATE-DATES.CJS
 * Fixes duplicate dates by shifting articles forward 1 day.
 */

const fs = require('fs');
const path = require('path');

const INSIGHTS_DIR = path.join(__dirname, '..', 'content', 'insights');

// Get all articles sorted by date
const files = fs.readdirSync(INSIGHTS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort();

// Find duplicates and build shift map
const dateCount = new Map();
const shiftMap = new Map(); // file -> newDate

files.forEach(file => {
  const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (!match) return;
  
  let [, dateStr, slug] = match;
  let count = dateCount.get(dateStr) || 0;
  dateCount.set(dateStr, count + 1);
  
  if (count > 0) {
    // This is a duplicate - needs to be shifted
    shiftMap.set(file, { daysToAdd: count, slug });
  }
});

console.log(`Duplicates to fix: ${shiftMap.size}`);

// Apply shifts
let shifted = 0;
shiftMap.forEach((info, file) => {
  const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const [, dateStr, slug] = match;
  
  // Calculate new date
  const date = new Date(dateStr);
  date.setDate(date.getDate() + info.daysToAdd);
  const newDateStr = date.toISOString().split('T')[0];
  const newFilename = `${newDateStr}-${slug}`;
  
  const oldPath = path.join(INSIGHTS_DIR, file);
  const newPath = path.join(INSIGHTS_DIR, newFilename);
  
  try {
    fs.renameSync(oldPath, newPath);
    shifted++;
    console.log(`  ${file} → ${newFilename}`);
  } catch(e) {
    console.error(`  FAILED: ${file}: ${e.message}`);
  }
});

console.log(`\nShifted ${shifted} files`);
