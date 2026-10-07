(() => {
  const texts = {
    en: {
      section: 'Passwords', sectionIntro: 'Explore what makes a password hard to guess.',
      tester: 'Password strength tester', dictionaries: 'English + German + common passwords',
      inputLabel: 'Try an invented password', inputHelp: 'Do not enter a real password. What you type is visible on screen.',
      placeholder: 'Type a test password…', loading: 'Loading the tester…', noScript: 'Please enable JavaScript to use the tester.',
      resultTitle: 'Estimated strength', strengthLabel: 'Password strength out of 4', times: 'Estimated time to guess',
      onlineSlow: 'Online: 100 guesses / hour', onlineFast: 'Online: 10 guesses / second',
      offlineSlow: 'Offline: 10,000 guesses / second', offlineFast: 'Offline: 10 billion guesses / second',
      estimateNote: 'These are estimates, not a guarantee of safety.', how: 'How does this work?',
      howGuess: 'Imagine a computer trying to guess a password. It tries common passwords and familiar patterns first, rather than guessing completely at random.',
      howPatterns: 'This tester looks for English and German words, names, common passwords, dates, repeated letters and keyboard patterns like “qwertz”. It also spots small changes, like replacing a letter with a number. Adding “123” to a familiar word often helps less than you might think!',
      howScore: 'It estimates how many guesses a computer might need and gives a score from 0 (very weak) to 4 (very strong). Longer passwords made from several randomly chosen words can be much harder to guess. A famous quote or an ordinary sentence can be easier.',
      howTimes: 'The times depend on how quickly the computer can try guesses. “Online” means trying to log in to a website, which can limit attempts. “Offline” means checking against stolen password data on the attacker’s computer. The attacker can often try much faster then.',
      howPrivacy: 'The strength calculation happens in your browser. This page does not save what you type. For the extra breach check, your browser makes a hash: a code calculated from the password. It sends only the first five characters of that code to Have I Been Pwned. Your password and the complete code are not sent. The service can see your IP address.',
      howBreach: 'Have I Been Pwned sends back a list of matching codes from known data breaches. Your browser checks the rest locally. A match means the password has appeared in leaked data. No match does not prove that it is safe. Without an internet connection, this extra check may be unavailable.',
      howSafe: 'Use made-up passwords here. Even a high-scoring password can be stolen by a fake login page. Use a different password for every account, and keep real passwords in a password manager.',
      powered: 'Powered by', enabled: 'English, German and common dictionaries, keyboard patterns, spelling variations and breached-password checking are enabled. Results update after a short typing pause.',
      ready: 'Ready. Use invented passwords only.', checking: 'Checking…', complete: 'Check complete.',
      unavailable: 'Strength estimated. Breach lookup unavailable; try again when connected.', error: 'The check could not finish. Please try another test password or reload.',
      scores: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'], breadcrumb: 'Breadcrumb', language: 'Language'
    },
    de: {
      section: 'Passwörter', sectionIntro: 'Entdecke, was ein Passwort schwer zu erraten macht.',
      tester: 'Passwortstärke testen', dictionaries: 'Englisch + Deutsch + häufige Passwörter',
      inputLabel: 'Probiere ein erfundenes Passwort aus', inputHelp: 'Gib kein echtes Passwort ein. Was du tippst, ist auf dem Bildschirm sichtbar.',
      placeholder: 'Tippe ein Testpasswort …', loading: 'Der Test wird geladen …', noScript: 'Bitte aktiviere JavaScript, um den Test zu verwenden.',
      resultTitle: 'Geschätzte Stärke', strengthLabel: 'Passwortstärke von 0 bis 4', times: 'Geschätzte Zeit zum Erraten',
      onlineSlow: 'Online: 100 Versuche / Stunde', onlineFast: 'Online: 10 Versuche / Sekunde',
      offlineSlow: 'Offline: 10.000 Versuche / Sekunde', offlineFast: 'Offline: 10 Milliarden Versuche / Sekunde',
      estimateNote: 'Das sind Schätzungen, keine Garantie für Sicherheit.', how: 'Wie funktioniert das?',
      howGuess: 'Stell dir einen Computer vor, der ein Passwort erraten will. Er probiert zuerst häufige Passwörter und bekannte Muster. Er rät also nicht einfach völlig zufällig.',
      howPatterns: 'Dieser Test sucht nach englischen und deutschen Wörtern, Namen, häufigen Passwörtern, Datumsangaben, wiederholten Buchstaben und Tastaturmustern wie „qwertz“. Er erkennt auch kleine Änderungen, etwa eine Zahl statt eines Buchstabens. „123“ an ein bekanntes Wort anzuhängen hilft oft weniger, als du denkst!',
      howScore: 'Der Test schätzt, wie viele Versuche ein Computer brauchen könnte. Du erhältst einen Wert von 0 (sehr schwach) bis 4 (sehr stark). Lange Passwörter aus mehreren zufällig ausgewählten Wörtern können viel schwerer zu erraten sein. Ein berühmtes Zitat oder ein gewöhnlicher Satz kann leichter sein.',
      howTimes: 'Die Zeiten hängen davon ab, wie schnell der Computer raten kann. „Online“ heißt: Jemand versucht, sich auf einer Webseite anzumelden. Die Webseite kann die Anzahl der Versuche begrenzen. „Offline“ heißt: Jemand prüft gestohlene Passwortdaten auf dem eigenen Computer. Dann sind oft viel mehr Versuche möglich.',
      howPrivacy: 'Die Stärke wird in deinem Browser berechnet. Diese Seite speichert deine Eingabe nicht. Für den zusätzlichen Datenleck-Test berechnet dein Browser einen Hash: einen Code aus dem Passwort. Er schickt nur die ersten fünf Zeichen dieses Codes an Have I Been Pwned. Dein Passwort und der vollständige Code werden nicht gesendet. Der Dienst kann deine IP-Adresse sehen.',
      howBreach: 'Have I Been Pwned schickt eine Liste mit passenden Codes aus bekannten Datenlecks zurück. Dein Browser vergleicht den Rest selbst. Ein Treffer bedeutet, dass dieses Passwort in geleakten Daten vorkam. Wenn es keinen Treffer gibt, heißt das noch nicht, dass das Passwort sicher ist. Ohne Internet kann dieser zusätzliche Test fehlen.',
      howSafe: 'Verwende hier erfundene Passwörter. Auch ein Passwort mit hoher Punktzahl kann auf einer gefälschten Anmeldeseite gestohlen werden. Verwende für jedes Konto ein anderes Passwort. Bewahre echte Passwörter in einem Passwortmanager auf.',
      powered: 'Mit', enabled: 'Englische und deutsche Wörterlisten sowie häufige Passwörter, Tastaturmuster, Schreibvarianten und der Datenleck-Test sind aktiviert. Das Ergebnis erscheint nach einer kurzen Tipp-Pause.',
      ready: 'Bereit. Verwende nur erfundene Passwörter.', checking: 'Wird geprüft …', complete: 'Prüfung abgeschlossen.',
      unavailable: 'Stärke geschätzt. Datenleck-Test nicht verfügbar; versuche es mit Internet erneut.', error: 'Die Prüfung konnte nicht abgeschlossen werden. Probiere ein anderes Testpasswort oder lade die Seite neu.',
      scores: ['Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'], breadcrumb: 'Seitennavigation', language: 'Sprache'
    }
  };
  const preferred = (navigator.language || 'en').toLowerCase().split('-')[0];
  let language = preferred === 'de' ? 'de' : 'en';
  try { const saved = sessionStorage.getItem('grg23-password-language'); if (saved === 'en' || saved === 'de') language = saved; } catch (_) {}
  const t = key => texts[language][key];
  function apply() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    document.querySelectorAll('[data-password-lang]').forEach(el => { el.setAttribute('aria-pressed', String(el.dataset.passwordLang === language)); });
    document.title = t(document.querySelector('#password') ? 'tester' : 'section') + ' – GRG 23';
  }
  window.PasswordLanguage = { t, get: () => language };
  apply();
  document.querySelectorAll('[data-password-lang]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.passwordLang === language) return;
    language = button.dataset.passwordLang;
    try { sessionStorage.setItem('grg23-password-language', language); } catch (_) {}
    apply();
    document.dispatchEvent(new Event('password-languagechange'));
  }));
})();
