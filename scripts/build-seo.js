import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'insights');
const DIST_DIR = path.join(ROOT_DIR, 'docs');
const INSIGHTS_DIST_DIR = path.join(DIST_DIR, 'insights');

const SITE_URL = 'https://hylten.github.io/Alpha-Architect';
const BRAND_NAME = 'Off-Market Alpha Architect';
const ACCENT = '#C5A059';

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

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
  return (title, description, bodyContent) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${BRAND_NAME}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Jonas Hyltén">
  <link rel="canonical" href="${SITE_URL}/insights/">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0b0f16; color: #E5E7EB; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.8; }
    a { color: ${ACCENT}; text-decoration: none; transition: 0.3s; }
    a:hover { opacity: 0.7; }
    .container { max-width: 820px; margin: 0 auto; padding: 180px 24px 120px; }
    .back { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #aaaaaa; margin-bottom: 80px; display: inline-block; font-weight: 500; }
    .back:hover { color: ${ACCENT}; }
    h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 6vw, 4rem); color: #ffffff; margin-bottom: 40px; line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; }
    .meta { font-size: 11px; color: #eeeeee; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 80px; padding-bottom: 40px; border-bottom: 1px solid #222; font-weight: 500; }
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
    .list-item { margin-bottom: 140px; padding-bottom: 100px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; }
    .list-item h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 5vw, 3.2rem); color: ${ACCENT}; margin-bottom: 32px; font-weight: 300; line-height: 1.1; letter-spacing: -0.01em; }
    .list-item .desc { font-size: 1.1rem; color: #eeeeee; line-height: 1.8; font-weight: 300; max-width: 650px; margin-bottom: 40px; }
    .list-item .date { font-size: 10px; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 32px; font-weight: 500; opacity: 1; }
    .list-item .read { font-size: 9px; text-transform: uppercase; letter-spacing: 4px; font-weight: 600; color: #fff; border-bottom: 1px solid rgba(197, 160, 89, 0.3); padding-bottom: 8px; transition: 0.3s; }
    .list-item .read:hover { border-bottom-color: ${ACCENT}; color: ${ACCENT}; }
    .index-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3.5rem, 10vw, 7rem); color: ${ACCENT}; margin-bottom: 48px; font-weight: 300; letter-spacing: -0.04em; text-align: center; }
    .index-sub { font-size: 1.15rem; color: #dddddd; max-width: 700px; margin: 0 auto 140px; line-height: 1.8; font-weight: 300; text-align: center; font-style: italic; }
  </style>
</head>
<body>
  ${bodyContent}
  <a href="https://wa.me/46701619978?text=Regarding%20Fractional%20GP%20Architecture:" target="_blank" rel="noopener noreferrer" class="wa-btn">
    <svg style="width:20px;height:20px;color:white;" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
</body>
</html>`;
}

async function generateSEO() {
  console.log('Building Off-Market Alpha Architect Site...');

  // Step 1: Copy VCard landing page to dist
  copyVCard();

  // Step 2: Generate blog pages
  ensureDir(INSIGHTS_DIST_DIR);

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No content/insights directory found. Skipping blog generation.');
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const htmlBuilder = buildBlogHTML();
  const today = new Date().toISOString().split('T')[0];

  // Generate Index Page
  let listItems = '';
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || file.replace('.md', '');
    const title = data.title || 'Insight';
    const description = data.description || '';
    const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    listItems += `
      <div class="list-item">
        <div class="date">${date}</div>
        <a href="/Alpha-Architect/insights/${slug}/" style="text-decoration:none;">
          <h2>${title}</h2>
          <p class="desc">${description}</p>
          <span class="read">Read Briefing</span>
        </a>
      </div>`;
  }

  const indexBody = `
    <div class="container" style="max-width:900px; text-align:center;">
      <a href="/Alpha-Architect/" class="back">&larr; Back to Profile</a>
      <h1 class="index-title">${BRAND_NAME}</h1>
      <p class="index-sub">Institutional briefings on Off-Market Alpha architecture, Agentic AI infrastructure, and proprietary deal flow for mid-market principals.</p>
      ${listItems}
    </div>`;

  const indexHtml = htmlBuilder('Insights', 'Off-Market Alpha Architect Insights - Institutional briefings on AI-driven deal flow and capital architecture.', indexBody);
  fs.writeFileSync(path.join(INSIGHTS_DIST_DIR, 'index.html'), indexHtml);
  console.log('✅ Generated /dist/insights/index.html');

  // Generate Article Pages
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || file.replace('.md', '');
    const title = data.title || 'Insight';
    const description = data.description || '';
    const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

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
      <a href="/Alpha-Architect/insights/" class="back">&larr; Back to Index</a>
      <h1>${title}</h1>
      <div class="meta">${date} &bull; Jonas Hylt&eacute;n</div>
      <div class="content">
        ${contentHtml}
      </div>
      <div style="text-align:center;">
        <a href="/Alpha-Architect/" class="home-btn">Return to Profile</a>
      </div>
    </div>`;

    const articleDir = path.join(INSIGHTS_DIST_DIR, slug);
    ensureDir(articleDir);
    fs.writeFileSync(path.join(articleDir, 'index.html'), htmlBuilder(title, description, articleBody));
    console.log(`✅ Generated /dist/insights/${slug}/index.html`);
  }

  // Sitemap
  let sitemapUrls = `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/insights/</loc>
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
    <loc>${SITE_URL}/insights/${slug}/</loc>
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
