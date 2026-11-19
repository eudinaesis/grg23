(() => {
  const content = window.EVA_CONTENT, lms = window.EVA_SCORM;
  const $ = id => document.getElementById(id);
  const items = new Map(content.items.map(item => [item.id, item]));
  const groups = new Map(content.categories.map(group => [group.id, group]));
  const assignments = {};
  let selected = null, checked = false;
  const cards = new Map();
  const status = text => { $('status').textContent = text; };
  function connectionStatus() {
    $('lms').textContent = lms.failed ? 'Achtung: Das Lernmanagementsystem konnte den Lernstand nicht zuverlässig speichern. Melde das deiner Lehrkraft; lasse diese Seite offen.'
      : !lms.connected ? 'Übungsmodus auf der Website: Dein Lernstand wird nicht gespeichert. Notiere dein Ergebnis auf dem Arbeitsblatt, bevor du diese Seite schließt oder neu lädst.'
      : lms.readOnly ? 'Ansichtsmodus des Lernmanagementsystems: Du kannst üben; dein gespeichertes Ergebnis wird nicht verändert.'
      : 'Mit dem Lernmanagementsystem verbunden. Zuordnungen werden gespeichert. Die Übung ist bestanden, wenn alle 16 Karten richtig sind. Das beste geprüfte Ergebnis bleibt erhalten.';
  }
  connectionStatus();
  window.addEventListener('scorm-error', connectionStatus);
  $('instruction').textContent = content.instruction;
  function persist(score = null) { lms.save({ v: 1, id: content.id, assignments, checked }, score); }
  function progress() {
    $('progress').textContent = `${Object.keys(assignments).length} von ${items.size} Karten zugeordnet`;
  }
  function select(id) {
    selected = id;
    for (const [key, card] of cards) {
      card.classList.toggle('selected', key === id);
      card.querySelector('.choose').setAttribute('aria-pressed', String(key === id));
    }
    status(`Ausgewählt: ${items.get(id).label}. Wähle bei einer Gruppe „Hier zuordnen“.`);
  }
  function clearFeedback() {
    checked = false;
    for (const card of cards.values()) {
      card.classList.remove('correct', 'incorrect');
      card.querySelector('.feedback').textContent = '';
    }
  }
  function move(id, group) {
    if (!items.has(id) || !groups.has(group)) return;
    clearFeedback();
    assignments[id] = group;
    $('group-' + group).append(cards.get(id));
    selected = null;
    for (const card of cards.values()) {
      card.classList.remove('selected');
      card.querySelector('.choose').setAttribute('aria-pressed', 'false');
    }
    progress(); persist();
    status(`${items.get(id).label} wurde der Gruppe „${groups.get(group).label}“ zugeordnet. Du kannst die Karte erneut auswählen und umordnen.`);
    cards.get(id).querySelector('.choose').focus({ preventScroll: true });
  }
  for (const group of content.categories) {
    const section = document.createElement('section');
    section.className = 'group'; section.dataset.group = group.id;
    section.setAttribute('aria-labelledby', 'heading-' + group.id);
    const h = document.createElement('h2'); h.id = 'heading-' + group.id; h.textContent = group.label;
    const hint = document.createElement('p'); hint.textContent = group.hint;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'assign';
    button.textContent = 'Hier zuordnen'; button.setAttribute('aria-label', 'Hier zuordnen: ' + group.label);
    button.onclick = () => selected ? move(selected, group.id) : status('Wähle zuerst eine Karte aus.');
    const target = document.createElement('div'); target.id = 'group-' + group.id; target.className = 'cards';
    section.append(h, hint, button, target);
    section.ondragover = event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; section.classList.add('dragover'); };
    section.ondragleave = event => { if (!section.contains(event.relatedTarget)) section.classList.remove('dragover'); };
    section.ondrop = event => { event.preventDefault(); section.classList.remove('dragover'); move(event.dataTransfer.getData('text/plain'), group.id); };
    $('groups').append(section);
  }
  // Shuffle independently of the source grouping, so order does not reveal answers.
  const shuffled = [...content.items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (const item of shuffled) {
    const card = document.createElement('article');
    card.className = 'item'; card.dataset.item = item.id; card.draggable = true;
    const label = document.createElement('h3'); label.textContent = item.label;
    const choose = document.createElement('button'); choose.type = 'button'; choose.className = 'choose secondary';
    choose.textContent = 'Karte auswählen'; choose.setAttribute('aria-label', 'Karte auswählen: ' + item.label);
    choose.setAttribute('aria-pressed', 'false'); choose.onclick = () => select(item.id);
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'Was ist das?';
    const hint = document.createElement('p'); hint.textContent = item.hint;
    details.append(summary, hint);
    const feedback = document.createElement('p'); feedback.className = 'feedback';
    card.append(label, choose, details, feedback);
    card.ondragstart = event => { event.dataTransfer.setData('text/plain', item.id); event.dataTransfer.effectAllowed = 'move'; };
    card.ondragend = () => { document.querySelectorAll('.dragover').forEach(el => el.classList.remove('dragover')); };
    cards.set(item.id, card); $('pool').append(card);
  }
  function check(save = true) {
    let correct = 0;
    for (const item of content.items) {
      const card = cards.get(item.id), ok = assignments[item.id] === item.category;
      correct += Number(ok);
      card.classList.toggle('correct', ok); card.classList.toggle('incorrect', !ok);
      card.querySelector('.feedback').textContent = ok ? 'Richtig zugeordnet.' : !assignments[item.id] ? 'Noch keiner Gruppe zugeordnet.' : 'Noch nicht richtig. Lies „Was ist das?“ und ordne die Karte neu zu.';
    }
    checked = true;
    const score = Math.round(correct / items.size * 100);
    status(correct === items.size ? 'Geschafft! Alle 16 Karten sind richtig zugeordnet.' : `${correct} von ${items.size} Karten sind richtig (${score} %). Verbessere deine Zuordnung und prüfe noch einmal.`);
    if (save) persist(score);
  }
  $('check').onclick = () => check();
  $('reset').onclick = () => {
    if (!window.confirm('Alle Karten zurücklegen? Dein bestes Ergebnis im Lernmanagementsystem bleibt erhalten.')) return;
    clearFeedback(); selected = null;
    for (const [id, card] of cards) {
      delete assignments[id]; card.classList.remove('selected'); card.querySelector('.choose').setAttribute('aria-pressed','false');
      card.querySelector('details').open = false; $('pool').append(card);
    }
    progress(); persist(); status('Alle Karten sind wieder bereit. Beginne neu.');
  };
  const restored = lms.restore();
  if (restored?.v === 1 && restored.id === content.id && restored.assignments && typeof restored.assignments === 'object') {
    for (const [id, group] of Object.entries(restored.assignments)) {
      if (items.has(id) && groups.has(group)) { assignments[id] = group; $('group-' + group).append(cards.get(id)); }
    }
    if (restored.checked === true) check(false);
    else if (Object.keys(assignments).length) status('Deine gespeicherten Zuordnungen wurden wiederhergestellt.');
  }
  progress();
})();
