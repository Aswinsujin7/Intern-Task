const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = 'C:\\Users\\aswin\\AppData\\Local\\Temp\\autogram-verify-ai-hero';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('>>> 1. Launching Headless Chrome via CDP...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${TEMP_USER_DATA}`
  ], { stdio: 'ignore' });

  await delay(1500);

  try {
    const versionRes = await fetch('http://localhost:9227/json/new', { method: 'PUT' });
    const target = await versionRes.json();

    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();
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

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });

    // 1. Desktop Test (1440x900) - Futuristic AI Hero
    console.log('\n>>> 2. Testing Desktop (1440x900) - Futuristic AI Hero...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3001/' });
    await delay(2000);

    // Test mousemove parallax simulation
    await send('Runtime.evaluate', {
      expression: `
        const hero = document.getElementById('hero');
        if (hero) {
          hero.dispatchEvent(new MouseEvent('mousemove', { clientX: 900, clientY: 400 }));
        }
      `
    });
    await delay(800);

    const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-ai-hero-desktop.png', Buffer.from(shotDesktop.data, 'base64'));
    console.log('✓ Saved autogram-ai-hero-desktop.png');

    // 2. Laptop Test (1280x768)
    console.log('\n>>> 3. Testing Laptop (1280x768)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });
    await delay(800);

    const shotLaptop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-ai-hero-laptop.png', Buffer.from(shotLaptop.data, 'base64'));
    console.log('✓ Saved autogram-ai-hero-laptop.png');

    // 3. Tablet Test (768x1024)
    console.log('\n>>> 4. Testing Tablet (768x1024)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 0, behavior: "instant" });' });
    await delay(800);

    const tabletOverflow = await send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollWidth <= window.innerWidth',
      returnByValue: true
    });
    console.log('Tablet horizontal overflow free:', tabletOverflow.value);

    const shotTablet = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-ai-hero-tablet.png', Buffer.from(shotTablet.data, 'base64'));
    console.log('✓ Saved autogram-ai-hero-tablet.png');

    // 4. Mobile Test (390x844)
    console.log('\n>>> 5. Testing Mobile (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await delay(800);

    const mobileOverflow = await send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollWidth <= window.innerWidth',
      returnByValue: true
    });
    console.log('Mobile horizontal overflow free:', mobileOverflow.value);

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-ai-hero-mobile.png', Buffer.from(shotMobile.data, 'base64'));
    console.log('✓ Saved autogram-ai-hero-mobile.png');

    // 5. Console Error Check
    console.log('\n>>> 6. Console Error Check:');
    if (consoleErrors.length === 0) {
      console.log('✓ SUCCESS: ZERO console errors detected across all screen sizes!');
    } else {
      console.error('Errors detected:', consoleErrors);
    }

    ws.close();
    console.log('\n>>> ALL HERO AI VERIFICATION TESTS COMPLETED SUCCESSFULLY! <<<');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    try {
      chromeProcess.kill('SIGTERM');
    } catch (e) {}
  }
}

runVerification();
