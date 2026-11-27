import {test,expect} from 'bun:test';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dir,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const lesson=read('1a-dgb/EVA-iPad-Teams.html');const sheet=read('1a-dgb/EVA-iPad-Teams-Arbeitsblatt.html');const guide=read('general/iPad-PDF-in-Teams-abgeben.html');
test('1A starts with a local self-linking QR and remains German-only',()=>{
 expect(lesson.indexOf('class="qr-start"')).toBeLessThan(lesson.indexOf('Dein Ziel heute'));
 expect(lesson).toContain('images/EVA-iPad-Teams-QR.png');expect(lesson).toContain('images/EVA-iPad-Teams-QR.svg');
 for(const raw of [lesson,sheet,guide]){const doc=raw.replace(/<!-- site-breadcrumb:start -->[\s\S]*?<!-- site-breadcrumb:end -->/,'');expect(doc).not.toContain('data-lang="en"');expect(doc).not.toContain('assets/language.js');expect(doc).not.toContain('class="language-switch"');expect(raw).toContain('site-breadcrumb:start');}
 expect(read('1a-dgb/index.html')).toContain('href="EVA-iPad-Teams.html"');
 for(const file of ['1a-dgb/index.html','general/index.html'])expect(read(file)).toContain('iPad-Multitasking.html');
});
test('all starting states for Aufgabe 2 have an honest path without invented scores',()=>{
 for(const text of ['Noch nicht begonnen / nicht sicher?','Begonnen, aber noch nicht fertig?','Schon fertig?','Du musst nicht alle 16 Karten noch einmal machen.','altes Ergebnis nicht notiert','zwei Geräte, ihre Kategorie'])expect(lesson).toContain(text);
 expect(lesson).toContain('href="../tasks/eva-prinzip/"');expect(lesson).not.toContain('learningapps.org');
 expect(sheet).toContain('nicht sicher');expect(sheet).toContain('Erfinde keine Zahl');
});
test('answers are a named PDF with typed and Pencil sections, then attachment and explicit submission',()=>{
 for(const text of ['1A-EVA-Vorname-Nachname.pdf','In Dateien sichern','Text hinzufügen','Tastatur','Pencil','beiden Seiten','Arbeit hinzufügen','Abgegeben'])expect(lesson).toContain(text);
 expect(lesson).toContain('Aufgabe, die dir die Lehrperson nennt');expect(lesson).not.toContain('OneNote');
 expect(lesson).toContain('Die Webseite ist nur die Anleitung.');expect(lesson).toContain('Nur Anhängen reicht nicht');
 for(const word of ['Tastatur','Pencil','Touchscreen','Prozessor (CPU)','Vom QR-Code','mit dem Pencil','ausgefüllte PDF'])expect(sheet).toContain(word);
 expect((sheet.match(/class="sheet"/g)||[]).length).toBe(2);
 const pdf=fs.readFileSync(path.join(root,'1a-dgb/EVA-iPad-Teams-Arbeitsblatt.pdf')).toString('latin1');expect(pdf).toContain('/URI (https://pnorthup.me/grg23/1a-dgb/EVA-iPad-Teams.html)');
});
test('shared guide is class-neutral and distinguishes save, upload and turn in',()=>{
 for(const text of ['1A','1C','1D'])expect(guide).not.toContain(text);
 for(const text of ['Speichern','Hochladen','Abgeben','keine Aufgabe in Teams','Dateien','Vorschau','ausgefüllte PDF','Schulkonto','Abgabezeit'])expect(guide).toContain(text);
 expect(read('general/index.html')).toContain('iPad-PDF-in-Teams-abgeben.html');
});
