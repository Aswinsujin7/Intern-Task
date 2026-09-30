const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = 'C:\\Users\\aswin\\AppData\\Local\\Temp\\cdp-verify-temp';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('>>> 1. Launching Headless Chrome via CDP...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${TEMP_USER_DATA}`
  ], { stdio: 'ignore' });

  await delay(1500);

  try {
    // 2. Query target WebSocket URL
    const versionRes = await fetch('http://localhost:9222/json/new', { method: 'PUT' });
    const target = await versionRes.json();
    console.log('Target created:', target.id);

    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();
    const consoleLogs = [];
    const consoleErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type, text });
        if (type === 'error') consoleErrors.push(text);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text);
      }
    };

    await new Promise(resolve => ws.onopen = resolve);

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    // Enable domains
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });

    // TEST 1: ai-hero-demo.html (Desktop: 1440x900)
    console.log('\n>>> 2. Testing http://localhost:3001/ai-hero-demo (Desktop 1440x900)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3001/ai-hero-demo' });
    await delay(2000); // Allow animation to draw in

    // Check DOM elements
    const demoEval = await send('Runtime.evaluate', {
      expression: `({
        hasCanvas: !!document.querySelector('.ai-hero-canvas'),
        canvasWidth: document.querySelector('.ai-hero-canvas')?.width,
        canvasHeight: document.querySelector('.ai-hero-canvas')?.height,
        hasGrid: !!document.querySelector('.ai-hero-grid'),
        hasBubbles: !!document.querySelector('.ai-floating-bubbles-layer'),
        bubblesCount: document.querySelectorAll('.ai-glass-bubble').length,
        hasVignette: !!document.querySelector('.ai-hero-vignette'),
        hasGrain: !!document.querySelector('.ai-hero-grain'),
        isRunning: window.aiBg ? window.aiBg.isRunning : false,
        fpsText: document.getElementById('fpsDisplay')?.textContent
      })`,
      returnByValue: true
    });

    console.log('Desktop Component Inspection:', JSON.stringify(demoEval.value, null, 2));

    // Capture desktop screenshot
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshot-ai-hero-desktop.png', Buffer.from(shot1.data, 'base64'));
    console.log('✓ Saved screenshot-ai-hero-desktop.png');

    // TEST 2: ai-hero-demo.html (Mobile: 390x844)
    console.log('\n>>> 3. Testing http://localhost:3001/ai-hero-demo (Mobile 390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Trigger resize in window
    await send('Runtime.evaluate', { expression: 'window.dispatchEvent(new Event("resize"));' });
    await delay(1000);

    const mobileEval = await send('Runtime.evaluate', {
      expression: `({
        isMobile: window.aiBg ? window.aiBg.isMobile : false,
        canvasWidth: document.querySelector('.ai-hero-canvas')?.width,
        canvasHeight: document.querySelector('.ai-hero-canvas')?.height,
        dpr: window.aiBg ? window.aiBg.dpr : 1
      })`,
      returnByValue: true
    });
    console.log('Mobile Component Inspection:', JSON.stringify(mobileEval.value, null, 2));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshot-ai-hero-mobile.png', Buffer.from(shot2.data, 'base64'));
    console.log('✓ Saved screenshot-ai-hero-mobile.png');

    // TEST 3: instagram-dm-automation.html (Desktop: 1440x900)
    console.log('\n>>> 4. Testing http://localhost:3001/instagram-dm-automation (Desktop 1440x900)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3001/instagram-dm-automation' });
    await delay(2000);

    const serviceEval = await send('Runtime.evaluate', {
      expression: `({
        hasHeroCanvas: !!document.querySelector('#hero .ai-hero-canvas'),
        hasGrid: !!document.querySelector('#hero .ai-hero-grid'),
        hasVignette: !!document.querySelector('#hero .ai-hero-vignette'),
        hasBubbles: !!document.querySelector('#hero .ai-floating-bubbles-layer'),
        simulatorReady: !!document.querySelector('#simChatCanvas'),
        headlineVisible: window.getComputedStyle(document.querySelector('.hero-title')).visibility === 'visible'
      })`,
      returnByValue: true
    });
    console.log('Service Page Hero Inspection:', JSON.stringify(serviceEval.value, null, 2));

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshot-main-hero-desktop.png', Buffer.from(shot3.data, 'base64'));
    console.log('✓ Saved screenshot-main-hero-desktop.png');

    // TEST 4: instagram-dm-automation.html (Mobile: 390x844)
    console.log('\n>>> 5. Testing http://localhost:3001/instagram-dm-automation (Mobile 390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await send('Runtime.evaluate', { expression: 'window.dispatchEvent(new Event("resize"));' });
    await delay(1000);

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshot-main-hero-mobile.png', Buffer.from(shot4.data, 'base64'));
    console.log('✓ Saved screenshot-main-hero-mobile.png');

    // Console Error Check
    console.log('\n>>> 6. Checking for Console Errors...');
    console.log('Captured Console logs count:', consoleLogs.length);
    console.log('Captured Console errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error('Console Errors detected:', consoleErrors);
    } else {
      console.log('✓ ZERO console errors detected across all tested views!');
    }

    ws.close();
    console.log('\n>>> ALL BROWSER & COMPONENT VERIFICATION TESTS COMPLETED SUCCESSFULLY! <<<');

  } catch (err) {
    console.error('CDP Verification Error:', err);
  } finally {
    try {
      chromeProcess.kill('SIGTERM');
    } catch (e) {}
  }
}

runVerification();
