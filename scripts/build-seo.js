import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'insights');
const DIST_DIR = path.join(ROOT_DIR, 'docs');
const INTELLIGENCE_DIST_DIR = path.join(DIST_DIR, 'intelligence');

const SITE_URL = 'https://hylten.github.io/Alpha-Architect';
const BRAND_NAME = 'Off-Market Alpha Architect';
const ACCENT = '#C5A059';

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// DATE SAFEGUARD: Prevent future-dated articles from being built
function validateArticleDates() {
  // Use local date (YYYY-MM-DD in local timezone)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const futureDates = [];
  
  files.forEach(file => {
    const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);
    if (match) {
      const articleDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      if (articleDate > today) {
        futureDates.push({ file, date: `${match[1]}-${match[2]}-${match[3]}` });
      }
    }
  });
  
  if (futureDates.length > 0) {
    console.error('\n❌ DATE SAFEGUARD: Future-dated articles detected!');
    console.error('   Today (local):', `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
    console.error('   Future articles:');
    futureDates.forEach(({ file, date }) => {
      console.error(`     - ${date}: ${file}`);
    });
    console.error('\n   Fix: Run "node scripts/fix-all-dates.cjs" or manually rename files.');
    console.error('   Build aborted to prevent future dates from being published.\n');
    process.exit(1);
  }
  
  console.log('✅ Date validation passed: No future dates found');
}

function copyVCard() {
  ensureDir(DIST_DIR);
  // Copy root VCard files to dist (index.html, profile.jpg, jonas-hylten.vcf)
  const filesToCopy = ['index.html', 'profile.jpg', 'jonas-hylten.vcf'];
  for (const f of filesToCopy) {
    const src = path.join(ROOT_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST_DIR, f));
    }
  }
  // Copy assets directory
  const assetsSrc = path.join(ROOT_DIR, 'assets');
  const assetsDst = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(assetsSrc)) {
    ensureDir(assetsDst);
    for (const f of fs.readdirSync(assetsSrc)) {
      fs.copyFileSync(path.join(assetsSrc, f), path.join(assetsDst, f));
    }
  }
  console.log('✅ VCard landing page copied to dist/');
}

function buildBlogHTML() {
  // Standalone HTML shell for blog pages (no React dependency)
  return (title, description, bodyContent, schemaData = null) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${BRAND_NAME}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Jonas Hyltén">
  <link rel="canonical" href="${SITE_URL}/intelligence/">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
  ${schemaData ? `<script type="application/ld+json">${JSON.stringify(schemaData, null, 2)}</script>` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0b0f16; color: #E5E7EB; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.8; }
    a { color: ${ACCENT}; text-decoration: none; transition: 0.3s; }
    a:hover { opacity: 0.7; }
    .container { max-width: 820px; margin: 0 auto; padding: 120px 24px 120px; }
    .top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .top-nav-left { display: flex; flex-direction: column; gap: 8px; }
    .top-nav-right { text-align: right; }
    .breadcrumb { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 0; }
    .breadcrumb:hover { color: ${ACCENT}; }
    .breadcrumb-sep { color: #444; margin: 0 12px; }
    .back { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #888; font-weight: 500; transition: 0.3s; }
    .back:hover { color: ${ACCENT}; }
    .back-label { font-size: 9px; color: #555; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .bottom-nav-box { margin-top: 100px; padding: 60px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); text-align: center; }
    .bottom-nav-label { font-size: 9px; color: #555; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .bottom-nav-link { display: inline-block; padding: 20px 48px; border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600; transition: 0.4s; }
    .bottom-nav-link:hover { background: ${ACCENT}; color: #000; border-color: ${ACCENT}; }
    h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 6vw, 4rem); color: #ffffff; margin-bottom: 40px; line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; }
    .meta { font-size: 11px; color: #eeeeee; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 80px; padding-bottom: 40px; border-bottom: 1px solid #222; font-weight: 500; }
    .meta .read-time { opacity: 0.6; margin-left: 12px; }
    .content p, .content li { font-size: 1.15rem; line-height: 2.4; color: #ffffff; font-weight: 300; margin-bottom: 80px; }
    .content h2 { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; color: #ffffff; margin: 80px 0 40px; font-weight: 300; line-height: 1.2; }
    .content h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: #ffffff; margin: 60px 0 30px; font-weight: 400; }
    .content strong { color: #ffffff; font-weight: 600; }
    .content em { font-style: italic; color: #ffffff; }
    .content blockquote { border-left: 2px solid ${ACCENT}; padding-left: 32px; margin: 60px 0; font-style: italic; color: #eeeeee; font-size: 1.2rem; }
    .home-btn { display: inline-block; padding: 16px 40px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #ffffff; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600; border-radius: 0; margin-top: 100px; transition: 0.4s; }
    .home-btn:hover { background: ${ACCENT}; color: #000; border-color: ${ACCENT}; }
    .wa-btn { position: fixed; bottom: 32px; right: 32px; z-index: 1000; background: #111; padding: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.6); opacity: 0.4; transition: 0.3s; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; }
    .wa-btn:hover { opacity: 1; transform: translateY(-2px); }
    .li-btn { position: fixed; bottom: 96px; right: 32px; z-index: 1000; background: #111; padding: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.6); opacity: 0.4; transition: 0.3s; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; }
    .li-btn:hover { opacity: 1; transform: translateY(-2px); }
    .list-item { margin-bottom: 140px; padding-bottom: 100px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; }
    .list-item h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 5vw, 3.2rem); color: ${ACCENT}; margin-bottom: 32px; font-weight: 300; line-height: 1.1; letter-spacing: -0.01em; }
    .list-item .desc { font-size: 1.1rem; color: #eeeeee; line-height: 1.8; font-weight: 300; max-width: 650px; margin-bottom: 40px; }
    .list-item .date { font-size: 10px; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 32px; font-weight: 500; opacity: 1; }
    .list-item .read-time { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-left: 12px; }
    .list-item .tags { margin-bottom: 16px; }
    .list-item .tag { display: inline-block; padding: 4px 10px; background: rgba(197, 160, 89, 0.1); border: 1px solid rgba(197, 160, 89, 0.2); color: #C5A059; font-size: 8px; text-transform: uppercase; letter-spacing: 2px; margin-right: 8px; }
    .list-item .read { font-size: 9px; text-transform: uppercase; letter-spacing: 4px; font-weight: 600; color: #fff; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 8px; transition: 0.3s; }
    .list-item .read:hover { border-bottom-color: ${ACCENT}; color: ${ACCENT}; }
    .index-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.5rem, 10vw, 7rem); color: ${ACCENT}; margin-bottom: 48px; font-weight: 300; letter-spacing: -0.04em; text-align: center; }
    .index-sub { font-size: 1.15rem; color: #dddddd; max-width: 700px; margin: 0 auto 60px; line-height: 1.8; font-weight: 300; text-align: center; font-style: italic; }
    .year-nav, .quarter-nav, .category-nav { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 40px; }
    .quarter-nav { margin-top: 20px; }
    .category-nav { margin-bottom: 60px; }
    .year-box, .quarter-box, .cat-box { display: inline-block; padding: 12px 24px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #aaaaaa; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; transition: 0.3s; cursor: pointer; }
    .year-box:hover, .quarter-box:hover, .cat-box:hover { border-color: ${ACCENT}; color: #ffffff; }
    .year-box.active, .quarter-box.active, .cat-box.active { background: ${ACCENT}; border-color: ${ACCENT}; color: #000000; }
    .search-box { max-width: 400px; margin: 0 auto 60px; }
    .search-input { width: 100%; padding: 14px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: 0.3s; }
    .search-input:focus { border-color: ${ACCENT}; }
    .search-input::placeholder { color: #666; }
  </style>
</head>
<body>
  ${bodyContent}
  <a href="https://api.whatsapp.com/send?phone=46701619978&text=Regarding%20Off-Market%20Alpha%20Architecture" target="_blank" rel="noopener noreferrer" class="wa-btn" onclick="setTimeout(() => { window.location.href = 'tel:+46701619978'; }, 2000);">
    <svg style="width:20px;height:20px;color:white;" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
  <a href="https://www.linkedin.com/in/hylten/" target="_blank" rel="noopener noreferrer" class="li-btn">
    <svg style="width:20px;height:20px;color:white;" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  </a>
  </body>
</html>`;
}

async function generateSEO() {
  // DATE SAFEGUARD: Validate no future dates before building
  validateArticleDates();
  
  console.log('Building Off-Market Alpha Architect Site...');

  // Step 1: Copy VCard landing page to dist
  copyVCard();

  // Step 2: Generate blog pages
  ensureDir(INTELLIGENCE_DIST_DIR);

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No content/insights directory found. Skipping intelligence generation.');
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const htmlBuilder = buildBlogHTML();
  const today = new Date().toISOString().split('T')[0];

  // Generate Index Page
  let listItems = '';
  const yearData = {};
  const quarterData = {};
  const categoryData = {};
  
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace('.md', '');
    const title = data.title || 'Insight';
    const description = data.description || '';
    const tags = data.tags || [];
    const date = data.date ? new Date(data.date) : null;
    const dateStr = date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const year = date ? date.getFullYear().toString() : '';
    const quarter = date ? `Q${Math.floor((date.getMonth() + 3) / 3)} ${year}` : '';
    
    // Estimate read time (approx 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    // Track years
    if (year && !yearData[year]) {
      yearData[year] = [];
    }
    if (year) {
      yearData[year].push({ slug, title, description, date: dateStr, year });
    }
    
    // Track quarters
    if (quarter && !quarterData[quarter]) {
      quarterData[quarter] = [];
    }
    if (quarter) {
      quarterData[quarter].push({ slug, title, description, date: dateStr, year, quarter });
    }
    
    // Track categories/tags
    tags.forEach(tag => {
      const cat = tag.trim();
      if (!categoryData[cat]) {
        categoryData[cat] = [];
      }
      categoryData[cat].push({ slug, title, description, date: dateStr, year, quarter });
    });
    
    const tagsHtml = tags.length > 0 ? `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : '';
    
    listItems += `
      <div class="list-item" data-year="${year}" data-quarter="${quarter}" data-tags="${tags.join(',')}">
        <div class="date">${dateStr} <span class="read-time">${readTime} min</span></div>
        ${tagsHtml}
        <a href="/Alpha-Architect/intelligence/${slug}/" style="text-decoration:none;">
          <h2>${title}</h2>
          <p class="desc">${description}</p>
          <span class="read">Read Briefing</span>
        </a>
      </div>`;
  }

  const years = Object.keys(yearData).sort().reverse();
  const quarters = Object.keys(quarterData).sort().reverse();
  const categories = Object.keys(categoryData).sort();
  
  // Year navigation
  const yearNavItems = years.map(year => 
    `<a href="#" onclick="filterItems('year', '${year}', this); return false;" class="year-box" data-year="${year}">${year}</a>`
  ).join('');
  
  // Quarter navigation
  const quarterNavItems = quarters.map(q => 
    `<a href="#" onclick="filterItems('quarter', '${q}', this); return false;" class="quarter-box" data-quarter="${q}">${q}</a>`
  ).join('');
  
  // Category navigation
  const categoryNavItems = categories.map(cat => 
    `<a href="#" onclick="filterItems('category', '${cat}', this); return false;" class="cat-box" data-category="${cat}">${cat}</a>`
  ).join('');

  const hasMultipleYears = years.length > 1;
  const hasQuarters = quarters.length > 0;
  const hasCategories = categories.length > 0;
  
  const searchBox = `
    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search briefings..." onkeyup="searchItems(this.value)">
    </div>
    <script>
      function searchItems(query) {
        query = query.toLowerCase();
        document.querySelectorAll('.list-item').forEach(item => {
          const title = item.querySelector('h2')?.textContent.toLowerCase() || '';
          const desc = item.querySelector('.desc')?.textContent.toLowerCase() || '';
          const tags = item.dataset.tags || '';
          if (!query || title.includes(query) || desc.includes(query) || tags.includes(query)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
        // Clear active states when searching
        if (query) {
          document.querySelectorAll('.year-box, .quarter-box, .cat-box').forEach(b => b.classList.remove('active'));
        }
      }
    </script>`;
  
  const filterNav = `
    <div class="year-nav">
      <a href="#" onclick="filterItems('year', 'all', this); return false;" class="year-box ${hasMultipleYears ? 'active' : ''}" data-year="all">All</a>
      ${yearNavItems}
    </div>
    ${hasQuarters ? `<div class="quarter-nav">${quarterNavItems}</div>` : ''}
    ${hasCategories ? `<div class="category-nav">${categoryNavItems}</div>` : ''}
    <script>
      let activeFilters = { year: 'all', quarter: 'all', category: 'all' };
      function filterItems(type, value, el) {
        activeFilters[type] = value;
        
        // Update active states
        document.querySelectorAll('.' + type + '-box').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        
        // Clear search when using filters
        document.querySelector('.search-input').value = '';
        
        // Apply all filters
        document.querySelectorAll('.list-item').forEach(item => {
          const yearMatch = activeFilters.year === 'all' || item.dataset.year === activeFilters.year;
          const quarterMatch = activeFilters.quarter === 'all' || item.dataset.quarter === activeFilters.quarter;
          const catMatch = activeFilters.category === 'all' || (item.dataset.tags || '').split(',').includes(activeFilters.category);
          
          if (yearMatch && quarterMatch && catMatch) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      }
    </script>`;

  const indexBody = `
    <div class="container" style="max-width:900px; text-align:center;">
      <a href="/Alpha-Architect/" class="back">&larr; Back to Profile</a>
      <h1 class="index-title">${BRAND_NAME}</h1>
      <p class="index-sub">Institutional briefings on Off-Market Alpha architecture, Agentic AI infrastructure, and proprietary deal flow for mid-market principals.</p>
      ${searchBox}
      ${hasMultipleYears || hasCategories ? filterNav : ''}
      ${listItems}
    </div>`;

  const indexHtml = htmlBuilder('Intelligence', 'Off-Market Alpha Architect Intelligence - Institutional briefings on AI-driven deal flow and capital architecture.', indexBody);
  fs.writeFileSync(path.join(INTELLIGENCE_DIST_DIR, 'index.html'), indexHtml);
  console.log('✅ Generated /dist/intelligence/index.html');

  // Generate Article Pages
  // Sort files by date for prev/next navigation
  const sortedFiles = [...files].sort((a, b) => {
    const rawA = fs.readFileSync(path.join(CONTENT_DIR, a), 'utf8');
    const rawB = fs.readFileSync(path.join(CONTENT_DIR, b), 'utf8');
    const dateA = new Date(matter(rawA).data.date || 0);
    const dateB = new Date(matter(rawB).data.date || 0);
    return dateB - dateA;
  });
  
  const fileSlugMap = {};
  for (let i = 0; i < sortedFiles.length; i++) {
    const f = sortedFiles[i];
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || f.replace('.md', '');
    fileSlugMap[slug] = i;
  }
  
  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace('.md', '');
    const title = data.title || 'Insight';
    const description = data.description || '';
    const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    
    // Calculate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Schema.org structured data for article
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "author": {
        "@type": "Person",
        "name": "Jonas Hyltén"
      },
      "datePublished": data.date,
      "dateModified": data.date,
      "url": `${SITE_URL}/intelligence/${slug}/`
    };

    // Find prev/next
    const currentIndex = fileSlugMap[slug];
    const prevSlug = sortedFiles[currentIndex + 1];
    const nextSlug = sortedFiles[currentIndex - 1];
    
    let prevNextHtml = '';
    if (prevSlug || nextSlug) {
      const prevRaw = prevSlug ? fs.readFileSync(path.join(CONTENT_DIR, prevSlug), 'utf8') : null;
      const nextRaw = nextSlug ? fs.readFileSync(path.join(CONTENT_DIR, nextSlug), 'utf8') : null;
      const prevData = prevRaw ? matter(prevRaw).data : null;
      const nextData = nextRaw ? matter(nextRaw).data : null;
      const prevTitle = prevData?.title || 'Previous';
      const nextTitle = nextData?.title || 'Next';
      const prevFileSlug = prevData?.slug || prevSlug?.replace('.md', '') || '';
      const nextFileSlug = nextData?.slug || nextSlug?.replace('.md', '') || '';
      
      prevNextHtml = `
        <div style="display: flex; justify-content: space-between; margin-top: 80px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1);">
          ${prevSlug ? `<a href="/Alpha-Architect/intelligence/${prevFileSlug}/" style="text-align: left;">
            <div style="font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">&larr; Previous</div>
            <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: #C5A059;">${prevTitle}</div>
          </a>` : '<div></div>'}
          ${nextSlug ? `<a href="/Alpha-Architect/intelligence/${nextFileSlug}/" style="text-align: right;">
            <div style="font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Next &rarr;</div>
            <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: #C5A059;">${nextTitle}</div>
          </a>` : '<div></div>'}
        </div>`;
    }
    
    // Breadcrumb
    const articleDate = data.date ? new Date(data.date) : null;
    const articleYear = articleDate ? articleDate.getFullYear() : '';
    const breadcrumb = `
      <div class="top-nav">
        <div class="top-nav-left">
          <div class="back-label">Navigation</div>
          <div>
            <a href="/Alpha-Architect/" class="back">&larr; Return to Profile</a>
          </div>
        </div>
        <div class="top-nav-right">
          <div>
            <a href="/Alpha-Architect/intelligence/" class="breadcrumb">Intelligence</a>
            ${articleYear ? `<span class="breadcrumb-sep">/</span><a href="/Alpha-Architect/intelligence/?year=${articleYear}" class="breadcrumb">${articleYear}</a>` : ''}
          </div>
        </div>
      </div>`;

    const contentHtml = content.split('\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('### ')) return `<h3>${p.replace('### ', '')}</h3>`;
      if (p.startsWith('## ')) return `<h2>${p.replace('## ', '')}</h2>`;
      if (p.startsWith('> ')) return `<blockquote><p>${p.replace('> ', '')}</p></blockquote>`;
      p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      p = p.replace(/\*(.*?)\*/g, '<em>$1</em>');
      p = p.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      return `<p>${p}</p>`;
    }).join('\n');

    const articleBody = `
    <div class="container">
      ${breadcrumb}
      <h1>${title}</h1>
      <div class="meta">${date} <span class="read-time">${readTime} min read</span> &bull; Jonas Hylt&eacute;n</div>
      <div class="content">
        ${contentHtml}
      </div>
      ${prevNextHtml}
      <div class="bottom-nav-box">
        <div class="bottom-nav-label">Back to Profile</div>
        <a href="/Alpha-Architect/" class="bottom-nav-link">Return to Profile</a>
      </div>
    </div>`;

    const articleDir = path.join(INTELLIGENCE_DIST_DIR, slug);
    ensureDir(articleDir);
    fs.writeFileSync(path.join(articleDir, 'index.html'), htmlBuilder(title, description, articleBody, schemaData));
    console.log(`✅ Generated /dist/intelligence/${slug}/index.html`);
  }

  // Sitemap
  let sitemapUrls = `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/intelligence/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>`;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || file.replace('.md', '');
    const date = data.date || today;
    sitemapUrls += `
  <url>
    <loc>${SITE_URL}/intelligence/${slug}/</loc>
    <lastmod>${date}</lastmod>
    <priority>0.8</priority>
  </url>`;
  }

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`);
  console.log('✅ Generated /dist/sitemap.xml');

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`);
  console.log('✅ Generated /dist/robots.txt');

  console.log('SEO Generation Complete!');
}

generateSEO().catch(console.error);
