(() => {
  const $ = (selector) => document.querySelector(selector);
  const status = $('#status');
  const panel = $('#task-panel');
  const select = $('#task-select');
  const gradeSelect = $('#grade-select');
  const solutionDetails = $('#solution-details');
  const solutionPages = $('#solution-pages');
  const grades = ['3-4', '5-6', '7-8', '9-10', '11-13'];
  const difficulties = ['easy', 'medium', 'hard'];
  const labels = {
    easy: ['Leicht', 'Easy'],
    medium: ['Mittel', 'Medium'],
    hard: ['Schwer', 'Hard'],
  };

  let tasks = [];
  let grade = '5-6';
  let difficulty = '';
  let visibleTasks = [];
  let currentIndex = -1;
  let ready = false;
  let loadFailed = false;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'de';
  const text = (de, en) => lang() === 'en' ? en : de;

  function setStatus(message) {
    status.hidden = false;
    status.textContent = message;
    panel.hidden = true;
    solutionDetails.open = false;
    solutionPages.replaceChildren();
    $('#previous-task').disabled = true;
    $('#next-task').disabled = true;
  }

  function rating(task) {
    const value = task.ratings?.[grade];
    if (value === 'einfach' || value === 'leicht') return 'easy';
    if (value === 'mittel') return 'medium';
    if (value === 'schwer') return 'hard';
    return null;
  }

  function updateGradeOptions() {
    const selectedGrade = gradeSelect.value || grade;
    gradeSelect.replaceChildren(...grades.map((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${text('Schulstufen', 'Grades')} ${value.replace('-', '–')}`;
      return option;
    }));
    gradeSelect.value = grades.includes(selectedGrade) ? selectedGrade : grade;
  }

  function render() {
    if (!ready) return;

    updateGradeOptions();
    gradeSelect.value = grade;
    const available = difficulties.filter((value) =>
      tasks.some((task) => rating(task) === value),
    );
    if (!available.includes(difficulty)) difficulty = available[0] || '';

    $('.difficulty').disabled = available.length === 0;
    document.querySelectorAll('.difficulty-choice').forEach((button) => {
      const validDifficulty = difficulties.includes(button.dataset.difficulty);
      button.disabled = !validDifficulty || !available.includes(button.dataset.difficulty);
      button.setAttribute('aria-pressed', String(
        validDifficulty && button.dataset.difficulty === difficulty,
      ));
      button.querySelector('.count').textContent = String(
        validDifficulty
          ? tasks.filter((task) => rating(task) === button.dataset.difficulty).length
          : 0,
      );
    });

    visibleTasks = tasks
      .filter((task) => difficulties.includes(difficulty) && rating(task) === difficulty)
      .sort((a, b) => a.year - b.year || a.tocOrder - b.tocOrder);
    select.replaceChildren(...visibleTasks.map((task, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${task.title} (${task.year})`;
      return option;
    }));
    select.disabled = visibleTasks.length === 0;
    $('#task-count').textContent = visibleTasks.length
      ? text(`${visibleTasks.length} Aufgaben`, `${visibleTasks.length} tasks`)
      : text('Keine Aufgaben in dieser Kategorie.', 'No tasks in this category.');

    if (visibleTasks.length) {
      showTask(Math.min(Math.max(currentIndex, 0), visibleTasks.length - 1));
    } else {
      currentIndex = -1;
      setStatus(text('Keine Aufgaben in dieser Kategorie.', 'No tasks in this category.'));
    }
  }

  function appendPages(container, pages, kind) {
    container.replaceChildren();
    (pages || []).forEach((page, index) => {
      const task = visibleTasks[currentIndex];
      const figure = document.createElement('figure');
      figure.className = 'page-card';
      const image = document.createElement('img');
      image.src = page.src;
      image.width = Number(page.width) || 800;
      image.height = Number(page.height) || 600;
      image.draggable = false;
      image.alt = text(
        `${task.title}, Jahr ${task.year} – ${kind === 'problem' ? 'Aufgabe' : 'Lösung'}, Seite ${index + 1}`,
        `${task.title}, ${task.year} – ${kind}, page ${index + 1}`,
      );
      image.loading = kind === 'problem' ? 'eager' : 'lazy';
      image.addEventListener('error', () => {
        image.alt = text(
          `Bild nicht verfügbar: ${task.title}, ${task.year}, Seite ${index + 1}`,
          `Image unavailable: ${task.title}, ${task.year}, page ${index + 1}`,
        );
        image.classList.add('image-error');
        const message = document.createElement('p');
        message.className = 'image-error-message';
        message.setAttribute('role', 'status');
        message.textContent = text('Bild konnte nicht geladen werden.', 'Image could not be loaded.');
        figure.append(message);
      }, { once: true });

      const caption = document.createElement('figcaption');
      caption.textContent = text(`Seite ${index + 1}`, `Page ${index + 1}`);
      figure.append(image, caption);
      if (page.text) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        const paragraph = document.createElement('p');
        details.className = 'transcription';
        summary.textContent = text('Textversion anzeigen', 'Show text transcription');
        paragraph.textContent = page.text;
        details.append(summary, paragraph);
        figure.append(details);
      }
      container.append(figure);
    });
  }

  function showTask(index) {
    const task = visibleTasks[index];
    if (!task) return;
    currentIndex = index;

    status.hidden = true;
    panel.hidden = false;
    $('#task-title').textContent = task.title;
    $('#task-meta').textContent = [
      text(`Schulstufen ${grade.replace('-', '–')}`, `Grades ${grade.replace('-', '–')}`),
      task.year,
      text(...labels[difficulty]),
      (task.sourcePages || []).map((page) => text(`Quelle S. ${page}`, `Source p. ${page}`)).join(', '),
      (task.printedPages || []).map((page) => text(`Druckseite ${page}`, `Printed p. ${page}`)).join(', '),
    ].filter(Boolean).join(' · ');
    select.value = String(index);
    solutionDetails.open = false;
    appendPages($('#problem-pages'), task.problemImages, 'problem');
    solutionPages.replaceChildren();
    $('#previous-task').disabled = index <= 0;
    $('#next-task').disabled = index >= visibleTasks.length - 1;
    $('#task-count').textContent = text(
      `Aufgabe ${index + 1} von ${visibleTasks.length}`,
      `Task ${index + 1} of ${visibleTasks.length}`,
    );
  }

  solutionDetails.addEventListener('toggle', (event) => {
    if (event.currentTarget.open) {
      const task = visibleTasks[currentIndex];
      if (task && !solutionPages.childElementCount) {
        appendPages(solutionPages, task.solutionImages, 'solution');
      }
    }
  });

  document.querySelectorAll('.difficulty-choice').forEach((button) => {
    button.disabled = true;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (!difficulties.includes(button.dataset.difficulty) || button.disabled) return;
      difficulty = button.dataset.difficulty;
      currentIndex = 0;
      render();
    });
  });

  gradeSelect.addEventListener('change', () => {
    grade = gradeSelect.value;
    currentIndex = 0;
    render();
  });
  select.addEventListener('change', () => showTask(Number(select.value)));
  $('#previous-task').addEventListener('click', () => showTask(currentIndex - 1));
  $('#next-task').addEventListener('click', () => showTask(currentIndex + 1));
  $('#previous-task').disabled = true;
  $('#next-task').disabled = true;
  select.disabled = true;
  gradeSelect.disabled = true;

  document.querySelectorAll('[data-set-lang]').forEach((button) => {
    button.addEventListener('click', () => setTimeout(() => {
      if (ready) {
        updateGradeOptions();
        gradeSelect.value = grade;
        render();
      } else if (!status.hidden) {
        setStatus(loadFailed
          ? text('Aufgaben konnten nicht geladen werden. Bitte später erneut versuchen.', 'Tasks could not be loaded. Please try again later.')
          : text('Aufgaben werden geladen …', 'Loading tasks …'));
      }
    }, 0));
  });

  fetch('tasks.json?v=20261125-all-grades')
    .then((response) => {
      if (!response.ok) throw new Error('Task request failed');
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Invalid task data');
      tasks = data.filter((task) => task && task.ratings);
      updateGradeOptions();
      gradeSelect.value = grade;
      gradeSelect.disabled = false;
      ready = true;
      render();
    })
    .catch(() => {
      loadFailed = true;
      setStatus(text(
        'Aufgaben konnten nicht geladen werden. Bitte später erneut versuchen.',
        'Tasks could not be loaded. Please try again later.',
      ));
    });
})();
