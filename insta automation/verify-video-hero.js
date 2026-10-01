const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMP_USER_DATA = 'C:\\Users\\aswin\\AppData\\Local\\Temp\\autogram-video-verify-temp';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('>>> Starting server process...');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  await delay(1200);

  console.log('>>> Launching Chrome Headless CDP...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${TEMP_USER_DATA}`
  ], { stdio: 'ignore' });

  await delay(1500);

  try {
    const versionRes = await fetch('http://localhost:9225/json/new', { method: 'PUT' });
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

    // 1. Desktop Test (1440x900)
    console.log('\n>>> 1. Loading Desktop (1440x900)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3001/' });
    await delay(2500);

    // Evaluate video status
    const videoStatus = await send('Runtime.evaluate', {
      expression: `(() => {
        const v = document.getElementById('heroBgVideo');
        return {
          exists: !!v,
          src: v ? v.currentSrc : null,
          paused: v ? v.paused : null,
          readyState: v ? v.readyState : null,
          videoWidth: v ? v.videoWidth : null,
          videoHeight: v ? v.videoHeight : null,
          currentTime: v ? v.currentTime : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Hero Video Status:', videoStatus.result.value);

    // Capture Desktop Hero Screenshot
    const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-video-hero-desktop.png', Buffer.from(shotDesktop.data, 'base64'));
    console.log('✓ Saved autogram-video-hero-desktop.png');

    // 2. Test Luxury Toggle Button
    console.log('Testing video toggle button click...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.getElementById('heroVideoToggleBtn');
        if (btn) btn.click();
      `
    });
    await delay(600);

    const pausedStatus = await send('Runtime.evaluate', {
      expression: `document.getElementById('heroBgVideo').paused`,
      returnByValue: true
    });
    console.log('Video paused after toggle:', pausedStatus.result.value);

    // Toggle again to play
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.getElementById('heroVideoToggleBtn');
        if (btn) btn.click();
      `
    });
    await delay(600);

    // 3. Mobile Test (390x844)
    console.log('\n>>> 2. Loading Mobile (390x844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', { expression: 'window.dispatchEvent(new Event("resize"));' });
    await delay(1500);

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('autogram-video-hero-mobile.png', Buffer.from(shotMobile.data, 'base64'));
    console.log('✓ Saved autogram-video-hero-mobile.png');

    console.log('\nConsole Errors:', consoleErrors.length ? consoleErrors : 'None (0 errors!)');

    await send('Browser.close');
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    chromeProcess.kill();
    serverProcess.kill();
    process.exit(0);
  }
}

runVerification();
