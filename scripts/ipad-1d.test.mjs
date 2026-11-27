import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('1d-dgb/ipad-arbeit.html');
const print = read('1d-dgb/ipad-arbeit-Anleitung.html');
test('1D worksheet route uses screenshots 0031–0033, 0036 and 0037 in order', () => {
  const images = ['arbeitsblatt-teilen.jpg', 'arbeitsblatt-mehr-anzeigen.jpg', 'arbeitsblatt-downloads-speichern.jpg', 'dateien-dock.jpg', 'downloads-oeffnen.jpg'];
  for (const html of [page, print]) {
    let previous = -1;
    for (const image of images) {
      const position = html.indexOf(`src="images/ipad-arbeit/${image}"`);
      expect(position).toBeGreaterThan(previous);
      previous = position;
    }
    for (const label of ['Mehr anzeigen', 'In Dateien sichern', '1d-ipad-vorname-nachname', 'Downloads', 'Dock', 'Markieren']) expect(html).toContain(label);
  }
});
test('English instructions retain the actual German app and UI names', () => {
  const english = [...page.matchAll(/<(ol|p)[^>]*data-lang="en"[^>]*>([\s\S]*?)<\/\1>/g)].map(match => match[2]).join('\n');
  for (const label of ['Camera (Kamera)', 'Share (Teilen)', 'Show More (Mehr anzeigen)', 'Save to Files (In Dateien sichern)', 'Save (Sichern)', 'Files (Dateien)', 'Preview (Vorschau)', 'Markup (Markieren)', 'Undo (Rückgängig)', 'Done (Fertig)']) expect(english).toContain(label);
});
test('printed instructions retain two sides, quiet shut-iPad checkpoint and saved-copy workflow', () => {
  expect((print.match(/<section class="sheet">/g) || []).length).toBe(2);
  expect(print).toContain('Warte leise');
  expect(print).toContain('Bildschirm zum Tisch');
  expect(print).toContain('mit deinem eigenen Vor- und Nachnamen');
  expect(print).toContain('Die Endung <strong>.pdf</strong> bleibt');
  expect(print).toContain('Öffne dieselbe Datei erneut');
  expect(print).not.toContain('Lege dein iPad jetzt wieder flach');
});
test('all local resources in modified lesson pages resolve', () => {
  for (const file of ['1d-dgb/ipad-arbeit.html', '1d-dgb/ipad-arbeit-Anleitung.html']) {
    for (const match of read(file).matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|#|data:|mailto:)/.test(match[1])) continue;
      const url = new URL(match[1], `file://${path.join(root, file)}`);
      expect(fs.existsSync(url.pathname)).toBe(true);
    }
  }
});
