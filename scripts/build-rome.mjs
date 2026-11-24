/** Generate the public Rome pages from student-only bilingual content.json. No teacher/private source dependency. */
import fs from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {updateBreadcrumbs} from './update-breadcrumbs.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'5d-gpb/rom-macht');
const data=JSON.parse(fs.readFileSync(path.join(dir,'content.json'),'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=s=>String(s).split(/(\*\*[^]*?\*\*)/g).map(s=>s.startsWith('**')?'<strong>'+esc(s.slice(2,-2))+'</strong>':esc(s)).join('');
const pair=(de,en)=>`<span data-lang="de">${de}</span><span data-lang="en">${en}</span>`;
const nav=()=>`<nav class="unit-nav" aria-label="Rom / Rome"><a href="index.html">${pair('Übersicht','Overview')}</a><a href="republik.html">${pair('Republik','Republic')}</a><a href="augustus.html">Augustus</a><a href="impulse.html">${pair('Klassenimpulse','Classroom prompts')}</a></nav>`;
function block(b,l){
 const t=x=>{if(!x||typeof x[l]!=='string')throw Error('Missing translation');return rich(x[l]);};
 if(b.kind==='p')return `<p>${t(b.text)}</p>`;
 if(b.kind==='h'){const id=b.text.en.match(/^Activity (\d+)/)?.[1];return `<h2${id?` id="activity-${id}-${l}"`:''}>${t(b.text)}</h2>`;}
 if(b.kind==='list')return `<ul>${b.items.map(x=>`<li>${t(x)}</li>`).join('')}</ul>`;
 if(b.kind==='box')return `<div class="answer-space" style="--answer-height:${Number(b.h)}cm" role="img" aria-label="${l==='de'?'Leerer Schreibbereich':'Blank writing space'}"></div>`;
 if(b.kind==='table'){
  const total=b.widths.reduce((a,b)=>a+b,0);
  return `<div class="table-scroll" role="region" tabindex="0" aria-label="${l==='de'?'Tabelle; bei Bedarf seitlich scrollen':'Table; scroll sideways if needed'}"><table><colgroup>${b.widths.map(w=>`<col style="width:${(w/total*100).toFixed(3)}%">`).join('')}</colgroup><thead><tr>${b.headers.map(x=>`<th scope="col">${t(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(row=>'<tr>'+row.map((x,i)=>x.blank!==undefined?`<td class="blank-cell" aria-label="${l==='de'?'Leeres Antwortfeld':'Blank answer cell'}"><div style="min-height:${Number(x.blank)}cm"></div></td>`:`<${i===0?'th scope="row"':'td'}>${t(x)}</${i===0?'th':'td'}>`).join('')+'</tr>').join('')}</tbody></table></div>`;
 }
 throw Error('Unsupported public block '+b.kind);
}
const blocks=(bs,l)=>bs.map(b=>block(b,l)).join('\n');
function shell(title,body,deck=false){return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} – 5D GPB · GRG 23</title><link rel="stylesheet" href="../../assets/styles.css"><link rel="stylesheet" href="rome.css"><script src="../../assets/language.js" defer></script>${deck?'<script src="slides.js" defer></script>':''}</head>
<body${deck?' class="deck"':''}><div class="language-switch" role="group" aria-label="Sprache / Language"><button type="button" data-set-lang="de" aria-pressed="true">DE</button><button type="button" data-set-lang="en" aria-pressed="false">EN</button></div>
<a class="address-banner" href="https://pnorthup.me/grg23/"><strong>pnorthup.me/grg23</strong> → 5D → ${pair('Rom: Macht','Rome: power')}</a>
<main class="site-shell">${nav()}${body}</main>
<footer class="site-shell credits">${pair('Eigene Unterrichtsmaterialien · Buchbezüge: Zeitbilder 5/6, ÖBV 2017. Nutze dein Buch; gedruckte Seitenzahlen sind angegeben.','Original classroom materials · Book references: Zeitbilder 5/6, ÖBV 2017. Use your own book; references are printed page numbers.')}</footer></body></html>\n`;}
const header=(de,en,subde,suben)=>`<header class="site-header"><h1>${pair(de,en)}</h1><p>${pair(subde,suben)}</p></header>`;
const notice=`<aside class="note">${pair('Arbeite auf deinem Arbeitsblatt oder im Heft. Diese Seite sammelt und speichert keine Antworten. Deutsch oder Englisch ist möglich. Folge dem Arbeits- und Haltepunkt deiner Lehrkraft; nicht alles ist in einer Stunde zu erledigen.','Write on your worksheet or in your exercise book. This site does not collect or save answers. English or German is fine. Follow your teacher’s task and stopping point; not everything must be completed in one period.')}</aside>`;
let body=header('Rom: Wer hat wirklich Macht?','Rome: who really holds power?','Republik → Augustus · Materialien für 5D GPB','Republic → Augustus · materials for 5D GPB')+`<p>${pair('Untersuche den Unterschied zwischen formalen Befugnissen und tatsächlichem Einfluss. Beginne bei der Republik; nutze die zweite Einheit erst nach der gemeinsamen Vorbereitung.','Investigate the difference between formal powers and actual influence. Begin with the Republic; use the second unit after the class has prepared it.')}</p>${notice}<div class="card-grid">`;
for(const d of data.lessons)body+=`<a class="card" href="${d.id}.html"><h2>${pair(esc(d.title.de),esc(d.title.en))}</h2><p>${pair('Aufgaben, Buchstellen, Hilfe und freiwillige Herausforderungen','Tasks, book locations, optional help and challenges')}</p></a>`;
body+=`<a class="card" href="impulse.html"><h2>${pair('Sechs Klassenimpulse','Six classroom prompts')}</h2><p>${pair('Ein Impuls nach dem anderen · mit Pfeiltasten wechseln','One prompt at a time · use arrow keys to change slides')}</p></a></div><section><h2>${pair('Arbeitsblätter zum Ausdrucken','Printable worksheets')}</h2><p>${pair('Die PDF-Arbeitsblätter sind auf Englisch und haben je zwei A4-Seiten. Drucke doppelseitig. Die Aufgaben auf dieser Website gibt es in beiden Sprachen.','The English PDF worksheets are two A4 pages each. Print double-sided. The web tasks are available in both languages.')}</p><ul>${data.lessons.map(d=>`<li><a href="${d.pdf}">${pair(esc(d.title.de),esc(d.title.en))} · PDF · ${pair('Englisch, 2 Seiten','English, 2 pages')}</a></li>`).join('')}</ul></section>`;
fs.writeFileSync(path.join(dir,'index.html'),shell('Rom: Wer hat wirklich Macht?',body));
for(const d of data.lessons){
 let b=header(d.title.de,d.title.en,'Digitale Aufgaben zum Arbeitsblatt','Web version of the worksheet')+notice+`<p class="downloads"><a class="download" href="${d.pdf}">${pair('Arbeitsblatt herunterladen · Englisch · 2 A4-Seiten','Download worksheet · English · 2 A4 pages')}</a></p>`;
 for(const l of ['de','en'])b+=`<nav class="task-nav" data-lang="${l}" aria-label="${l==='de'?'Aufgaben':'Tasks'}">${Array.from({length:7},(_,i)=>`<a href="#activity-${i+1}-${l}">${l==='de'?'Aufgabe':'Activity'} ${i+1}</a>`).join('')}</nav>`;
 for(const l of ['de','en'])b+=`<div data-lang="${l}" class="handout">${d.pages.map((p,i)=>`<section class="worksheet-page" aria-label="${l==='de'?'Arbeitsblattseite':'Worksheet page'} ${i+1}">${blocks(p,l)}</section>`).join('')}</div>`;
 b+=`<details class="help"><summary>${pair('Bei Bedarf: Wort-Hilfe und freiwillige Herausforderungen','Optional: vocabulary help and challenges')}</summary>${['de','en'].map(l=>`<div data-lang="${l}">${blocks(d.help,l)}</div>`).join('')}</details>`;
 fs.writeFileSync(path.join(dir,d.id+'.html'),shell(d.title.de,b));
}
body=header('Klassenimpulse: Rom','Classroom prompts: Rome','Einheit 1: Impulse 1–3 · Einheit 2: Impulse 4–6','Unit 1: slides 1–3 · Unit 2: slides 4–6')+`<p class="deck-note">${pair('Öffne nur den vereinbarten Impuls. Pfeiltasten: weiter/zurück. Ohne JavaScript sind alle sechs Impulse sichtbar.','Open the agreed prompt. Arrow keys: next/previous. Without JavaScript all six prompts are visible.')}</p><div class="deck-controls" hidden><button type="button" data-prev>${pair('Zurück','Previous')}</button><label>${pair('Impuls','Slide')} <select aria-label="Impuls / Slide" data-slide-select>${data.slides.map((_,i)=>`<option value="${i}">${i+1}</option>`).join('')}</select></label><span class="slide-count" aria-live="polite"><span data-current>1</span> / 6</span><button type="button" data-next>${pair('Weiter','Next')}</button><button type="button" data-fullscreen>${pair('Vollbild','Full screen')}</button><button type="button" data-print>${pair('Alle drucken','Print all')}</button></div>`;
body+=data.slides.map((s,i)=>`<article class="slide" id="slide-${i+1}" data-slide aria-label="Impuls / Slide ${i+1}">${['de','en'].map(l=>`<div data-lang="${l}">${blocks(s,l)}</div>`).join('')}</article>`).join('');
fs.writeFileSync(path.join(dir,'impulse.html'),shell('Klassenimpulse: Rom',body,true));
// Use the canonical breadcrumb generator in a small staging tree so rebuilding
// Rome does not overwrite deliberately customised navigation in other classes.
const stage=fs.mkdtempSync(path.join(tmpdir(),'grg23-rome-nav-'));
const pages=['index.html','republik.html','augustus.html','impulse.html'];
try{
 fs.mkdirSync(path.join(stage,'5d-gpb/rom-macht'),{recursive:true});
 for(const f of ['index.html','5d-gpb/index.html',...pages.map(p=>'5d-gpb/rom-macht/'+p)])fs.copyFileSync(path.join(root,f),path.join(stage,f));
 updateBreadcrumbs(stage);
 for(const p of pages)fs.copyFileSync(path.join(stage,'5d-gpb/rom-macht',p),path.join(dir,p));
}finally{fs.rmSync(stage,{recursive:true,force:true});}
console.log('Generated four bilingual Rome pages with full ancestor breadcrumbs.');
