import {test,expect} from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'2e-dgb/faktencheck-mit-ki/stunde-2');
for(const file of ['index.html','greta.html','ronaldo.html','giorgia-villa.html']){
  test(`${file}: short, separately copyable German prompts`,()=>{
    const html=fs.readFileSync(path.join(dir,file),'utf8');
    const prompts=[...html.matchAll(/<p class="prompt" id="([^"]+)">([^<]+)<\/p>/g)];
    expect(prompts.length).toBe(4);
    expect(new Set(prompts.map(m=>m[1])).size).toBe(prompts.length);
    for(const [,id,text]of prompts){expect(text.trim().split(/\s+/).length).toBeLessThanOrEqual(8);expect(text.length).toBeLessThanOrEqual(50);expect(html).toContain(`data-copy="${id}"`);}
    expect(html).not.toMatch(/3B|3b-dgb/);
    expect(html).toContain('role="status"');
  });
}
test('worksheet keeps two sheets, class label, source/date/limits and roles',()=>{
  const h=fs.readFileSync(path.join(dir,'arbeitsblatt.html'),'utf8');
  expect((h.match(/<section class="sheet"/g)||[]).length).toBe(2);
  for(const t of ['2E','Greta','Ronaldo','Giorgia','Datum','genaue Stelle','Was zeigt der Beleg','Was ist heute noch offen','Belege ordnen ↔ Quellen prüfen','Keine Passwörter teilen'])expect(h).toContain(t);
  expect(h).not.toMatch(/3B|3b-dgb/);
});
test('2E class and module navigation exists',()=>{
  expect(fs.readFileSync(path.join(root,'2e-dgb/index.html'),'utf8')).toContain('faktencheck-mit-ki/stunde-2/');
  expect(fs.readFileSync(path.join(root,'2e-dgb/faktencheck-mit-ki/index.html'),'utf8')).toContain('stunde-2/');
  for(const f of ['index.html','greta.html','ronaldo.html','giorgia-villa.html','arbeitsblatt.html']){
    const h=fs.readFileSync(path.join(dir,f),'utf8');expect(h).toContain('site-breadcrumb:start');expect(h).toContain('2E · DGB');expect(h).toContain('../../../index.html');
  }
});
