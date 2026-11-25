import {test,expect} from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'general/Digbi-Anmeldung.html');
const html=fs.readFileSync(file,'utf8');
test('Digbi guide follows school-Microsoft sign-in through My courses',()=>{
  const steps=[...html.matchAll(/<article class="tutorial-step" id="([^"]+)"/g)].map(x=>x[1]);
  expect(steps).toEqual(['anmelden','microsoft','schulkonto','meine-kurse','moodle-installieren','moodle-website','moodle-verbinden','moodle-microsoft','moodle-zurueck','moodle-kurse']);
  for(const text of ['https://pro.digbi.net/','Schulkonto (Microsoft)','vorname.nachname@grg23vbs.ac.at','Meine Kurse','Erstelle kein neues Digbi-Konto','Liste leer','Lehrkraft'])expect(html).toContain(text);
  expect(html).toContain('lang="de"');
  expect(html).not.toMatch(/<form\b|<input\b|type="password"/i);
});
test('all seven supplied screenshots have alt text and existing local files',()=>{
  const imgs=[...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g)];
  expect(imgs.length).toBe(7);
  for(const [,src,alt]of imgs){expect(fs.existsSync(path.join(root,'general',src))).toBe(true);expect(alt.length).toBeGreaterThan(20);}
});
test('Moodle path uses the school store, correct site, Microsoft SSO and app return',()=>{
  for(const text of ['schulischen App Store','Your site','Connect to your site','Die Felder „Username“ und „Password“ lässt du leer','Open this page in “Moodle”?','Öffnen / Open','My courses'])expect(html).toContain(text);
  expect(html).toContain('href="#moodle"');expect(html).toContain('href="#browser"');
  expect(html).not.toMatch(/apps\.apple\.com|private Apple-ID eingeben/);
});
test('General index and full ancestor breadcrumbs link the guide',()=>{
  expect(fs.readFileSync(path.join(root,'general/index.html'),'utf8')).toContain('href="Digbi-Anmeldung.html"');
  const nav=html.match(/<!-- site-breadcrumb:start -->([\s\S]*?)<!-- site-breadcrumb:end -->/)?.[1];
  expect(nav).toBeDefined();expect(nav).toContain('href="../index.html"');expect(nav).toContain('href="index.html"');
});
test('local resource and fragment references resolve',()=>{
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
  for(const [,url]of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    if(/^https?:/.test(url))continue;
    if(url.startsWith('#'))expect(ids.has(url.slice(1))).toBe(true);
    else expect(fs.existsSync(path.resolve(root,'general',url))).toBe(true);
  }
});
