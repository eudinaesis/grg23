import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'5d-gpb/rom-macht');
const pages=['index.html','republik.html','augustus.html','impulse.html'];
const read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const data=JSON.parse(read('content.json'));
test('only student-safe files are included; no keys, plans, uploads or archives',()=>{
 assert.deepEqual(fs.readdirSync(dir).sort(),['content.json','index.html','republik.html','augustus.html','impulse.html','rome.css','slides.js','republik-arbeitsblatt.pdf','augustus-arbeitsblatt.pdf'].sort());
 const text=fs.readdirSync(dir).filter(f=>!f.endsWith('.pdf')).map(read).join('\n');
 for(const s of ['TEACHER ONLY','Activity 6 sample','5 formative points','4 points, formative','05-Complete','Teacher answers:','Teacher keys:','/workspace/','.piclaw','zeitbilder-5-6-compact-rome.pdf'])assert.ok(!text.includes(s),s);
 assert.ok(!/\b[REH]\d+(?:-alt)?\b/.test(text),'No R/E/H task codes');
 assert.ok(!/\b(?:Question|Frage)\s*\d/.test(text),'Questions are unnumbered');
});
test('all public strings are bilingual; all seven activities per unit are present',()=>{
 let count=0;function walk(x){if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){if('en'in x){assert.equal(typeof x.de,'string');assert.ok(x.de.length&&x.en.length);count++;}else Object.values(x).forEach(walk);}}walk(data);assert.ok(count>175);
 for(const lesson of data.lessons)for(let i=1;i<=7;i++)assert.ok(lesson.pages.flat().some(b=>b.kind==='h'&&b.text.en.startsWith('Activity '+i+' ·')));
 for(const p of pages){assert.match(read(p),/data-set-lang="de"/);assert.match(read(p),/data-set-lang="en"/);}
});
test('review table has current Athens wording, a thin yes/no column and blank cells',()=>{
 const t=data.lessons[0].pages[0].find(b=>b.kind==='table');
 assert.equal(t.rows[2][0].en,'Athens (general or office-holder or influential speaker)');
 assert.equal(t.rows[2][0].de,'Athen (Feldherr, Amtsträger oder einflussreicher Redner)');
 assert.ok(t.widths[1]<t.widths[2]/4);assert.equal(t.rows.length,4);
 for(const row of t.rows)for(const c of row.slice(1))assert.deepEqual(c,{blank:1.1});
 assert.equal(t.headers[2].en,'How? (blank if “no”)');
});
test('full breadcrumbs, class index link and every local resource/fragment resolve',()=>{
 assert.match(fs.readFileSync(path.join(root,'5d-gpb/index.html'),'utf8'),/href="rom-macht\/index.html"/);
 for(const f of pages){const html=read(f);const nav=html.match(/<!-- site-breadcrumb:start -->([\s\S]*?)<!-- site-breadcrumb:end -->/)[1];assert.ok(nav.includes('href="../../index.html"'));assert.ok(nav.includes('href="../index.html"'));if(f!=='index.html')assert.ok(nav.includes('href="index.html"'));
  for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){const u=m[1];if(/^(?:https?:|mailto:|data:)/.test(u))continue;const[file,hash]=u.split('#');const target=file?path.resolve(dir,file):path.join(dir,f);assert.ok(fs.existsSync(target),f+' → '+u);if(hash)assert.ok(fs.readFileSync(target,'utf8').includes('id="'+hash+'"'),u);}
 }
});
test('downloadable handouts are two A4 pages, friendly-labelled and student-only',()=>{
 for(const f of ['republik-arbeitsblatt.pdf','augustus-arbeitsblatt.pdf']){const pdf=path.join(dir,f),info=execFileSync('pdfinfo',[pdf],{encoding:'utf8'}),text=execFileSync('pdftotext',[pdf,'-'],{encoding:'utf8'});assert.match(info,/Pages:\s+2/);assert.match(info,/595.276 x 841.89/);assert.ok(text.includes('Activity 1'));assert.ok(text.includes('Activity 7'));assert.ok(!/\b[REH]\d+\b/.test(text));assert.ok(!text.includes('Activity 6 sample'));}
});
test('six student prompts have no-JS fallback, print support and no answer persistence',()=>{
 assert.equal(data.slides.length,6);assert.equal((read('impulse.html').match(/data-slide aria-label/g)||[]).length,6);assert.ok(!read('impulse.html').includes('data-slide hidden'));
 assert.match(read('rome.css'),/\.slide\[hidden\],\.slide\{display:block!important/);
 for(const term of ['localStorage','sessionStorage','fetch(','XMLHttpRequest','indexedDB'])assert.ok(!read('slides.js').includes(term));
});
test('public generator is idempotent and preserves every unrelated HTML page',()=>{
 const before=Object.fromEntries(pages.map(p=>[p,read(p)]));
 const unrelated=['5d-gpb/index.html','1d-dgb/EVA-Prinzip-Teil-2.html','1d-dgb/Passwoerter-Teil-1.html'];const saved=unrelated.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
 execFileSync('bun',['scripts/build-rome.mjs'],{cwd:root});for(const p of pages)assert.equal(read(p),before[p]);unrelated.forEach((p,i)=>assert.equal(fs.readFileSync(path.join(root,p),'utf8'),saved[i]));
});
