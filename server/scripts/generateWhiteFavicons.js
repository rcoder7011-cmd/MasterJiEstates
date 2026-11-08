import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootLogoPath = path.resolve(__dirname, '../../Logo.png');
const clientPublicDir = path.resolve(__dirname, '../../client/public');

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/logo.png') {
      const data = fs.readFileSync(rootLogoPath);
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(data);
      return;
    }
    const html = `<!DOCTYPE html><html><body><img id="logo" src="/logo.png" /></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
}

function buildIco(images) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type = 1
  header.writeUInt16LE(count, 4); // Number of images

  for (let i = 0; i < count; i++) {
    const img = images[i];
    const entryOffset = 6 + i * 16;
    header.writeUInt8(img.width === 256 ? 0 : img.width, entryOffset + 0);
    header.writeUInt8(img.height === 256 ? 0 : img.height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2); // Color palette
    header.writeUInt8(0, entryOffset + 3); // Reserved
    header.writeUInt16LE(1, entryOffset + 4); // Color planes
    header.writeUInt16LE(32, entryOffset + 6); // Bit depth
    header.writeUInt32LE(img.buffer.length, entryOffset + 8); // Size
    header.writeUInt32LE(offset, entryOffset + 12); // Offset
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...images.map(img => img.buffer)]);
}

async function run() {
  const server = createServer();
  const PORT = 4185;
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9345;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--window-size=1600,1200',
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

    async function evaluate(fnStr) {
      const res = await sendCommand('Runtime.evaluate', {
        expression: `(${fnStr})()`,
        returnByValue: true,
        awaitPromise: true,
      });
      return res?.result?.value;
    }

    console.log('Generating high-visibility white favicons from Logo.png...');

    const generateIconsScript = `
      function() {
        var img = document.getElementById('logo');
        var srcW = img.naturalWidth;
        var srcH = img.naturalHeight;

        // Content bounding box detected in analysis:
        // x: 155 to 1395 (width 1240), y: 38 to 905 (height 867)
        // Crop tightly to content to maximize visibility in small favicon sizes
        var cropX = 150;
        var cropY = 35;
        var cropW = 1245;
        var cropH = 872;

        function renderWhiteFavicon(size, cornerRadiusRatio) {
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 1. Draw solid pure white background (#FFFFFF)
          if (cornerRadiusRatio && cornerRadiusRatio > 0 && size >= 32) {
            var r = Math.round(size * cornerRadiusRatio);
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(0, 0, size, size, r);
            } else {
              ctx.rect(0, 0, size, size);
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            // Subtle 1px boundary stroke so white icon has clear border on light backgrounds
            ctx.lineWidth = size >= 64 ? 2 : 1;
            ctx.strokeStyle = 'rgba(15, 36, 68, 0.08)';
            ctx.stroke();
          } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);
          }

          // 2. Draw logo content tightly fitted with 6% padding for maximum readability
          var padRatio = size <= 32 ? 0.05 : 0.07;
          var pad = Math.round(size * padRatio);
          var availW = size - (pad * 2);
          var availH = size - (pad * 2);

          var drawW = availW;
          var drawH = Math.round(drawW * (cropH / cropW));
          if (drawH > availH) {
            drawH = availH;
            drawW = Math.round(drawH * (cropW / cropH));
          }

          var drawX = Math.round((size - drawW) / 2);
          var drawY = Math.round((size - drawH) / 2);

          // Draw cropped content directly from source image
          ctx.drawImage(img, cropX, cropY, cropW, cropH, drawX, drawY, drawW, drawH);

          return canvas.toDataURL('image/png');
        }

        return {
          p16: renderWhiteFavicon(16, 0),         // Solid white square for 16x16 tab icon
          p32: renderWhiteFavicon(32, 0.12),      // Crisp white rounded card for 32x32 retina tab icon
          p48: renderWhiteFavicon(48, 0.12),      // Crisp white rounded card for 48x48
          p180: renderWhiteFavicon(180, 0),       // Solid white square for Apple Touch Icon (iOS applies squircle mask)
          p192: renderWhiteFavicon(192, 0.15),    // Crisp white card for Android/PWA
          p512: renderWhiteFavicon(512, 0.15)     // Crisp white card for high-res splash
        };
      }
    `;

    const iconDataUrls = await evaluate(generateIconsScript);

    function dataUrlToBuffer(dataUrl) {
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      return Buffer.from(base64, 'base64');
    }

    const buf16 = dataUrlToBuffer(iconDataUrls.p16);
    const buf32 = dataUrlToBuffer(iconDataUrls.p32);
    const buf48 = dataUrlToBuffer(iconDataUrls.p48);
    const buf180 = dataUrlToBuffer(iconDataUrls.p180);
    const buf192 = dataUrlToBuffer(iconDataUrls.p192);
    const buf512 = dataUrlToBuffer(iconDataUrls.p512);

    // Save PNG files to client/public/
    fs.writeFileSync(path.join(clientPublicDir, 'favicon-16x16.png'), buf16);
    console.log('✓ Created client/public/favicon-16x16.png (', buf16.length, 'bytes, Solid White Background)');

    fs.writeFileSync(path.join(clientPublicDir, 'favicon-32x32.png'), buf32);
    console.log('✓ Created client/public/favicon-32x32.png (', buf32.length, 'bytes, Crisp White Card)');

    fs.writeFileSync(path.join(clientPublicDir, 'apple-touch-icon.png'), buf180);
    console.log('✓ Created client/public/apple-touch-icon.png (', buf180.length, 'bytes, Solid White Background)');

    fs.writeFileSync(path.join(clientPublicDir, 'favicon-192x192.png'), buf192);
    console.log('✓ Created client/public/favicon-192x192.png (', buf192.length, 'bytes, White PWA Tile)');

    fs.writeFileSync(path.join(clientPublicDir, 'favicon-512x512.png'), buf512);
    console.log('✓ Created client/public/favicon-512x512.png (', buf512.length, 'bytes, White PWA Tile)');

    // Build multi-resolution ICO containing 16x16, 32x32, and 48x48
    const icoBuf = buildIco([
      { width: 16, height: 16, buffer: buf16 },
      { width: 32, height: 32, buffer: buf32 },
      { width: 48, height: 48, buffer: buf48 }
    ]);

    fs.writeFileSync(path.join(clientPublicDir, 'favicon.ico'), icoBuf);
    console.log('✓ Created client/public/favicon.ico (', icoBuf.length, 'bytes, with 16x16, 32x32, 48x48 on White Background)');

    ws.close();
    chromeProc.kill();
    server.close();
  } catch (err) {
    chromeProc.kill();
    server.close();
    console.error(err);
  }
}

run();
