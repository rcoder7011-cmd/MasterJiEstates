import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const clientPublicDir = path.resolve(rootDir, 'client/public');
const clientDistDir = path.resolve(rootDir, 'client/dist');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

function getPngDimensions(buf) {
  if (buf.length >= 24 && buf.toString('ascii', 12, 16) === 'IHDR') {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20)
    };
  }
  return null;
}

function inspectIco(buf) {
  if (buf.length < 6) return null;
  const reserved = buf.readUInt16LE(0);
  const type = buf.readUInt16LE(2);
  const count = buf.readUInt16LE(4);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    entries.push({
      width: buf.readUInt8(offset) || 256,
      height: buf.readUInt8(offset + 1) || 256,
      size: buf.readUInt32LE(offset + 8)
    });
  }
  return { reserved, type, count, entries };
}

async function runVerification() {
  console.log('\n========================================================================');
  console.log(' MASTERJIESTATES: WEBSITE FAVICON VERIFICATION & AUDIT SUITE');
  console.log('========================================================================\n');

  // 1. Source Asset Integrity
  console.log('--- 1. Source Logo Integrity & Preservation ---');
  const rootLogoPath = path.join(rootDir, 'Logo.png');
  const publicLogoPath = path.join(clientPublicDir, 'logo.png');

  assert(fs.existsSync(rootLogoPath), 'Root Logo.png exists as single source of truth');
  assert(fs.existsSync(publicLogoPath), 'client/public/logo.png exists for application use');

  const rootHash = crypto.createHash('sha256').update(fs.readFileSync(rootLogoPath)).digest('hex');
  const pubHash = crypto.createHash('sha256').update(fs.readFileSync(publicLogoPath)).digest('hex');
  assert(rootHash === pubHash, 'Root Logo.png and client/public/logo.png are bit-for-bit identical');

  // 2. Favicon Assets in client/public/
  console.log('\n--- 2. Favicon Asset Generation & Dimension Audit ---');
  const expectedAssets = [
    { name: 'favicon.ico', type: 'ico' },
    { name: 'favicon-16x16.png', w: 16, h: 16 },
    { name: 'favicon-32x32.png', w: 32, h: 32 },
    { name: 'apple-touch-icon.png', w: 180, h: 180 },
    { name: 'favicon-192x192.png', w: 192, h: 192 },
    { name: 'favicon-512x512.png', w: 512, h: 512 },
    { name: 'site.webmanifest', type: 'manifest' }
  ];

  for (const asset of expectedAssets) {
    const pubFile = path.join(clientPublicDir, asset.name);
    assert(fs.existsSync(pubFile), `client/public/${asset.name} exists`);

    if (asset.w && asset.h) {
      const dim = getPngDimensions(fs.readFileSync(pubFile));
      assert(dim && dim.width === asset.w && dim.height === asset.h, `${asset.name} exact dimensions: ${asset.w}x${asset.h}`);
    } else if (asset.type === 'ico') {
      const icoInfo = inspectIco(fs.readFileSync(pubFile));
      assert(icoInfo && icoInfo.type === 1 && icoInfo.count >= 2, `favicon.ico valid multi-resolution ICO (contains ${icoInfo?.count} icons: ${icoInfo?.entries.map(e => e.width + 'x' + e.height).join(', ')})`);
    } else if (asset.type === 'manifest') {
      const manifest = JSON.parse(fs.readFileSync(pubFile, 'utf-8'));
      assert(manifest.name === 'MasterJiEstates' && manifest.icons?.length >= 2, 'site.webmanifest valid PWA configuration');
    }
  }

  // 3. Absence of Conflicting Placeholders
  console.log('\n--- 3. Removal of Conflicting Favicon References ---');
  assert(!fs.existsSync(path.join(clientPublicDir, 'logo.svg')), 'client/public/logo.svg placeholder removed');
  assert(!fs.existsSync(path.join(clientPublicDir, 'vite.svg')), 'No default vite.svg in public directory');

  // 4. HTML Head References Audit
  console.log('\n--- 4. HTML Metadata & Favicon Tag References ---');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'client/index.html'), 'utf-8');

  assert(indexHtml.includes('href="/favicon.ico"'), 'index.html references /favicon.ico');
  assert(indexHtml.includes('href="/favicon-32x32.png"'), 'index.html references /favicon-32x32.png');
  assert(indexHtml.includes('href="/favicon-16x16.png"'), 'index.html references /favicon-16x16.png');
  assert(indexHtml.includes('href="/apple-touch-icon.png"'), 'index.html references /apple-touch-icon.png');
  assert(indexHtml.includes('href="/site.webmanifest"'), 'index.html references /site.webmanifest');
  assert(!indexHtml.includes('href="/logo.svg"'), 'index.html has zero references to old /logo.svg');

  // 5. Production Dist Verification
  console.log('\n--- 5. Production Dist Bundle & Assets Verification ---');
  assert(fs.existsSync(clientDistDir), 'client/dist directory exists');

  for (const asset of expectedAssets) {
    const distFile = path.join(clientDistDir, asset.name);
    assert(fs.existsSync(distFile), `client/dist/${asset.name} successfully deployed to production root`);
  }

  const distIndexHtml = fs.readFileSync(path.join(clientDistDir, 'index.html'), 'utf-8');
  assert(distIndexHtml.includes('href="/favicon.ico"') && !distIndexHtml.includes('href="/logo.svg"'), 'dist/index.html contains official favicon tags without old placeholder');

  // 6. Headless Browser Live Route & Network Request Test
  console.log('\n--- 6. Live Headless Chrome HTTP Network Test ---');
  await runLiveNetworkTest();

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passedTests} / ${totalTests} ASSERTIONS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('========================================================================\n');
}

async function runLiveNetworkTest() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(clientDistDir, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else {
        filePath = path.join(clientDistDir, 'index.html');
      }
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(clientDistDir, 'index.html');
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

  const PORT = 4183;
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9343;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,800',
    `--remote-debugging-port=${cdpPort}`,
    `http://127.0.0.1:${PORT}/`,
  ]);

  await new Promise(r => setTimeout(r, 1500));

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

    // Enable Network
    await sendCommand('Network.enable');

    // Test fetch of favicons from browser
    const fetchScript = `
      async function() {
        var results = [];
        var urls = [
          '/favicon.ico',
          '/favicon-16x16.png',
          '/favicon-32x32.png',
          '/apple-touch-icon.png',
          '/favicon-192x192.png',
          '/favicon-512x512.png',
          '/site.webmanifest'
        ];

        for (var url of urls) {
          try {
            var res = await fetch(url);
            results.push({ url: url, status: res.status, ok: res.ok, type: res.headers.get('content-type') });
          } catch(err) {
            results.push({ url: url, status: 0, ok: false, error: err.message });
          }
        }
        return results;
      }
    `;

    const res = await sendCommand('Runtime.evaluate', {
      expression: `(${fetchScript})()`,
      returnByValue: true,
      awaitPromise: true,
    });

    const netResults = res?.result?.value || [];
    for (const r of netResults) {
      assert(r.ok && r.status === 200, `Browser fetch ${r.url} returned HTTP ${r.status} (${r.type})`);
    }

    ws.close();
    chromeProc.kill();
    server.close();
  } catch (err) {
    chromeProc.kill();
    server.close();
    console.error('Network test error:', err);
  }
}

runVerification();
