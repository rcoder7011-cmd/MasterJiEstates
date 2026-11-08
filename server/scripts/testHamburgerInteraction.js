import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../../client/dist');

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
        filePath = path.join(distDir, 'index.html');
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
    } catch {
      res.writeHead(500);
      res.end('Error loading ' + req.url);
    }
  });
}

async function testViewport(port, width, height) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9335;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${cdpPort}`,
    `http://127.0.0.1:${port}/`,
  ]);

  await new Promise((r) => setTimeout(r, 1400));

  try {
    const targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json`);
    const targets = await targetsRes.json();
    const target = targets.find((t) => t.type === 'page') || targets[0];

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(fnStr) {
      const res = await sendCommand('Runtime.evaluate', {
        expression: `(${fnStr})()`,
        returnByValue: true,
        awaitPromise: true,
      });
      return res?.result?.value;
    }

    console.log(`\n--- Testing Viewport: ${width} × ${height} ---`);

    // 1. Check hamburger is present
    const init = await evaluate(`function() {
      var btn = document.querySelector('button[aria-controls="mobile-navigation-drawer"]');
      var headerLogos = document.querySelectorAll('header img[src*="logo"], header img[alt*="Logo"]');
      return { hasHamburger: !!btn, headerLogos: headerLogos.length };
    }`);
    console.log(`  Hamburger button present: ${init.hasHamburger} | Header logos: ${init.headerLogos}`);

    // 2. Click to open
    await evaluate(`function() {
      var btn = document.querySelector('button[aria-controls="mobile-navigation-drawer"]');
      if (btn) btn.click();
    }`);
    await new Promise((r) => setTimeout(r, 350));

    // 3. Evaluate open state
    const opened = await evaluate(`function() {
      var drawer = document.getElementById('mobile-navigation-drawer');
      if (!drawer) return { open: false };
      var rect = drawer.getBoundingClientRect();
      var navLinks = Array.from(drawer.querySelectorAll('nav a')).map(function(a) {
        return a.textContent.trim();
      });
      var addPropBtn = drawer.querySelector('a[href*="/dashboard/listings/new"], a[href*="/login"]');
      var color = addPropBtn ? window.getComputedStyle(addPropBtn).color : '';
      var drawerLogos = drawer.querySelectorAll('img[src*="logo"], img[alt*="Logo"]');
      return {
        open: true,
        height: Math.round(rect.height),
        navCount: navLinks.length,
        navLinks: navLinks,
        addPropColor: color,
        drawerLogosCount: drawerLogos.length,
        hasWhatsApp: !!drawer.querySelector('a[href*="wa.me"]'),
        bodyOverflow: document.body.style.overflow
      };
    }`);
    console.log(`  Drawer Open: ${opened.open} | Height: ${opened.height}px | Nav Links: ${opened.navCount} (${opened.navLinks.join(', ')})`);
    console.log(`  Drawer Logos: ${opened.drawerLogosCount} (Expected 0) | Add Property Color: ${opened.addPropColor}`);
    console.log(`  WhatsApp CTA: ${opened.hasWhatsApp} | Scroll Locked: ${opened.bodyOverflow === 'hidden'}`);

    // 4. Click Close Button
    await evaluate(`function() {
      var closeBtn = document.querySelector('#mobile-navigation-drawer button[aria-label="Close navigation menu"]');
      if (closeBtn) closeBtn.click();
    }`);
    await new Promise((r) => setTimeout(r, 350));
    const closed = await evaluate(`function() {
      return !document.getElementById('mobile-navigation-drawer');
    }`);
    console.log(`  Drawer closed after close button click: ${closed}`);

    ws.close();
    chromeProc.kill();

    return (
      init.hasHamburger &&
      init.headerLogos === 1 &&
      opened.open &&
      opened.height > 400 &&
      opened.navCount === 6 &&
      opened.drawerLogosCount === 0 &&
      opened.addPropColor === 'rgb(0, 0, 0)' &&
      closed
    );
  } catch (err) {
    chromeProc.kill();
    throw err;
  }
}

async function run() {
  const server = createServer();
  const PORT = 4175;
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

  const testViewports = [
    { w: 1000, h: 738 },
    { w: 768, h: 1024 },
    { w: 430, h: 932 },
    { w: 390, h: 844 },
    { w: 320, h: 700 },
  ];

  console.log('========================================================================');
  console.log(' MASTERJIESTATES: MULTI-VIEWPORT HAMBURGER INTERACTION AUDIT');
  console.log('========================================================================');

  let allPassed = true;
  for (const vp of testViewports) {
    const passed = await testViewport(PORT, vp.w, vp.h);
    if (!passed) allPassed = false;
  }

  server.close();

  console.log('\n========================================================================');
  console.log(' AUDIT RESULT:', allPassed ? 'ALL VIEWPORTS PASSED (100%)' : 'SOME VIEWPORTS FAILED');
  console.log('========================================================================\n');

  process.exitCode = allPassed ? 0 : 1;
}

run();
