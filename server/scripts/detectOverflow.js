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

// Run Chrome headless with CDP to evaluate overflow and layout metrics
async function evaluatePage(url, width, height) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9333;

  // Start Chrome with remote debugging
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--remote-debugging-port=${port}`,
    url,
  ]);

  // Wait for Chrome to open debugging port
  await new Promise((r) => setTimeout(r, 1200));

  try {
    // Fetch debugging target
    const targetsRes = await fetch(`http://127.0.0.1:${port}/json`);
    const targets = await targetsRes.json();
    const target = targets.find((t) => t.type === 'page') || targets[0];

    if (!target || !target.webSocketDebuggerUrl) {
      throw new Error('No page target found in Chrome');
    }

    // Connect WebSocket
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

    // Evaluate layout audit script
    const evalScript = `
      (function() {
        var doc = document.documentElement;
        var winW = window.innerWidth;
        var scrollW = doc.scrollWidth;
        var hasHorizontalOverflow = scrollW > winW;
        
        var header = document.querySelector('header');
        var headerRect = header ? header.getBoundingClientRect() : null;
        
        var overflowingElements = [];
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
          var r = all[i].getBoundingClientRect();
          if (r.right > winW + 1) {
            overflowingElements.push({
              tag: all[i].tagName,
              className: all[i].className ? all[i].className.toString().slice(0, 50) : '',
              right: Math.round(r.right),
              width: Math.round(r.width),
              winW: winW
            });
            if (overflowingElements.length >= 5) break;
          }
        }
        
        return {
          winW: winW,
          winH: window.innerHeight,
          scrollW: scrollW,
          scrollH: doc.scrollHeight,
          hasHorizontalOverflow: hasHorizontalOverflow,
          headerHeight: headerRect ? Math.round(headerRect.height) : null,
          overflowCount: overflowingElements.length,
          sampleOverflows: overflowingElements
        };
      })()
    `;

    const result = await sendCommand('Runtime.evaluate', {
      expression: evalScript,
      returnByValue: true,
    });

    ws.close();
    chromeProc.kill();
    return result?.result?.value;
  } catch (err) {
    chromeProc.kill();
    throw err;
  }
}

async function run() {
  const server = createServer();
  await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));

  const testViewports = [
    { w: 1440, h: 900 },
    { w: 1280, h: 800 },
    { w: 1024, h: 768 },
    { w: 1000, h: 738 },
    { w: 1000, h: 700 },
    { w: 900, h: 700 },
    { w: 850, h: 700 },
    { w: 768, h: 1024 },
    { w: 600, h: 900 },
    { w: 430, h: 932 },
    { w: 390, h: 844 },
    { w: 375, h: 812 },
    { w: 320, h: 700 },
  ];

  const testRoutes = ['/', '/properties', '/contact', '/about', '/services', '/faq', '/login', '/register'];

  console.log('Testing layout across viewports and routes...\n');

  for (const route of testRoutes) {
    console.log(`=== Testing Route: ${route} ===`);
    for (const vp of testViewports) {
      try {
        const metrics = await evaluatePage(`http://127.0.0.1:4173${route}`, vp.w, vp.h);
        const status = metrics.hasHorizontalOverflow ? 'FAIL (OVERFLOW)' : 'PASS';
        console.log(
          `  [${status}] Viewport ${vp.w}x${vp.h} | WinW: ${metrics.winW} | ScrollW: ${metrics.scrollW} | HeaderH: ${metrics.headerHeight}px`
        );
        if (metrics.hasHorizontalOverflow) {
          console.warn('    Sample overflowing elements:', JSON.stringify(metrics.sampleOverflows));
        }
      } catch (err) {
        console.error(`  Error evaluating ${vp.w}x${vp.h}:`, err.message);
      }
    }
    console.log('');
  }

  server.close();
}

run();

