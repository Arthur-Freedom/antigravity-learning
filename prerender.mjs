import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4174;

const routes = [
  '/',
  '/learn/workflows',
  '/learn/skills',
  '/learn/agents',
  '/learn/prompts',
  '/learn/context',
  '/learn/mcp',
  '/learn/tools',
  '/learn/safety',
  '/learn/projects',
  '/learn/multiagent',
  '/learn/evaluation',
  '/learn/production',
  '/leaderboard',
  '/resources',
  '/admin',
  '/profile',
  '/faq',
  '/glossary'
];

async function prerender() {
  console.log('Starting pre-rendering...');
  
  // Rename index.html to app.html so we don't overwrite the SPA shell
  const shellPath = path.join(__dirname, 'dist', 'app.html');
  fs.renameSync(path.join(__dirname, 'dist', 'index.html'), shellPath);

  // Serve the built dist directory
  const app = express();
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Fallback to app.html for SPA routes
  app.use((req, res) => {
    res.sendFile(shellPath);
  });

  const server = app.listen(PORT, async () => {
    console.log(`Server started on http://localhost:${PORT}`);
    
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      for (const route of routes) {
        console.log(`Pre-rendering ${route} ...`);
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded' });
        
        // Let the client-side router do its work and DOM updates settle
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const html = await page.content();
        
        // Save the HTML file
        let fileDir = path.join(__dirname, 'dist', route);
        if (route === '/') {
          fileDir = path.join(__dirname, 'dist');
        }
        
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        const filePath = path.join(fileDir, 'index.html');
        fs.writeFileSync(filePath, html);
        console.log(`✓ Saved ${filePath}`);
      }
      
      await browser.close();
      console.log('Pre-rendering complete!');
    } catch (err) {
      console.error('Error during pre-rendering:', err);
      process.exit(1);
    } finally {
      server.close();
    }
  });
}

prerender();
