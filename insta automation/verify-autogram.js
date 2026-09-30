const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = 'C:\\Users\\aswin\\AppData\\Local\\Temp\\autogram-verify-temp';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyAutogram() {
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

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });

    // 1. Desktop Test (1440x900)
    console.log('\n>>> 2. Testing AUTOGRAM Landing Page (Desktop 1440x900)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3001/' });
    await delay(2000);

    // Click hero mockup button "Pricing"
    console.log('Testing Hero Mockup quick button click...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.hero-option-btn[data-choice="pricing"]');
        if (btn) btn.click();
      `
    });
    await delay(1000);

    // Click Chat Simulator button "Pricing"
    console.log('Testing Simulator quick option click...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('.sim-quick-btn[data-opt="pricing"]');
        if (btn) btn.click();
      `
    });
    await delay(1000);

    // Expand FAQ row
    console.log('Testing FAQ accordion expand...');
    await send('Runtime.evaluate', {
      expression: `
        const trigger = document.querySelector('.faq-trigger');
        if (trigger) trigger.click();
      `
    });
    await delay(600);

    // Capture Desktop Screenshot
    const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-desktop.png', Buffer.from(shotDesktop.data, 'base64'));
    console.log('✓ Saved autogram-desktop.png');

    // 2. Mobile Test (390x844)
    console.log('\n>>> 3. Testing AUTOGRAM Landing Page (Mobile 390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    await send('Runtime.evaluate', { expression: 'window.dispatchEvent(new Event("resize"));' });
    await delay(1000);

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-mobile.png', Buffer.from(shotMobile.data, 'base64'));
    console.log('✓ Saved autogram-mobile.png');

    // 3. Test Form Validation & Submission
    console.log('\n>>> 4. Testing Form Submission...');
    const formSubmitRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const name = document.getElementById('fullName');
        const biz = document.getElementById('businessName');
        const email = document.getElementById('workEmail');
        const ig = document.getElementById('instagramHandle');
        const cat = document.getElementById('businessType');
        
        name.value = 'Jordan Taylor';
        biz.value = 'Apex Growth Studio';
        email.value = 'jordan@apexgrowth.io';
        ig.value = '@apexgrowth';
        cat.value = 'Agency';
        
        const form = document.getElementById('autogramForm');
        form.dispatchEvent(new Event('submit', { cancelable: true }));
        
        await new Promise(r => setTimeout(r, 1200));
        
        const banner = document.getElementById('apiFeedbackBanner');
        return {
          bannerVisible: window.getComputedStyle(banner).display !== 'none',
          bannerText: banner.textContent
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Form Submission Test Result:', JSON.stringify(formSubmitRes.value, null, 2));

    // Console Errors
    console.log('\n>>> 5. Console Errors Check:');
    console.log('Errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.error('Console errors:', consoleErrors);
    } else {
      console.log('✓ ZERO console errors detected!');
    }

    ws.close();
    console.log('\n>>> AUTOGRAM VERIFICATION COMPLETE! <<<');

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    try {
      chromeProcess.kill('SIGTERM');
    } catch (e) {}
  }
}

verifyAutogram();
