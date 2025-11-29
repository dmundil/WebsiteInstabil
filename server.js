const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Data
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

const synonymPool = {
  title: ['CRM Labor', 'Beziehungs-Navigator', 'Pipeline Cockpit', 'Customer Orbit', 'Kontaktraum'],
  subtitle: [
    'Instabile UI zum Trainieren robuster Automatisierung',
    'Selectors tanzen bei jedem Besuch',
    'Perfekt zum Testen unzuverlässiger Oberflächen',
    'Synonyme überall, IDs nirgends stabil',
    'Hier lernt Dein Bot geduldig sein'
  ],
  pipelineTitle: ['Deal-Funnel', 'Vertriebsfluss', 'Umsatzbahn', 'Akquise-Route', 'Opportunity-Pfad'],
  pipelineSubtitle: ['Etappen mit wechselnden Selektoren', 'Synonyme pro Reload', 'Keine ID bleibt gleich', 'Stress-Test für Scraper'],
  formTitle: ['Lead erfassen', 'Kontakt loggen', 'Beziehung anlegen', 'CRM Datensatz erstellen', 'Neuaufnahme'],
  formSubtitle: ['Formular mit rotierten Klassen', 'IDs würfeln bei jedem Klick', 'Synonymisierte Felder'],
  contactsTitle: ['Adressbuch', 'Kontaktregister', 'Beziehungsarchiv', 'CRM Board', 'Customer Hub'],
  contactsSubtitle: ['Liste mit zufälligen Selektoren', 'Karten mit wechselnden IDs', 'Ideal für resilient UI-Tests']
};

const knownClasses = [
  'page-header', 'badge', 'subtitle', 'grid', 'panel', 'panel-header', 'muted',
  'pipeline-list', 'field', 'primary', 'ghost', 'stack', 'contact-list',
  'contact-card', 'tag', 'info-strip', 'selector-map', 'selector-pill', 'footer'
];

// Simple rule for field names (Global for demo purposes)
const FIELD_MAPPING = {
  name: 'x_8f2',
  email: 'z_9a1',
  company: 'q_3b7',
  tags: 'w_2c9',
  honeypot: 'h_p0t' // Hidden field
};

// Cache templates in memory
let templateHtml = '';
let templateCss = '';

try {
  templateHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  templateCss = fs.readFileSync(path.join(PUBLIC_DIR, 'styles.css'), 'utf8');
} catch (err) {
  console.error('Failed to load templates:', err);
  process.exit(1);
}

function randomString(length = 6) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

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

