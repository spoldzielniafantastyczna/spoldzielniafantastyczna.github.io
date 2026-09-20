// Shared site chrome: mobile nav toggle + site.json driven content (contact links, footer year).

const SITE_DATA_URL = new URL('../data/site.json', import.meta.url);

export async function loadSiteData() {
  const res = await fetch(SITE_DATA_URL);
  if (!res.ok) throw new Error(`Failed to load site.json: ${res.status}`);
  return res.json();
}

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
      nav.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

function applySiteDataToDom(site) {
  document.querySelectorAll('[data-site="email"]').forEach((el) => {
    el.textContent = site.email;
    if (el.tagName === 'A') el.href = `mailto:${site.email}`;
  });
  document.querySelectorAll('[data-site="phone"]').forEach((el) => {
    const item = el.closest('[data-site-item="phone"]');
    if (!site.phone) {
      if (item) item.hidden = true;
      return;
    }
    el.textContent = site.phone;
    if (el.tagName === 'A') el.href = `tel:${site.phone.replace(/\s+/g, '')}`;
  });
  document.querySelectorAll('[data-site="makerworld"]').forEach((el) => {
    if (el.tagName === 'A') el.href = site.makerworld;
  });
  document.querySelectorAll('[data-site="year"]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function initContactForm(site) {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const subject = data.get('subject') || 'Kontakt ze strony spoldzielniafantastyczna.pl';
    const message = data.get('message') || '';

    const body = `${message}\n\n---\nOd: ${name} (${email})`;
    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}

export async function initSiteChrome() {
  initNavToggle();
  try {
    const site = await loadSiteData();
    applySiteDataToDom(site);
    initContactForm(site);
  } catch (err) {
    console.error(err);
  }
}

initSiteChrome();
