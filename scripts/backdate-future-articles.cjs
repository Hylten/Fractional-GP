#!/usr/bin/env node
/**
 * BACKDATE-FUTURE-ARTICLES.CJS
 * Moves future-dated articles (after 2026-03-25) to dates BEFORE 2025-11-20.
 * Never deletes - only renames.
 */

const fs = require('fs');
const path = require('path');

const DIR = '/Users/jonasthevathason/AI Agents =)/Alpha-Architect/docs/intelligence';
const TODAY = new Date('2026-03-25');
const CURRENT_OLDEST = new Date('2025-11-20');

// Get all directories
const items = fs.readdirSync(DIR).filter(f => {
  const stat = fs.statSync(path.join(DIR, f));
  return stat.isDirectory() && f.match(/^\d{4}-\d{2}-\d{2}-/);
});

// Find future-dated articles (> today)
const futureArticles = [];

items.forEach(item => {
  const dateMatch = item.match(/^(\d{4}-\d{2}-\d{2})-/);
  if (!dateMatch) return;
  
  const dateStr = dateMatch[1];
  const articleDate = new Date(dateStr);
  
  if (articleDate > TODAY) {
    futureArticles.push({ item, originalDate: dateStr });
  }
});

console.log(`Total articles: ${items.length}`);
console.log(`Future articles to backdate: ${futureArticles.length}`);

// Sort by original date (oldest first)
futureArticles.sort((a, b) => a.originalDate.localeCompare(b.originalDate));

// Start backdating from one day before CURRENT_OLDEST
let backdate = new Date(CURRENT_OLDEST);
backdate.setDate(backdate.getDate() - 1);

// Track existing names to avoid conflicts
const existingNames = new Set(
  items.filter(i => !futureArticles.find(f => f.item === i))
    .map(i => i)
);

let renamed = 0;
futureArticles.forEach(({ item }) => {
  const slug = item.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  let newDateStr = backdate.toISOString().split('T')[0];
  let newName = `${newDateStr}-${slug}`;
  
  // Handle conflicts
  while (existingNames.has(newName)) {
    backdate.setDate(backdate.getDate() - 1);
    newDateStr = backdate.toISOString().split('T')[0];
    newName = `${newDateStr}-${slug}`;
  }
  
  const oldPath = path.join(DIR, item);
  const newPath = path.join(DIR, newName);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    existingNames.add(newName);
    renamed++;
    
    if (renamed <= 10 || renamed % 50 === 0) {
      console.log(`  ${item} → ${newName}`);
    }
  }
  
  backdate.setDate(backdate.getDate() - 1);
});

console.log(`\nBackdated ${renamed} articles`);
console.log(`New oldest article: ${backdate.toISOString().split('T')[0]}`);
