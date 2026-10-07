import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as common from '@zxcvbn-ts/language-common';
import * as en from '@zxcvbn-ts/language-en';
import * as de from '@zxcvbn-ts/language-de';
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned';

// Match the upstream demo's checked options, without exposing its settings UI.
export const options = {
  dictionary: { ...common.dictionary, ...en.dictionary, ...de.dictionary },
  translations: en.translations,
  // This release wraps the graph JSON in an ES-module namespace.
  graphs: common.adjacencyGraphs.default ?? common.adjacencyGraphs,
  useLevenshteinDistance: true,
};

export function createTester(fetchApi) {
  return new ZxcvbnFactory(options, { pwned: matcherPwnedFactory(fetchApi) });
}

if (typeof document !== 'undefined') {
  const input = document.querySelector('#password');
  const status = document.querySelector('#status');
  const results = document.querySelector('#results');
  let timer;
  let version = 0;
  let lookupFailed = false;
  const fetchApi = async (url, init) => {
    const requestVersion = version;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal, credentials: 'omit' });
      if (!response.ok && requestVersion === version) lookupFailed = true;
      return response;
    } catch (error) {
      if (requestVersion === version) lookupFailed = true;
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };
  const tester = createTester(fetchApi);
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const setText = (id, text) => { document.getElementById(id).textContent = text; };

  input.disabled = false;
  status.textContent = 'Ready. Use invented passwords only.';
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const current = ++version;
    results.hidden = true;
    if (!input.value) {
      status.textContent = 'Ready. Use invented passwords only.';
      return;
    }
    status.textContent = 'Checking…';
    timer = setTimeout(async () => {
      lookupFailed = false;
      try {
        // No userInputs field or personal data is provided to the estimator.
        const result = await tester.checkAsync(input.value);
        if (current !== version) return;
        setText('score', `${labels[result.score]} — ${result.score} / 4`);
        document.querySelector('#strength').value = result.score;
        setText('warning', result.feedback.warning || '');
        const suggestions = document.querySelector('#suggestions');
        suggestions.replaceChildren(...result.feedback.suggestions.map(text => {
          const item = document.createElement('li');
          item.textContent = text;
          return item;
        }));
        const times = result.crackTimes;
        setText('online-slow', times.onlineThrottlingXPerHour.display);
        setText('online-fast', times.onlineNoThrottlingXPerSecond.display);
        setText('offline-slow', times.offlineSlowHashingXPerSecond.display);
        setText('offline-fast', times.offlineFastHashingXPerSecond.display);
        results.hidden = false;
        status.textContent = lookupFailed
          ? 'Strength estimated. Breach lookup unavailable; try again when connected.'
          : 'Check complete.';
      } catch (error) {
        if (current !== version) return;
        status.textContent = 'The check could not finish. Please try another test password or reload.';
      }
    }, 200);
  });
}
