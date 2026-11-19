import {test, expect} from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dir,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const url='https://pnorthup.me/grg23/tasks/eva-prinzip/';
const docs=['1a-dgb/EVA-Prinzip.html','1a-dgb/EVA-Prinzip-Arbeitsblatt.html','1a-dgb/EVA-Prinzip-Arbeitsblatt.md','1c-dgb/EVA-Prinzip.html','1c-dgb/EVA-Prinzip-Arbeitsblatt.html','1c-dgb/EVA-Prinzip-Arbeitsblatt.md','1d-dgb/EVA-Prinzip-Teil-2.html','1d-dgb/EVA-Prinzip-Teil-2-Arbeitsblatt.html'];
const english='https://learningapps.org/display?v=posy2fyyk24';
test('German hosted exercise remains; 1C/1D also offer labelled English LearningApps choices',()=>{
 for(const file of docs){
  const doc=read(file);expect(doc).toContain(url);expect(doc).toContain('Zuordnung prüfen');
  expect(doc).not.toContain('is.gd/evalearnapp');
  if(file.startsWith('1a-')) {expect(doc).not.toContain('learningapps.org/');expect(doc).not.toContain('Häkchen');}
  else {expect(doc).toContain(english);expect(doc).toContain('English');expect(doc).toContain('Deutsch');expect(doc).toContain('✓');}
  if(file.endsWith('.html'))expect(doc).toContain('href="'+url+'"');
 }
});
test('all three PDFs contain the actual clickable hosted exercise URI',()=>{
 for(const file of ['1a-dgb/EVA-Prinzip-Arbeitsblatt.pdf','1c-dgb/EVA-Prinzip-Arbeitsblatt.pdf','1d-dgb/EVA-Prinzip-Teil-2-Arbeitsblatt.pdf']){
  const pdf=fs.readFileSync(path.join(root,file)).toString('latin1');expect(pdf).toContain('/URI ('+url+')');expect(pdf).not.toContain('is.gd/evalearnapp');
  if(file.startsWith('1a-'))expect(pdf).not.toContain('learningapps.org/display');
  else expect(pdf).toContain('/URI ('+english+')');
 }
});
test('hosted exercise has local assets, breadcrumbs, 16 explained cards and preserved SCORM download',()=>{
 const html=read('tasks/eva-prinzip/index.html');expect(html).not.toContain('<iframe');
 expect(html).toContain('href="../../index.html"');expect(html).toContain('href="../index.html"');expect(read('tasks/index.html')).toContain('href="eva-prinzip/"');
 expect(html).toContain('ICT Click Digital Media / Kyd Tantano Masong');
 for(const asset of ['content.js','app.js','scorm.js','style.css'])expect(fs.existsSync(path.join(root,'tasks/eva-prinzip',asset))).toBe(true);
 const js=read('tasks/eva-prinzip/content.js');const json=JSON.parse(js.slice(js.indexOf('window.EVA_CONTENT = ')+'window.EVA_CONTENT = '.length).trim().replace(/;$/,''));
 expect(json.items.length).toBe(16);expect(json.categories.length).toBe(4);for(const item of json.items)expect(item.hint.length).toBeGreaterThan(40);
 expect(read('tasks/eva-prinzip/app.js')).toContain('Übungsmodus auf der Website');
 const zip=fs.readFileSync(path.join(root,'tasks/eva-prinzip/EVA-Deutsch-mit-Hinweisen-SCORM12.zip'));
 expect(createHash('sha256').update(zip).digest('hex')).toBe('9171dd71361eceddf23f03d0b8688c7544a7f53f7608ba2b154e8df612cd1d91');
});
