// Reusable image gallery: main preview + thumbnails + lightbox (keyboard, swipe, Esc).

export function initGallery(images, altPrefix = '') {
  const mainWrap = document.querySelector('[data-gallery-main]');
  const mainImg = mainWrap?.querySelector('img');
  const thumbsWrap = document.querySelector('[data-gallery-thumbs]');
  const lightbox = document.querySelector('[data-lightbox]');

  if (!mainImg || !thumbsWrap || !images.length) return;

  let current = 0;

  function altFor(i) {
    return `${altPrefix} — zdjęcie ${i + 1} z ${images.length}`;
  }

  function renderThumbs() {
    thumbsWrap.innerHTML = images
      .map((src, i) => `
        <button type="button" data-index="${i}" aria-current="${i === current}" aria-label="Pokaż zdjęcie ${i + 1}">
          <img src="${src}" alt="" loading="lazy" width="84" height="64" />
        </button>`)
      .join('');
  }

  function setCurrent(index, { fromLightbox = false } = {}) {
    current = (index + images.length) % images.length;
    mainImg.src = images[current];
    mainImg.alt = altFor(current);
    thumbsWrap.querySelectorAll('button').forEach((btn) => {
      btn.setAttribute('aria-current', String(Number(btn.dataset.index) === current));
    });
    if (lightbox && (lightbox.dataset.open === 'true' || fromLightbox)) {
      const lbImg = lightbox.querySelector('img');
      const counter = lightbox.querySelector('[data-lightbox-counter]');
      lbImg.src = images[current];
      lbImg.alt = altFor(current);
      if (counter) counter.textContent = `${current + 1} / ${images.length}`;
    }
  }

  function openLightbox(index) {
    if (!lightbox) return;
    setCurrent(index, { fromLightbox: true });
    lightbox.dataset.open = 'true';
    lightbox.querySelector('.lightbox__close')?.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.dataset.open = 'false';
    document.body.style.overflow = '';
    mainWrap.focus?.();
  }

  renderThumbs();
  setCurrent(0);

  thumbsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-index]');
    if (btn) setCurrent(Number(btn.dataset.index));
  });

  mainWrap.addEventListener('click', () => openLightbox(current));
  mainWrap.setAttribute('tabindex', '0');
  mainWrap.setAttribute('role', 'button');
  mainWrap.setAttribute('aria-label', 'Otwórz zdjęcie na pełnym ekranie');
  mainWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(current); }
  });

  if (lightbox) {
    lightbox.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev')?.addEventListener('click', () => setCurrent(current - 1, { fromLightbox: true }));
    lightbox.querySelector('.lightbox__next')?.addEventListener('click', () => setCurrent(current + 1, { fromLightbox: true }));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (lightbox.dataset.open !== 'true') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setCurrent(current + 1, { fromLightbox: true });
      if (e.key === 'ArrowLeft') setCurrent(current - 1, { fromLightbox: true });
    });

    let touchStartX = null;
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) setCurrent(current + (dx < 0 ? 1 : -1), { fromLightbox: true });
      touchStartX = null;
    });
  }
}
