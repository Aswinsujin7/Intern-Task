const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = 'C:\\Users\\aswin\\AppData\\Local\\Temp\\autogram-full-temp';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureFullPage() {
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${TEMP_USER_DATA}`
  ], { stdio: 'ignore' });

  await delay(1500);

  try {
    const versionRes = await fetch('http://localhost:9223/json/new', { method: 'PUT' });
    const target = await versionRes.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise(resolve => ws.onopen = resolve);

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3001/' });
    await delay(1800);

    // Full page screenshot via Page.captureScreenshot with captureBeyondViewport
    const fullShot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });

    fs.writeFileSync('autogram-fullpage.png', Buffer.from(fullShot.data, 'base64'));
    console.log('✓ Full page screenshot saved to autogram-fullpage.png');

    // Scroll to interactive demo & capture
    await send('Runtime.evaluate', { expression: 'document.getElementById("demo").scrollIntoView();' });
    await delay(500);
    const demoShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-demo-section.png', Buffer.from(demoShot.data, 'base64'));
    console.log('✓ Demo section screenshot saved to autogram-demo-section.png');

    // Scroll to pricing & capture
    await send('Runtime.evaluate', { expression: 'document.getElementById("pricing").scrollIntoView();' });
    await delay(500);
    const pricingShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-pricing-section.png', Buffer.from(pricingShot.data, 'base64'));
    console.log('✓ Pricing section screenshot saved to autogram-pricing-section.png');

    // Scroll to final CTA & capture
    await send('Runtime.evaluate', { expression: 'document.getElementById("finalCta").scrollIntoView();' });
    await delay(500);
    const ctaShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-final-cta.png', Buffer.from(ctaShot.data, 'base64'));
    console.log('✓ Final CTA screenshot saved to autogram-final-cta.png');

    ws.close();
  } catch (e) {
    console.error('Error capturing full page:', e);
  } finally {
    try {
      chromeProcess.kill('SIGTERM');
    } catch (e) {}
  }
}

captureFullPage();
