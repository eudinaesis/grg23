import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dir,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const files=['EVA-Prinzip.html','iPad-11-EVA-Spezifikationen.html','EVA-Prinzip-Arbeitsblatt.html','EVA-Prinzip-Arbeitsblatt.md'];
const docs=files.map(file=>read('1a-dgb/'+file));
const [lesson,parts,print,md]=docs;
const ipad='https://pnorthup.me/grg23/1a-dgb/iPad-11-EVA-Spezifikationen.html?v=flat-list';

test('1A has German-only instructions with English key-term glosses',()=>{
 for(const doc of docs){
  expect(doc).not.toContain('data-lang="en"');
  expect(doc).not.toContain('assets/language.js');
  expect(doc).not.toContain('class="language-switch"');
  expect(doc).not.toContain('1C');
  expect(doc).not.toContain('1D');
  expect(doc).not.toContain('When you');
  expect(doc).not.toContain('Circle the parts');
 }
 for(const doc of [lesson,print,md]) {
  for(const term of ['input','processing','output','keyboard','mouse','speaker'])expect(doc).toContain(term);
 }
 for(const term of ['microphones','speakers','working memory','accelerometer','ambient light sensor'])expect(parts).toContain(term);
});

test('same seven questions, three activities, score and two-way observation bonus',()=>{
 expect([...print.matchAll(/class="question"/g)].length).toBe(7);
 for(const doc of [print,md]) {
  for(const title of ['Aufgabe 1: Während der Präsentation','Aufgabe 2: Teile zuordnen','Aufgabe 3: Teile des iPads'])expect(doc).toContain(title);
  for(const term of ['QR-Code','AUSGABE','Smartphone ein Foto','is.gd/evalearnapp','/ 16','Computer vor dir NICHT hat','iPad aber NICHT hat','Ziehe keine Kabel ab'])expect(doc).toContain(term);
 }
 expect(print.match(/<table class="ipad-table"[\s\S]*?<\/table>/)[0].match(/<td><\/td>/g).length).toBe(5);
});

test('all 19 iPad terms and definitions retained without categorized groups',()=>{
 expect([...parts.matchAll(/class="term"/g)].length).toBe(19);
 expect([...parts.matchAll(/class="definition"/g)].length).toBe(19);
 expect(parts).toContain('class="spec-list"');
 expect(parts).not.toContain('category-card');
 for(const term of ['Touch ID','Bluetooth','Gyrosensor','Beschleunigungssensor','Barometer','Umgebungslichtsensor','Arbeitsspeicher'])expect(parts).toContain(term);
});

test('class-local navigation, downloads and actual PDF URI point to 1A',()=>{
 expect(read('1a-dgb/index.html')).toContain('href="EVA-Prinzip.html"');
 for(const doc of [lesson,parts,print])expect(doc).toContain('<a href="index.html">1A · DGB</a>');
 for(const doc of [lesson,print,md])expect(doc).toContain(ipad);
 for(const doc of docs)expect(doc).not.toMatch(/\/(1c|1d)-dgb\//);
 const pdf=fs.readFileSync(path.join(root,'1a-dgb/EVA-Prinzip-Arbeitsblatt.pdf')).toString('latin1');
 expect(pdf).toContain(`/URI (${ipad})`);
 expect(lesson).toContain('EVA-Prinzip-Arbeitsblatt.pdf');
});
