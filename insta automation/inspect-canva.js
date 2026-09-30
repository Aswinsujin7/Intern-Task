const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspect() {
  const cp = spawn(CHROME_PATH, ['--headless=new', '--remote-debugging-port=9226', '--no-first-run'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://localhost:9226/json/new', { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

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

    await new Promise(r => ws.onopen = r);

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'https://www.canva.com/templates/EAGi6RD-Djg/' });
    await new Promise(r => setTimeout(r, 3500));

    const data = await send('Runtime.evaluate', {
      expression: `(() => {
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
        const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
        const ogDesc = document.querySelector('meta[property="og:description"]')?.content || '';
        const h1 = document.querySelector('h1')?.textContent || '';
        const title = document.title;
        const text = document.body.innerText.slice(0, 1000);
        return { title, ogTitle, ogImage, ogDesc, h1, text };
      })()`,
      returnByValue: true
    });

    console.log('RESULT:', JSON.stringify(data.value, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('canva-preview.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved canva-preview.png');

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    try { cp.kill(); } catch (e) {}
  }
}

inspect();
