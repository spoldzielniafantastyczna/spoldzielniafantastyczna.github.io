// Project detail page: renders one project from data/projects.json, wires up
// the gallery, prev/next pager, and (if present) lazily loads the STL viewer.

import { loadProjects } from './projects.js';
import { initGallery } from './gallery.js';

function getRequestedId() {
  return new URLSearchParams(window.location.search).get('id');
}

function renderNotFound(root) {
  root.innerHTML = `
    <div class="container section">
      <p class="eyebrow">404</p>
      <h1>Nie znaleziono projektu</h1>
      <p class="project-hero__desc">Ten projekt mógł zostać zmieniony lub usunięty.</p>
      <p style="margin-top:1.5rem"><a class="btn btn--primary" href="index.html#projects">Wróć do projektów</a></p>
    </div>`;
}

function renderProject(project, { prev, next }) {
  document.title = `${project.title} — Spółdzielnia Fantastyczna`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', project.description);

  const canonicalUrl = `https://spoldzielniafantastyczna.pl/project.html?id=${encodeURIComponent(project.id)}`;
  document.querySelector('[data-canonical]')?.setAttribute('href', canonicalUrl);
  document.querySelector('[data-og-url]')?.setAttribute('content', canonicalUrl);

  const tags = (project.tags || []).map((t) => `<li class="tag">${t}</li>`).join('');

  document.querySelector('[data-project-title]').textContent = project.title;
  document.querySelector('[data-project-tags]').innerHTML = tags;
  document.querySelector('[data-project-desc]').textContent = project.description;

  const sourceEl = document.querySelector('[data-project-source]');
  if (project.source) {
    sourceEl.hidden = false;
    sourceEl.querySelector('a').href = project.source;
  } else {
    sourceEl.hidden = true;
  }

  const prevBtn = document.querySelector('[data-project-prev]');
  const nextBtn = document.querySelector('[data-project-next]');
  prevBtn.href = `project.html?id=${encodeURIComponent(prev.id)}`;
  prevBtn.setAttribute('aria-label', `Poprzedni projekt: ${prev.title}`);
  nextBtn.href = `project.html?id=${encodeURIComponent(next.id)}`;
  nextBtn.setAttribute('aria-label', `Następny projekt: ${next.title}`);

  initGallery(project.images, project.title);

  const viewerSection = document.querySelector('[data-viewer-section]');
  if (project.stl) {
    viewerSection.hidden = false;
    import('./stl-viewer.js').then(({ initStlViewer }) => {
      const container = viewerSection.querySelector('.model-viewer');
      initStlViewer(container, project.stl);
    });
  } else {
    viewerSection.hidden = true;
  }
}

async function init() {
  const root = document.querySelector('main');
  const id = getRequestedId();
  let projects;
  try {
    projects = await loadProjects();
  } catch (err) {
    console.error(err);
    renderNotFound(root);
    return;
  }

  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    renderNotFound(root);
    return;
  }

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  renderProject(project, { prev, next });
}

init();
