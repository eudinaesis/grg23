/* SCORM 1.2 only. No external libraries or tracking. */
(() => {
  let api = null, active = false, finished = false;
  let failure = false;
  const accepted = value => value === true || value === 'true';
  function find(start) {
    let win = start;
    for (let i = 0; win && i < 30; i++) {
      try {
        if (win.API) return win.API;
        if (win.parent === win) break;
        win = win.parent;
      } catch { break; }
    }
    return null;
  }
  function markFailure() {
    failure = true;
    window.dispatchEvent(new Event('scorm-error'));
  }
  function call(method, ...args) {
    try { return api[method](...args); } catch { markFailure(); return null; }
  }
  function get(key) { return active ? call('LMSGetValue', key) || '' : ''; }
  function set(key, value) {
    if (!active) return false;
    const result = accepted(call('LMSSetValue', key, String(value)));
    if (!result) markFailure();
    return result;
  }
  function commit() {
    if (!active) return false;
    const result = accepted(call('LMSCommit', ''));
    if (!result) markFailure();
    return result;
  }
  api = find(window) || (window.opener && find(window.opener));
  if (api) {
    active = accepted(call('LMSInitialize', ''));
    if (!active) markFailure();
  }
  const readOnly = active && ['review', 'browse'].includes(get('cmi.core.lesson_mode'));
  let best = Number(get('cmi.core.score.raw')) || 0;
  let passed = get('cmi.core.lesson_status') === 'passed';
  if (active && !readOnly) {
    if (!passed) set('cmi.core.lesson_status', 'incomplete');
    set('cmi.core.score.min', 0);
    set('cmi.core.score.max', 100);
    set('cmi.core.exit', 'suspend');
    commit();
  }
  const started = Date.now();
  function finish() {
    if (!active || finished) return;
    finished = true;
    if (!readOnly) {
      const secs = Math.floor((Date.now() - started) / 1000);
      const time = `${String(Math.floor(secs / 3600)).padStart(4,'0')}:${String(Math.floor(secs / 60) % 60).padStart(2,'0')}:${String(secs % 60).padStart(2,'0')}`;
      set('cmi.core.session_time', time);
      set('cmi.core.exit', 'suspend');
      commit();
    }
    if (!accepted(call('LMSFinish', ''))) markFailure();
    active = false;
  }
  window.EVA_SCORM = {
    get connected() { return active; },
    get failed() { return failure; },
    get readOnly() { return readOnly; },
    restore() {
      const value = get('cmi.suspend_data');
      try { return value ? JSON.parse(value) : null; } catch { return null; }
    },
    save(state, score = null) {
      if (!active || readOnly) return;
      const encoded = JSON.stringify(state);
      if (encoded.length > 4096) { markFailure(); return; }
      set('cmi.suspend_data', encoded);
      if (score !== null) {
        best = Math.max(best, score);
        passed = passed || score === 100;
        set('cmi.core.score.raw', best);
        set('cmi.core.lesson_status', passed ? 'passed' : 'incomplete');
      }
      commit();
    },
    finish
  };
  window.addEventListener('pagehide', finish);
  // A BFCache return must create a new LMS session, not reuse a finished API session.
  window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
})();
