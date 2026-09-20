// Project data loading + homepage portfolio carousel.

const PROJECTS_DATA_URL = new URL('../data/projects.json', import.meta.url);
let cache = null;

export async function loadProjects() {
  if (cache) return cache;
  const res = await fetch(PROJECTS_DATA_URL);
  if (!res.ok) throw new Error(`Failed to load projects.json: ${res.status}`);
  const data = await res.json();
  cache = data.projects;
  return cache;
}

function projectCard(project) {
  const tags = (project.tags || [])
    .map((tag) => `<li class="tag">${tag}</li>`)
    .join('');
  return `
    <a class="project-card" href="project.html?id=${encodeURIComponent(project.id)}">
      <div class="project-card__media">
        <img src="${project.cover}" alt="" loading="lazy" width="640" height="480" />
      </div>
      <div class="project-card__body">
        <ul class="project-card__tags">${tags}</ul>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <span class="project-card__cta">Zobacz projekt →</span>
      </div>
    </a>`;
}

export async function initPortfolioCarousel() {
  const track = document.querySelector('[data-carousel-track]');
  if (!track) return;

  let projects;
  try {
    projects = await loadProjects();
  } catch (err) {
    track.innerHTML = '<p role="alert">Nie udało się teraz wczytać projektów.</p>';
    console.error(err);
    return;
  }

  track.innerHTML = projects.map(projectCard).join('');

  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const dotsWrap = document.querySelector('[data-carousel-dots]');
  const cards = Array.from(track.children);

  if (dotsWrap) {
    dotsWrap.innerHTML = cards
      .map((_, i) => `<button type="button" aria-label="Przejdź do projektu ${i + 1}"></button>`)
      .join('');
  }
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function cardStep() {
    return cards[0] ? cards[0].getBoundingClientRect().width + 24 : 360;
  }

  function updateActiveState() {
    const scrollLeft = track.scrollLeft;
    const step = cardStep();
    const index = Math.round(scrollLeft / step);
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    if (prevBtn) prevBtn.disabled = scrollLeft <= 4;
    if (nextBtn) nextBtn.disabled = scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  }

  prevBtn?.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  nextBtn?.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      track.scrollTo({ left: i * cardStep(), behavior: 'smooth' });
    });
  });

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: cardStep(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -cardStep(), behavior: 'smooth' }); }
  });

  track.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveState);
  }, { passive: true });

  updateActiveState();
}

initPortfolioCarousel();
