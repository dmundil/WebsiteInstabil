const elements = {
  docTitle: document.querySelector('[data-role="doc-title"]'),
  title: document.querySelector('[data-role="page-title"]'),
  subtitle: document.querySelector('[data-role="page-subtitle"]'),
  pipelineTitle: document.querySelector('[data-role="pipeline-title"]'),
  pipelineSubtitle: document.querySelector('[data-role="pipeline-subtitle"]'),
  formTitle: document.querySelector('[data-role="form-title"]'),
  formSubtitle: document.querySelector('[data-role="form-subtitle"]'),
  contactsTitle: document.querySelector('[data-role="contacts-title"]'),
  contactsSubtitle: document.querySelector('[data-role="contacts-subtitle"]'),
  addForm: document.querySelector('[data-role="add-form"]'),
  contactList: document.querySelector('[data-role="contact-list"]'),
  selectorMap: document.querySelector('[data-role="selector-map"]'),
  reshuffle: document.querySelector('[data-role="reshuffle"]'),
  hero: document.querySelector('[data-role="hero"]'),
  pipelineList: document.querySelector('[data-role="pipeline-list"]'),
  formPanel: document.querySelector('[data-role="form-panel"]'),
  contactsPanel: document.querySelector('[data-role="contacts-panel"]'),
  selectorHint: document.querySelector('[data-role="selector-hint"]')
};

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
  contactsSubtitle: ['Liste mit zufälligen Selektoren', 'Karten mit wechselnden IDs', 'Ideal für resilient UI-Tests'],
  button: ['Speichern', 'Hinzufügen', 'Anlegen', 'Festhalten', 'Merken']
};

