import{test,expect}from'bun:test';import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('2E lists the three lessons in the requested numbered order',()=>{
 const h=read('2e-dgb/index.html');
 const rows=[...h.matchAll(/<li><a href="([^"]+)"><span data-lang="de">([^<]+)<\/span>/g)];
 expect(rows.map(m=>m[1])).toEqual(['Biber-der-Informatik.html','faktencheck-mit-ki/stunde-2/','DigBi-Algorithmen-1.html']);
 expect(rows.map(m=>m[2])).toEqual(['1. Biber der Informatik · Wettbewerb und Übungsaufgaben','2. Kann das stimmen? · Faktencheck mit KI · Stunde 2','3. DigBi &amp; Algorithmen #1']);
});
test('lesson3 first activity opens the exact German Digbi guide',()=>{
 const h=read('2e-dgb/DigBi-Algorithmen-1.html');
 expect(h).toContain('<h1 data-lang="de">3. DigBi &amp; Algorithmen #1</h1>');
 const first=h.match(/<a class="activity-link" href="([^"]+)"/);
 expect(first?.[1]).toBe('https://pnorthup.me/grg23/general/Digbi-Anmeldung.html?lang=de');
 for(const s of ['Moodle am Schul-iPad','Microsoft-Schulkonto','Meine Kurse','Lehrkraft','site-breadcrumb:start','href="../index.html"','href="index.html"'])expect(h).toContain(s);
 expect((h.match(/<article\b/g)||[]).length).toBe(1);
});
