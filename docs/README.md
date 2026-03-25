# Alpha-Architect GitHub Pages Setup

## Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select: **Deploy from a branch**
3. Select **main** branch and **/docs** folder
4. Click **Save**

## After Save

The site will be live at:
- **https://hylten.github.io/Alpha-Architect/**

Individual articles:
- **https://hylten.github.io/Alpha-Architect/intelligence/**

## Build Commands

```bash
npm install
npm run build
```

This generates static files in `/docs/` which GitHub Pages serves.