const fieldVariants = {
  name: {
    labels: ['Vollständiger Name', 'Kontaktname', 'Lead Name', 'Person', 'Ansprechpartner'],
    placeholders: ['z.B. Hannah CRM', 'Max Mustermann', 'Ava Pipeline', 'Kim Deal', 'Alex Kontakt'],
    aria: ['Name des Kontakts', 'Person eintragen', 'Lead im CRM']
  },
  email: {
    labels: ['E-Mail', 'Kontakt-E-Mail', 'Adresse', 'Mailkontakt', 'Inbox'],
    placeholders: ['kontakt@example.com', 'lead@firma.de', 'hallo@kundin.io', 'info@beispiel.com'],
    aria: ['E-Mail des Kontakts', 'Mailadresse eingeben', 'CRM Mailfeld']
  },
  company: {
    labels: ['Firma', 'Organisation', 'Unternehmen', 'Brand', 'Team'],
    placeholders: ['Firma', 'Organisation', 'Unternehmen', 'AG / GmbH', 'Crew'],
    aria: ['Firma des Kontakts', 'Unternehmen eintragen']
  },
  tags: {
    labels: ['Stichworte', 'Labels', 'Tags', 'Kategorien', 'Segmente'],
    placeholders: ['Pilot, Renewal', 'Demo, Follow-up', 'Churn-Risiko, Upgrade', 'VIP, Warm'],
    aria: ['Schlagworte für den Kontakt', 'Tags kommagetrennt']
  }
};

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomToken(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

function applySynonyms() {
  const nextTitle = sample(synonymPool.title);
  elements.title.textContent = nextTitle;
  elements.docTitle && (elements.docTitle.textContent = `${nextTitle} | Selektoren Roulette`);
  document.title = `${nextTitle} | Selektoren Roulette`;
  elements.subtitle && (elements.subtitle.textContent = sample(synonymPool.subtitle));
  elements.pipelineTitle && (elements.pipelineTitle.textContent = sample(synonymPool.pipelineTitle));
  elements.pipelineSubtitle && (elements.pipelineSubtitle.textContent = sample(synonymPool.pipelineSubtitle));
  elements.formTitle && (elements.formTitle.textContent = sample(synonymPool.formTitle));
  elements.formSubtitle && (elements.formSubtitle.textContent = sample(synonymPool.formSubtitle));
  elements.contactsTitle && (elements.contactsTitle.textContent = sample(synonymPool.contactsTitle));
  elements.contactsSubtitle && (elements.contactsSubtitle.textContent = sample(synonymPool.contactsSubtitle));
}

function applyDynamicSelector(node, label) {
  if (!node) return null;
  const previousClass = node.dataset.dynamicClass;
  if (previousClass) node.classList.remove(previousClass);

  const id = randomToken(`${label}-id`);
  const cssClass = randomToken(`${label}-cls`);
  const dataSelector = randomToken(`${label}-data`);

  node.id = id;
  node.dataset.selector = dataSelector;
  node.dataset.dynamicClass = cssClass;
  node.className = cssClass;

  return { label, id: `#${id}`, className: `.${cssClass}`, dataSelector: `[data-selector="${dataSelector}"]` };
}

function randomizeField(node, variantKey) {
  const wrapper = node?.closest('[data-role="field"]');
  const labelSpan = wrapper?.querySelector('span');
  const variant = fieldVariants[variantKey];

  if (!node || !variant) return;

  const nextName = randomToken(`${variantKey}-name`);
  const nextPlaceholder = sample(variant.placeholders);
  const ariaLabel = sample(variant.aria);

  node.name = nextName;
  node.placeholder = nextPlaceholder;
  node.setAttribute('aria-label', ariaLabel);

  if (labelSpan) labelSpan.textContent = sample(variant.labels);
}

function randomizeFields() {
  randomizeField(document.querySelector('[data-role="input-name"]'), 'name');
  randomizeField(document.querySelector('[data-role="input-email"]'), 'email');
  randomizeField(document.querySelector('[data-role="input-company"]'), 'company');
  randomizeField(document.querySelector('[data-role="input-tags"]'), 'tags');

  const submit = document.querySelector('[data-role="submit-button"]');
  if (submit) submit.textContent = sample(synonymPool.button);
}

function buildSelectorMap(entries) {
  if (!elements.selectorMap) return;
  elements.selectorMap.innerHTML = '';
  entries.forEach(entry => {
    if (!entry) return;
    const pill = document.createElement('div');
    pill.dataset.role = 'selector-pill';
    pill.innerHTML = `<strong>${entry.label}</strong> ${entry.id} | ${entry.className} | ${entry.dataSelector}`;
    elements.selectorMap.appendChild(pill);
  });
}

function randomizeSelectors() {
  const scopedEntries = Array.from(document.querySelectorAll('[data-role]')).map(node => {
    const label = node.dataset.role || node.tagName.toLowerCase();
    return applyDynamicSelector(node, label);
  });
  buildSelectorMap(scopedEntries);
}

function reshuffleUI() {
  applySynonyms();
  randomizeFields();
  randomizeSelectors();
}

async function fetchContacts() {
  const res = await fetch('/api/contacts');
  const payload = await res.json();
  renderContacts(payload.contacts || []);
  randomizeSelectors();
}

function renderContacts(list) {
  if (!elements.contactList) return;
  elements.contactList.innerHTML = '';
  list.forEach(contact => {
    const card = document.createElement('article');
    card.dataset.role = 'contact-card';
    applyDynamicSelector(card, `contact-${contact.id}`);

    const name = document.createElement('h3');
    name.textContent = contact.name;
    const email = document.createElement('p');
    email.dataset.role = 'contact-email';
    email.textContent = contact.email;
    const company = document.createElement('p');
    company.textContent = contact.company || 'Unbekannt';

    const tags = document.createElement('div');
    (contact.tags || []).forEach(tag => {
      const pill = document.createElement('span');
      pill.dataset.role = 'tag';
      pill.textContent = tag;
      tags.appendChild(pill);
    });

    card.append(name, email, company, tags);
    elements.contactList.appendChild(card);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const nameInput = document.querySelector('[data-role="input-name"]');
  const emailInput = document.querySelector('[data-role="input-email"]');
  const companyInput = document.querySelector('[data-role="input-company"]');
  const tagsInput = document.querySelector('[data-role="input-tags"]');

  const payload = {
    name: nameInput?.value || '',
    email: emailInput?.value || '',
    company: companyInput?.value || '',
    tags: (tagsInput?.value || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
  };

  const res = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok) {
    renderContacts(data.contacts || []);
    event.currentTarget.reset();
    reshuffleUI();
  } else {
    alert(data.error || 'Konnte Datensatz nicht anlegen');
  }
}

function init() {
  reshuffleUI();
  fetchContacts();
  elements.addForm?.addEventListener('submit', handleSubmit);
  elements.reshuffle?.addEventListener('click', reshuffleUI);
}

init();
