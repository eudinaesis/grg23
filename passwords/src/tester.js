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

export function createTester(fetchApi, language = 'en') {
  return new ZxcvbnFactory({ ...options, translations: language === 'de' ? de.translations : en.translations }, { pwned: matcherPwnedFactory(fetchApi) });
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
  const language = window.PasswordLanguage;
  const testers = new Map();
  const getTester = () => {
    const code = language.get();
    if (!testers.has(code)) testers.set(code, createTester(fetchApi, code));
    return testers.get(code);
  };
  const setText = (id, text) => { document.getElementById(id).textContent = text; };

  input.disabled = false;
  status.removeAttribute('data-i18n');
  status.textContent = language.t('ready');
  const check = () => {
    clearTimeout(timer);
    const current = ++version;
    results.hidden = true;
    if (!input.value) {
      status.textContent = language.t('ready');
      return;
    }
    status.textContent = language.t('checking');
    timer = setTimeout(async () => {
      lookupFailed = false;
      try {
        // No userInputs field or personal data is provided to the estimator.
        const result = await getTester().checkAsync(input.value);
        if (current !== version) return;
        setText('score', `${language.t('scores')[result.score]} — ${result.score} / 4`);
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
          ? language.t('unavailable')
          : language.t('complete');
      } catch (error) {
        if (current !== version) return;
        status.textContent = language.t('error');
      }
    }, 200);
  };
  input.addEventListener('input', check);
  document.addEventListener('password-languagechange', check);
}
