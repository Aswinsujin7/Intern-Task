const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = __dirname;
const LEADS_FILE = path.join(__dirname, 'leads.json');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Ensure leads file exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

const requestHandler = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = decodeURI(parsedUrl.pathname);

  // Set standard security and CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Health Check
  if (req.method === 'GET' && reqPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'operational',
      service: 'AUTOGRAM - Instagram DM Automation Platform',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // API: Lead Capture Consultation Endpoint
  if (req.method === 'POST' && reqPath === '/api/lead-capture') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Cap at 1MB to prevent abuse
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { fullName, businessName, email, instagramUsername, businessType, requirements, pricingTier } = payload;

        const errors = [];
        if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
          errors.push('Full name must be at least 2 characters.');
        }
        if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
          errors.push('Business name is required.');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
          errors.push('A valid business email address is required.');
        }
        if (!instagramUsername || typeof instagramUsername !== 'string' || instagramUsername.trim().length < 2) {
          errors.push('Instagram username is required (e.g. @yourbrand).');
        }
        if (!businessType || typeof businessType !== 'string') {
          errors.push('Please select a business type.');
        }
        if (!requirements || (typeof requirements === 'string' && requirements.trim().length < 5) || (Array.isArray(requirements) && requirements.length === 0)) {
          errors.push('Please provide your automation requirements or select at least one module.');
        }

        if (errors.length > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Validation failed. Please correct the highlighted fields.',
            errors
          }));
          return;
        }

        // Clean & format
        const cleanHandle = instagramUsername.trim().startsWith('@') 
          ? instagramUsername.trim() 
          : `@${instagramUsername.trim()}`;

        const referenceId = `AUTOGRAM-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        const newLead = {
          id: referenceId,
          fullName: fullName.trim(),
          businessName: businessName.trim(),
          email: email.trim().toLowerCase(),
          instagramUsername: cleanHandle,
          businessType: businessType.trim(),
          requirements: Array.isArray(requirements) ? requirements : requirements.trim(),
          pricingTier: pricingTier || 'Custom / Not specified',
          status: 'New Consultation Request',
          submittedAt: new Date().toISOString(),
          ip: req.socket.remoteAddress
        };

        // Persist to leads.json
        let leads = [];
        try {
          const raw = fs.readFileSync(LEADS_FILE, 'utf8');
          leads = JSON.parse(raw);
          if (!Array.isArray(leads)) leads = [];
        } catch (e) {
          leads = [];
        }

        leads.push(newLead);
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          referenceId,
          lead: {
            fullName: newLead.fullName,
            businessName: newLead.businessName,
            email: newLead.email,
            instagramUsername: newLead.instagramUsername,
            pricingTier: newLead.pricingTier
          },
          message: `Consultation request confirmed! Thank you, ${newLead.fullName}. An AUTOGRAM specialist has been assigned to audit ${newLead.instagramUsername} and will email your personalized automation blueprint within 24 hours.`
        }));

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Malformed JSON payload received.',
          error: err.message
        }));
      }
    });
    return;
  }

  // Routing for Static Files & Clean URLs
  if (reqPath === '/' || reqPath === '/instagram-dm-automation') {
    reqPath = '/index.html';
  }

  // If path doesn't have an extension, try appending .html
  let filePath = path.join(PUBLIC_DIR, reqPath);

  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  // Prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for single-page routing if not an API or asset
      if (!path.extname(reqPath)) {
        const fallbackIndex = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(fallbackIndex)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          fs.createReadStream(fallbackIndex).pipe(res);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found - AUTOGRAM');
      return;
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const total = stats.size;

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': contentType
    });
    fs.createReadStream(normalizedPath).pipe(res);
  });
};

// Start server on standard ports (3000, 3001, 8080) for instant developer convenience
const portsToListen = process.env.PORT ? [parseInt(process.env.PORT, 10)] : [3000, 3001, 8080];
let activeServers = 0;

portsToListen.forEach(port => {
  const s = http.createServer(requestHandler);
  s.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Port already in use by another process, skip silently
    } else {
      console.error(`Port ${port} error:`, err.message);
    }
  });
  s.listen(port, () => {
    activeServers++;
    console.log(`✓ AUTOGRAM running at: http://localhost:${port}`);
  });
});
