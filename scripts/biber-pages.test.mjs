import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lessons = [
  ['1a-dgb/Biber-der-Informatik.html', 2],
  ['1c-dgb/Biber-der-Informatik.html', 2],
  ['2e-dgb/Biber-der-Informatik.html', 2],
  ['3b-dgb/Biber-und-PowerPoint.html', 3],
];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const legacy = /Beenden und Ergebnisse anzeigen|Lass die Ergebnisseite|Keep the results page|Ergebnis gesehen haben|seen your result|Warte, bis wir|Wait until we have/i;

for (const [file, count] of lessons) {
  test(`${file}: confirm JA, signal completion, no logout or immediate results`, () => {
    const html = read(file);
    assert.doesNotMatch(html, legacy);
    assert.match(html, /JA im orangefarbenen Bereich/);
    assert.match(html, /JA in the orange area/);
    assert.match(html, /Heb danach die Hand/);
    assert.match(html, /Raise your hand afterwards/);
    assert.match(html, /Du musst dich nicht abmelden/);
    assert.match(html, /You do not need to log out/);
    assert.match(html, /noch keine Ergebnisse angezeigt/);
    assert.match(html, /No results are shown yet/);
    assert.match(html, /Nächste Woche kannst du dich wieder anmelden/);
    assert.match(html, /Next week you can sign in again/);
    assert.equal((html.match(/<article class="tutorial-step"/g) || []).length, count);
    if (count === 2) assert.doesNotMatch(html, /PowerPoint/);
    else assert.match(html, /PowerPoint-Aufgabe unter Punkt 2/);
  });
}

test('shared Biber guide: actual confirmation screenshot, captions, and delayed results', () => {
  const html = read('general/Biber-Wettbewerb.html');
  assert.doesNotMatch(html, legacy);
  assert.equal((html.match(/<figure class="competition-shot"/g) || []).length, 6);
  assert.match(html, /Der schwer lesbare Link im <strong>orangefarbenen Bereich<\/strong> heißt nur <strong>JA<\/strong>/);
  assert.match(html, /The hard-to-read link in the <strong>orange area<\/strong> simply says <strong>JA<\/strong>/);
  assert.match(html, /keine Ergebnisse angezeigt/);
  assert.match(html, /No results are shown/);
  assert.match(html, /Nächste Woche kannst du dich wieder anmelden/);
  assert.match(html, /Next week you can sign in again/);
  assert.match(html, /href="\.\.\/biber\/"/);
  assert.doesNotMatch(html, /06-ergebnisse-anzeigen/);
  const image = fs.readFileSync(path.join(root, 'general/images/biber-wettbewerb/06-ende-bestaetigen.png'));
  assert.equal(image.readUInt32BE(16), 1660);
  assert.equal(image.readUInt32BE(20), 554);
  assert.match(html, /src="images\/biber-wettbewerb\/06-ende-bestaetigen.png" width="1660" height="554"/);
});
