const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const contacts = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    company: 'Analytical Engines',
    tags: ['VIP', 'Renewal Q2']
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    company: 'Compilers Inc.',
    tags: ['Expansion', 'Pilot']
  }
];
let idCounter = contacts.length + 1;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function serveStatic(filePath, res) {
  const absolute = path.join(PUBLIC_DIR, filePath);
  if (!absolute.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const ext = path.extname(absolute);
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  }[ext] || 'text/plain';

  fs.readFile(absolute, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/contacts' && req.method === 'GET') {
    sendJson(res, 200, { contacts });
    return;
  }

  if (url.pathname === '/api/contacts' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.name || !body.email) {
        sendJson(res, 422, { error: 'Name and email are required' });
        return;
      }
      const newContact = {
        id: idCounter++,
        name: body.name,
        email: body.email,
        company: body.company || 'Unspecified',
        tags: Array.isArray(body.tags) ? body.tags : []
      };
      contacts.unshift(newContact);
      sendJson(res, 201, { contact: newContact, contacts });
    } catch (err) {
      sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
    return;
  }

  if (url.pathname === '/api/contacts' && req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  serveStatic(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Dynamic CRM sandbox running on http://localhost:${PORT}`);
});
