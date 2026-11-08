import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../../client/dist');

// Simple static server for client/dist
function createServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json',
  };

  return http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else {
        filePath = path.join(distDir, 'index.html'); // SPA fallback
      }
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (e) {
      res.writeHead(500);
      res.end('Error loading ' + req.url);
    }
  });
}

async function run() {
  const server = createServer();
  await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
  console.log('Static preview server running on http://127.0.0.1:4173');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const viewports = [
    { w: 1000, h: 738, name: '1000x738' },
    { w: 1024, h: 768, name: '1024x768' },
    { w: 768, h: 1024, name: '768x1024' },
    { w: 390, h: 844, name: '390x844' },
    { w: 320, h: 700, name: '320x700' },
  ];

  const screenshotsDir = path.resolve(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  for (const vp of viewports) {
    const screenshotPath = path.join(screenshotsDir, `home_${vp.name}.png`);
    console.log(`Testing viewport ${vp.w}x${vp.h}...`);

    await new Promise((resolve) => {
      const proc = spawn(chromePath, [
        '--headless=new',
        '--disable-gpu',
        `--window-size=${vp.w},${vp.h}`,
        `--screenshot=${screenshotPath}`,
        'http://127.0.0.1:4173/',
      ]);
      proc.on('close', resolve);
    });

    console.log(`  Saved screenshot: ${screenshotPath}`);
  }

  server.close();
  console.log('All tests completed.');
}

run();

