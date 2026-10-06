import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
let errors=[];let links=0;
const htmlFiles=walk(root).filter(f=>f.endsWith('.html'));
for(const file of htmlFiles){const html=fs.readFileSync(file,'utf8');
 if(!/^<!doctype html>/i.test(html)||!/<html lang="(?:en|de)">/.test(html)||!/<main id="main">/.test(html))errors.push(`${file}: missing document accessibility structure`);
 if(/<script\b|<iframe\b|javascript:/i.test(html))errors.push(`${file}: unexpected script or embed`);
 if(/\b(?:TODO|TBD|Lorem ipsum)\b/.test(html))errors.push(`${file}: unfinished placeholder`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(`${file}: duplicate IDs`);
 for(const [,attribute,url]of html.matchAll(/\b(href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:)/.test(url))continue;links++;
  const [relative,anchor]=url.split('#');const target=relative?path.resolve(path.dirname(file),relative):file;
  const actual=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
  if(!fs.existsSync(actual))errors.push(`${file}: broken ${attribute} ${url}`);
  else if(anchor&&!new RegExp(`\\bid="${anchor.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`).test(fs.readFileSync(actual,'utf8')))errors.push(`${file}: missing anchor ${url}`);
 }
}
const lessons=walk(path.join(root,'content')).filter(f=>/lessons-\d\d-\d\d\.json$/.test(f)).flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));
if(lessons.length!==16||new Set(lessons.map(x=>x.id)).size!==16)errors.push('Expected exactly 16 distinct lessons');
for(const x of lessons)for(const lang of ['en','de']){const d=x[lang];
 if(d.agenda.reduce((n,a)=>n+a.minutes,0)!==100)errors.push(`${x.id}/${lang}: timing`);
 if(!d.agenda.some(a=>a.minutes===5&&/break|pause/i.test(a.title)))errors.push(`${x.id}/${lang}: no 5-minute break`);
 if(d.goals.length<3||d.materials.length<2||d.sources.length<1||d.exit.length<2)errors.push(`${x.id}/${lang}: incomplete materials`);
 if(d.materials.map(m=>m.html.replace(/<[^>]*>/g,'')).join(' ').length<1500)errors.push(`${x.id}/${lang}: insufficient self-contained material`);
 for(const s of d.sources)if(!/^https:\/\//.test(s.url)||!s.title||!s.date||!s.use)errors.push(`${x.id}/${lang}: source metadata missing`);
 for(const key of ['preparation','facilitation','answers','misconceptions','differentiation'])if(!Array.isArray(d.teacher[key])||!d.teacher[key].length)errors.push(`${x.id}/${lang}: missing teacher ${key}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${htmlFiles.length} static HTML pages; ${links} internal links and anchors; 16 complete lessons in both pathways; 100-minute timings.`);
