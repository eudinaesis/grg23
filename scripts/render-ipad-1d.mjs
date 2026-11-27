/**
 * @summary Render the two-sided 1D iPad instruction PDF from its HTML source and verify A4/page count.
 * @usage bun scripts/render-ipad-1d.mjs
 * @requires weasyprint, pdfinfo, pdftotext
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = '1d-dgb/ipad-arbeit-Anleitung.html';
const output = '1d-dgb/ipad-arbeit-Anleitung.pdf';
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr);
  return result.stdout;
}
run('weasyprint', [source, output]);
const info = run('pdfinfo', [output]);
if (!/^Pages:\s+2$/m.test(info) || !/^Page size:.*\(A4\)$/m.test(info)) {
  throw new Error(`Instructions must remain exactly two A4 pages:\n${info}`);
}
const text = run('pdftotext', [output, '-']).replace(/\s+/g, ' ');
for (const expected of ['Warte leise', 'Mehr anzeigen', 'In Dateien sichern', '1d-ipad-vorname-nachname', 'Dock', 'Downloads', 'Markieren', 'Seite 1 / 2', 'Seite 2 / 2']) {
  if (!text.includes(expected)) throw new Error(`Missing PDF instruction: ${expected}`);
}
console.log(`${output}: two A4 pages; current instruction text verified.`);
