const elements = {
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
  contactsSubtitle: ['Liste mit zufälligen Selektoren', 'Karten mit wechselnden IDs', 'Ideal für resilient UI-Tests']
};

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomToken(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

function applySynonyms() {
  elements.title.textContent = sample(synonymPool.title);
  elements.subtitle.textContent = sample(synonymPool.subtitle);
  elements.pipelineTitle.textContent = sample(synonymPool.pipelineTitle);
  elements.pipelineSubtitle.textContent = sample(synonymPool.pipelineSubtitle);
  elements.formTitle.textContent = sample(synonymPool.formTitle);
  elements.formSubtitle.textContent = sample(synonymPool.formSubtitle);
  elements.contactsTitle.textContent = sample(synonymPool.contactsTitle);
  elements.contactsSubtitle.textContent = sample(synonymPool.contactsSubtitle);
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
  node.classList.add(cssClass);

  return { label, id: `#${id}`, className: `.${cssClass}`, dataSelector: `[data-selector="${dataSelector}"]` };
}

function buildSelectorMap(entries) {
  if (!elements.selectorMap) return;
  elements.selectorMap.innerHTML = '';
  entries.forEach(entry => {
    if (!entry) return;
    const pill = document.createElement('div');
    pill.className = 'selector-pill';
    pill.innerHTML = `<strong>${entry.label}</strong> ${entry.id} | ${entry.className} | ${entry.dataSelector}`;
    elements.selectorMap.appendChild(pill);
  });
}

function randomizeSelectors() {
  const entries = [
    applyDynamicSelector(elements.hero, 'hero'),
    applyDynamicSelector(elements.title, 'title'),
    applyDynamicSelector(elements.subtitle, 'subtitle'),
    applyDynamicSelector(elements.pipelineList, 'pipeline-list'),
    applyDynamicSelector(elements.addForm, 'form'),
    applyDynamicSelector(elements.contactList, 'contact-list'),
    applyDynamicSelector(elements.formPanel, 'form-panel'),
    applyDynamicSelector(elements.contactsPanel, 'contacts-panel'),
    applyDynamicSelector(elements.selectorHint, 'selector-hint')
  ];
  buildSelectorMap(entries);
}

async function fetchContacts() {
  const res = await fetch('/api/contacts');
  const payload = await res.json();
  renderContacts(payload.contacts || []);
}

function renderContacts(list) {
  if (!elements.contactList) return;
  elements.contactList.innerHTML = '';
  list.forEach(contact => {
    const card = document.createElement('article');
    card.className = 'contact-card';
    applyDynamicSelector(card, `contact-${contact.id}`);

    const name = document.createElement('h3');
    name.textContent = contact.name;
    const email = document.createElement('p');
    email.className = 'muted';
    email.textContent = contact.email;
    const company = document.createElement('p');
    company.textContent = contact.company || 'Unbekannt';

    const tags = document.createElement('div');
    (contact.tags || []).forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'tag';
      pill.textContent = tag;
      tags.appendChild(pill);
    });

    card.append(name, email, company, tags);
    elements.contactList.appendChild(card);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company'),
    tags: (formData.get('tags') || '')
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
    form.reset();
    randomizeSelectors();
  } else {
    alert(data.error || 'Konnte Datensatz nicht anlegen');
  }
}

function init() {
  applySynonyms();
  randomizeSelectors();
  fetchContacts();
  elements.addForm?.addEventListener('submit', handleSubmit);
  elements.reshuffle?.addEventListener('click', randomizeSelectors);
}

init();
