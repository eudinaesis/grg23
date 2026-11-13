(() => {
  const $ = (selector) => document.querySelector(selector);
  const status = $('#status');
  const panel = $('#task-panel');
  const select = $('#task-select');
  const difficulties = ['easy', 'medium', 'hard'];
  const labels = { easy: ['Leicht', 'Easy'], medium: ['Mittel', 'Medium'], hard: ['Schwer', 'Hard'] };
  let tasks = [];
  let activeDifficulty = 'easy';
  let visibleTasks = [];
  let currentIndex = -1;

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'de'; }
  function text(de, en) { return lang() === 'en' ? en : de; }
  function setStatus(message) {
    status.hidden = false;
    status.replaceChildren(document.createTextNode(message));
    panel.hidden = true;
  }
  function updateCounts() {
    difficulties.forEach((difficulty) => {
      document.querySelector(`[data-count="${difficulty}"]`).textContent = tasks.filter((task) => task.difficulty === difficulty).length;
    });
  }
  function chooseDifficulty(difficulty) {
    activeDifficulty = difficulty;
    document.querySelectorAll('.difficulty-choice').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.difficulty === difficulty)));
    visibleTasks = tasks.filter((task) => task.difficulty === difficulty).sort((a, b) => a.year - b.year || a.tocOrder - b.tocOrder);
    select.replaceChildren();
    visibleTasks.forEach((task, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${task.warmup ? '★ ' : ''}${task.title} (${task.year})`;
      select.append(option);
    });
    select.disabled = visibleTasks.length === 0;
    $('#task-count').textContent = visibleTasks.length ? text(`${visibleTasks.length} Aufgaben`, `${visibleTasks.length} tasks`) : text('Keine Aufgaben in dieser Kategorie.', 'No tasks in this category.');
    if (visibleTasks.length) showTask(0);
    else { currentIndex = -1; setStatus(text('Keine Aufgaben in dieser Kategorie.', 'No tasks in this category.')); }
  }
  function appendPages(container, pages, kind, eager) {
    container.replaceChildren();
    (pages || []).forEach((page, index) => {
      const figure = document.createElement('figure');
      figure.className = 'page-card';
      figure.dataset.pageIndex = String(index);
      figure.dataset.imageKind = kind;
      const image = document.createElement('img');
      image.src = page.src;
      image.width = Number(page.width) || 800;
      image.height = Number(page.height) || 600;
      const task = visibleTasks[currentIndex];
      image.alt = `${task.title} (${task.year}) – ${kind === 'problem' ? text('Aufgabe', 'Problem') : text('Lösung', 'Solution')}, ${text('Seite', 'page')} ${index + 1}. ${text('Textversion unter dem Bild; Abbildungen sind zum Lösen nötig.', 'Text transcription below; diagrams are needed to solve the task.')}`;
      image.loading = eager ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => {
        figure.classList.add('image-error');
        const error = document.createElement('p');
        error.className = 'image-error-message';
        error.setAttribute('role', 'status');
        error.textContent = text('Bild konnte nicht geladen werden.', 'Image could not be loaded.');
        if (!figure.querySelector('.image-error-message')) figure.append(error);
      }, { once: true });
      const caption = document.createElement('figcaption');
      caption.textContent = text(`Seite ${index + 1}`, `Page ${index + 1}`);
      figure.append(image, caption);
      if (page.text) {
        const details = document.createElement('details');
        details.className = 'transcription';
        const summary = document.createElement('summary');
        summary.textContent = text('Textversion anzeigen', 'Show text transcription');
        const copy = document.createElement('p');
        copy.textContent = page.text;
        details.append(summary, copy);
        figure.append(details);
      }
      container.append(figure);
    });
  }
  function showTask(index) {
    currentIndex = index;
    const task = visibleTasks[index];
    if (!task) return;
    status.hidden = true;
    panel.hidden = false;
    $('#task-title').textContent = task.title;
    const sources = (task.sourcePages || []).map((page) => text(`Quelle S. ${page}`, `Source p. ${page}`)).join(', ');
    const printed = (task.printedPages || []).map((page) => text(`Druckseite ${page}`, `Printed p. ${page}`)).join(', ');
    $('#task-meta').textContent = [task.year, text(...labels[task.difficulty]), sources, printed].filter(Boolean).join(' · ');
    $('#warmup-badge').hidden = !task.warmup;
    select.value = String(index);
    $('#solution-details').open = false;
    appendPages($('#problem-pages'), task.problemImages, 'problem', true);
    $('#solution-pages').replaceChildren();
    $('#solution-pages').dataset.taskId = String(task.id);
    $('#previous-task').disabled = index <= 0;
    $('#next-task').disabled = index >= visibleTasks.length - 1;
    $('#task-count').textContent = text(`Aufgabe ${index + 1} von ${visibleTasks.length}`, `Task ${index + 1} of ${visibleTasks.length}`);
  }
  $('#solution-details').addEventListener('toggle', (event) => {
    if (!event.currentTarget.open) return;
    const task = visibleTasks[currentIndex];
    const container = $('#solution-pages');
    if (task && container.dataset.taskId === String(task.id) && !container.childElementCount) appendPages(container, task.solutionImages, 'solution', false);
  });
  document.querySelectorAll('.difficulty-choice').forEach((button) => button.addEventListener('click', () => chooseDifficulty(button.dataset.difficulty)));
  select.addEventListener('change', () => showTask(Number(select.value)));
  $('#previous-task').addEventListener('click', () => showTask(currentIndex - 1));
  $('#next-task').addEventListener('click', () => showTask(currentIndex + 1));
  document.querySelectorAll('[data-set-lang]').forEach((button) => button.addEventListener('click', () => {
    window.setTimeout(() => { if (currentIndex >= 0) showTask(currentIndex); }, 0);
  }));

  fetch('tasks.json')
    .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Expected an array of tasks');
      tasks = data.filter((task) => task && difficulties.includes(task.difficulty));
      updateCounts();
      if (!tasks.length) { setStatus(text('Noch keine Aufgaben vorhanden.', 'No tasks available yet.')); return; }
      const firstDifficulty = difficulties.find((difficulty) => tasks.some((task) => task.difficulty === difficulty));
      chooseDifficulty(firstDifficulty);
    })
    .catch(() => setStatus(text('Aufgaben konnten nicht geladen werden. Bitte später erneut versuchen.', 'Tasks could not be loaded. Please try again later.')));
})();
