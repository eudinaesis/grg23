import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dir,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const lesson=read('1c-dgb/EVA-Prinzip.html');
const print=read('1c-dgb/EVA-Prinzip-Arbeitsblatt.html');
const md=read('1c-dgb/EVA-Prinzip-Arbeitsblatt.md');
const ipad='https://pnorthup.me/grg23/1d-dgb/iPad-11-EVA-Spezifikationen.html?v=flat-list';

test('1C presentation preserves seven prompts and revised QR/photo questions',()=>{
  expect([...print.matchAll(/class="question"/g)].length).toBe(7);
  for(const text of [
    'When you scan a QR-code with your phone that takes you to a website, what is the OUTPUT?',
    'When you take a photo with a smartphone, what is the input, the processing, and the output?',
    'Do not use: keyboard, microphone, mouse, touchscreen, camera or scanner.'
  ]) { expect(print).toContain(text); expect(md).toContain(text); expect(lesson).toContain(text); }
  expect(print).not.toContain('sound ALSO');
});

test('sorting is activity 2, iPad table is activity 3, no old Teams or teardown tasks',()=>{
  for(const doc of [print,md]) {
    expect(doc).toContain('Activity 2 / Aufgabe 2: Sort the parts');
    expect(doc).toContain('Activity 3 / Aufgabe 3: iPad parts');
    expect(doc).toContain('is.gd/evalearnapp');
    expect(doc).toContain('/ 16');
    expect(doc).toContain(ipad);
    expect(doc).not.toContain('Inside a computer');
    expect(doc).not.toContain('Go to Teams');
    expect(doc).not.toContain('Activity 4');
  }
  const table=print.match(/<table class="ipad-table"[\s\S]*?<\/table>/)[0];
  expect([...table.matchAll(/<th>/g)].length).toBe(5);
  expect([...table.matchAll(/<td><\/td>/g)].length).toBe(5);
  expect(print).toContain('height: 104mm');
});

test('bonus covers both directions using observation, without giving solutions',()=>{
  for(const doc of [print,md,lesson]) {
    expect(doc).toContain('Circle the parts in your iPad table');
    expect(doc).toContain('computer in front of you does NOT have');
    expect(doc).toContain('lab computer has, but the iPad does NOT have');
    expect(doc).toContain('Hint: look behind the computer');
    expect(doc).toContain('Do not unplug any cables');
  }
});

test('class index and worksheet downloads linked; activity links open in new tabs',()=>{
  expect(read('1c-dgb/index.html')).toContain('href="EVA-Prinzip.html"');
  expect(lesson).toContain('href="EVA-Prinzip-Arbeitsblatt.pdf"');
  expect(lesson).toContain('href="EVA-Prinzip-Arbeitsblatt.md"');
  for(const a of lesson.matchAll(/<a\s[^>]+>/g)) {
    const href=a[0].match(/href="([^"]+)"/)[1];
    if(!a[0].includes('address-banner') && !['index.html','../index.html'].includes(href)) expect(a[0]).toContain('target="_blank"');
    if(!href.startsWith('http')) expect(fs.existsSync(path.resolve(root,'1c-dgb',href.split('?')[0]))).toBe(true);
  }
});
