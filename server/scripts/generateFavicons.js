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

// Builds an ICO file buffer from an array of PNG buffers
function buildIco(images) {
  // images: Array of { width: number, height: number, buffer: Buffer }
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
  const PORT = 4182;
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9342;

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

    console.log('Generating favicon assets in headless Chrome...');

    // Function to render icon in browser
    const generateIconsScript = `
      function() {
        var img = document.getElementById('logo');
        var srcW = img.naturalWidth;
        var srcH = img.naturalHeight;

        // First, create a high-res transparent version of the source image
        var highCanvas = document.createElement('canvas');
        highCanvas.width = srcW;
        highCanvas.height = srcH;
        var hctx = highCanvas.getContext('2d');
        hctx.drawImage(img, 0, 0);
        var imgData = hctx.getImageData(0, 0, srcW, srcH);
        var data = imgData.data;

        // Convert near-white background to transparent with smooth alpha roll-off
        for (var i = 0; i < data.length; i += 4) {
          var r = data[i], g = data[i+1], b = data[i+2];
          // Off-white background detection
          if (r >= 250 && g >= 250 && b >= 250) {
            data[i+3] = 0; // Fully transparent
          } else if (r >= 235 && g >= 235 && b >= 235) {
            // Anti-aliased edge smoothing
            var maxC = Math.max(r, g, b);
            var alpha = Math.round(((255 - maxC) / (255 - 235)) * 255);
            data[i+3] = Math.min(data[i+3], alpha);
          }
        }
        hctx.putImageData(imgData, 0, 0);

        // Helper to render into square with proportional fit and padding
        function renderSquare(size, transparentBg) {
          var canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (!transparentBg) {
            // White / clean background for apple touch icon
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);
          } else {
            ctx.clearRect(0, 0, size, size);
          }

          // Padding: 4% for large, 2px for tiny
          var padRatio = size <= 32 ? 0.04 : 0.06;
          var pad = Math.round(size * padRatio);
          var availW = size - (pad * 2);
          var availH = size - (pad * 2);

          // Maintain aspect ratio (1536 / 1024 = 1.5)
          var drawW = availW;
          var drawH = Math.round(drawW * (srcH / srcW));
          if (drawH > availH) {
            drawH = availH;
            drawW = Math.round(drawH * (srcW / srcH));
          }

          var drawX = Math.round((size - drawW) / 2);
          var drawY = Math.round((size - drawH) / 2);

          // Use the transparent-background source
          ctx.drawImage(highCanvas, drawX, drawY, drawW, drawH);

          return canvas.toDataURL('image/png');
        }

        return {
          p16: renderSquare(16, true),
          p32: renderSquare(32, true),
          p48: renderSquare(48, true),
          p180: renderSquare(180, false), // Apple touch icon (solid background as per Apple HIG)
          p192: renderSquare(192, true),
          p512: renderSquare(512, true)
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
    console.log('✓ Created client/public/favicon-16x16.png (', buf16.length, 'bytes)');

    fs.writeFileSync(path.join(clientPublicDir, 'favicon-32x32.png'), buf32);
    console.log('✓ Created client/public/favicon-32x32.png (', buf32.length, 'bytes)');

    fs.writeFileSync(path.join(clientPublicDir, 'apple-touch-icon.png'), buf180);
    console.log('✓ Created client/public/apple-touch-icon.png (', buf180.length, 'bytes)');

    fs.writeFileSync(path.join(clientPublicDir, 'favicon-192x192.png'), buf192);
    console.log('✓ Created client/public/favicon-192x192.png (', buf192.length, 'bytes)');

    fs.writeFileSync(path.join(clientPublicDir, 'favicon-512x512.png'), buf512);
    console.log('✓ Created client/public/favicon-512x512.png (', buf512.length, 'bytes)');

    // Build multi-resolution ICO containing 16x16, 32x32, and 48x48
    const icoBuf = buildIco([
      { width: 16, height: 16, buffer: buf16 },
      { width: 32, height: 32, buffer: buf32 },
      { width: 48, height: 48, buffer: buf48 }
    ]);

    fs.writeFileSync(path.join(clientPublicDir, 'favicon.ico'), icoBuf);
    console.log('✓ Created client/public/favicon.ico (', icoBuf.length, 'bytes, with 16x16, 32x32, 48x48)');

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