function processHTML() {
  let html = templateHtml;
  let css = templateCss;

  // 1. Generate random class map for this request
  const classMap = {};
  knownClasses.forEach(cls => {
    classMap[cls] = 'c_' + randomString(8);
  });

  // 2. Obfuscate CSS
  let processedCSS = css;
  // Sort by length desc to avoid partial replacements
  knownClasses.sort((a, b) => b.length - a.length).forEach(cls => {
      const regex = new RegExp(`\\.${cls}(?![\\w-])`, 'g');
      processedCSS = processedCSS.replace(regex, `.${classMap[cls]}`);
  });

  // 3. Obfuscate HTML Classes
  knownClasses.forEach(cls => {
      const regex = new RegExp(`(?<=\\s|"|')${cls}(?=\\s|"|')`, 'g');
      html = html.replace(regex, classMap[cls]);
  });

  // 4. Synonym Replacements & data-role cleanup
  const replacements = [
      { role: 'page-title', text: sample(synonymPool.title) },
      { role: 'page-subtitle', text: sample(synonymPool.subtitle) },
      { role: 'pipeline-title', text: sample(synonymPool.pipelineTitle) },
      { role: 'pipeline-subtitle', text: sample(synonymPool.pipelineSubtitle) },
      { role: 'form-title', text: sample(synonymPool.formTitle) },
      { role: 'form-subtitle', text: sample(synonymPool.formSubtitle) },
      { role: 'contacts-title', text: sample(synonymPool.contactsTitle) },
      { role: 'contacts-subtitle', text: sample(synonymPool.contactsSubtitle) },
  ];

  replacements.forEach(rep => {
      const regex = new RegExp(`(<[^>]+data-role="${rep.role}"[^>]*>)([^<]*)(<)`, 'g');
      html = html.replace(regex, `$1${rep.text}$3`);
  });

  // 5. Remove data-roles
  html = html.replace(/\s?data-role="[^"]*"/g, '');

  // 6. Semantic tag removal
  const tags = ['header', 'main', 'section', 'footer', 'nav', 'article'];
  tags.forEach(tag => {
      const startRegex = new RegExp(`<${tag}`, 'g');
      const endRegex = new RegExp(`</${tag}>`, 'g');
      html = html.replace(startRegex, '<div');
      html = html.replace(endRegex, '</div>');
  });

  // 7. Form Field Names
  Object.keys(FIELD_MAPPING).forEach(key => {
      if (key === 'honeypot') return;
      const regex = new RegExp(`name="${key}"`, 'g');
      html = html.replace(regex, `name="${FIELD_MAPPING[key]}"`);
  });

  // 8. Inject Honeypot
  const honeypotField = `<div style="position:absolute;left:-9999px;top:-9999px;">
    <label for="${FIELD_MAPPING.honeypot}">Website</label>
    <input type="text" id="${FIELD_MAPPING.honeypot}" name="${FIELD_MAPPING.honeypot}" tabindex="-1" autocomplete="off">
  </div>`;
  html = html.replace(/(<form[^>]*>)/, `$1${honeypotField}`);

  // 9. Inject CSS
  html = html.replace(/<link rel="stylesheet" href="\/styles.css" \/>/, '');
  html = html.replace('</head>', `<style>${processedCSS}</style></head>`);

  // 10. Remove script tag
  html = html.replace('<script src="/main.js"></script>', '');

  // 11. Add client-side script for form handling
  const clientScript = `
    <script>
      document.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {};
        formData.forEach((value, key) => payload[key] = value);

        try {
          const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            window.location.reload();
          } else {
            alert('Error');
          }
        } catch (err) { console.error(err); }
      });

      const map = document.querySelector('.${classMap['selector-map']}');
      if(map) map.innerHTML = '<em>Obfuscated</em>';
    </script>
  `;
  html = html.replace('</body>', `${clientScript}</body>`);

  // 12. Pre-render contacts
  let contactsHtml = '';
  contacts.forEach(c => {
     let tagsHtml = c.tags.map(t => `<span class="${classMap['tag']}">${t}</span>`).join('');
     contactsHtml += `
       <div class="${classMap['contact-card']}">
         <h3>${c.name}</h3>
         <p class="${classMap['muted']}">${c.email}</p>
         <p>${c.company}</p>
         <div>${tagsHtml}</div>
       </div>
     `;
  });

  // Note: We need to match the div that originally had class="contact-list"
  // It has been renamed to classMap['contact-list']
  // Use regex that allows content inside (whitespace or empty)
  const listRegex = new RegExp(`(<div class="${classMap['contact-list']}">)([\\s\\S]*?)(</div>)`);
  html = html.replace(listRegex, `$1${contactsHtml}$3`);

  return html;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = processHTML();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (e) {
      console.error(e);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
    return;
  }

  if (url.pathname === '/api/contacts' && req.method === 'POST') {
    try {
      const body = await parseBody(req);

      if (body[FIELD_MAPPING.honeypot]) {
         console.log('Honeypot triggered');
         sendJson(res, 200, { success: true });
         return;
      }

      const name = body[FIELD_MAPPING.name];
      const email = body[FIELD_MAPPING.email];
      const company = body[FIELD_MAPPING.company];
      const tagsStr = body[FIELD_MAPPING.tags];

      if (!name || !email) {
        sendJson(res, 422, { error: 'Name and email are required' });
        return;
      }

      const newContact = {
        id: idCounter++,
        name,
        email,
        company: company || 'Unspecified',
        tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      contacts.unshift(newContact);
      sendJson(res, 201, { contact: newContact, contacts });
    } catch (err) {
      sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Obfuscated CRM running on http://localhost:${PORT}`);
});
