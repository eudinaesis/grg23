(() => {
  const slides = [...document.querySelectorAll('[data-slide]')];
  const controls = document.querySelector('.deck-controls');
  if (!slides.length || !controls) return;
  const prev = controls.querySelector('[data-prev]');
  const next = controls.querySelector('[data-next]');
  const select = controls.querySelector('[data-slide-select]');
  const count = controls.querySelector('[data-current]');
  let current = 0;
  function render(index, updateURL = true) {
    current = Math.max(0, Math.min(slides.length - 1, Number.isFinite(index) ? index : 0));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    select.value = String(current);
    count.textContent = String(current + 1);
    if (updateURL) history.replaceState(null, '', '#slide-' + (current + 1));
  }
  function fromHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    render(match ? Number(match[1]) - 1 : 0, false);
  }
  prev.addEventListener('click', () => render(current - 1));
  next.addEventListener('click', () => render(current + 1));
  select.addEventListener('change', () => render(Number(select.value)));
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('keydown', event => {
    if (event.target.closest('button,a,input,textarea,select,[contenteditable],.table-scroll')) return;
    if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      render(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1));
    }
  });
  controls.querySelector('[data-fullscreen]').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.body.requestFullscreen();
    } catch { /* Browsers without fullscreen keep the ordinary slide view. */ }
  });
  controls.querySelector('[data-print]').addEventListener('click', () => window.print());
  controls.hidden = false;
  fromHash();
})();
