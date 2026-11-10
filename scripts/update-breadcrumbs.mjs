/**
 * Generate static ancestor breadcrumbs for every HTML page, including print and
 * OneNote views (navigation hidden in print). Run after adding/moving pages:
 *   bun scripts/update-breadcrumbs.mjs
 * No dependencies, runtime script, or hosting-root assumptions.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const marker = /<!-- site-breadcrumb:start -->[\s\S]*?<!-- site-breadcrumb:end -->(?:[ \t]*\r?\n)*/;
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const directories = {
  general: ['Allgemeine Anleitungen', 'General guides'],
  tasks: ['Aufgaben', 'Tasks'],
  'tasks/fenster-screenshots': ['Fenster und Screenshots', 'Windows and screenshots'],
  'tasks/fenster-screenshots/bonus': ['Bonusaufgaben', 'Bonus tasks'],
  'tasks/fenster-screenshots/windows-10': ['Windows 10', 'Windows 10'],
  'tasks/fenster-screenshots/windows-11': ['Windows 11', 'Windows 11'],
  biber: ['Biber der Informatik', 'Biber der Informatik'],
  passwords: ['Passwörter', 'Passwords'],
  polycrisis: ['Polykrise', 'Polycrisis'],
  'polycrisis/de': ['Deutscher Kurs', 'German course'],
  'polycrisis/en': ['Bilingualer Kurs (EN)', 'Bilingual course (EN)'],
  '3b-dgb/faktencheck-mit-ki': ['Faktencheck mit KI', 'Fact-checking with AI'],
};
for (const folder of ['1a-dgb','1c-dgb','1d-dgb','2e-dgb','3b-dgb','5d-gpb']) {
  const [cls,subject] = folder.toUpperCase().split('-');
  directories[folder] = [`${cls} · ${subject}`, `${cls} · ${subject}`];
}
for (const cls of ['1a','1d']) directories[`${cls}-dgb/4-fenster-screenshots`] = ['Fenster und Screenshots', 'Windows and screenshots'];

function title(html, lang) {
  // Use the visible h1, including separate bilingual h1s, rather than document
  // suffixes such as class names. Preserve existing entities without re-escaping.
  const heads = [...html.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi)];
  const match = heads.find(h => !/data-lang="(de|en)"/.test(h[1]) || h[1].includes(`data-lang="${lang}"`));
  let value = match?.[2] || /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || 'Seite / Page';
  const other = lang === 'de' ? 'en' : 'de';
  value = value.replace(new RegExp(`<([a-z][\\w-]*)\\b[^>]*data-lang="${other}"[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi'), '');
  return text(value);
}
function label(de, en) {
  return de === en ? de : `<span data-lang="de">${de}</span><span data-lang="en">${en}</span>`;
}
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const file = path.join(dir,entry.name);
    return entry.isDirectory() ? walk(file) : file.endsWith('.html') ? [file] : [];
  });
}
export function updateBreadcrumbs(root = repository) {
  const files = walk(root);
  let changed = 0;
  for (const file of files) {
    const original = fs.readFileSync(file,'utf8');
    let html = original;
    const relative = path.relative(root,file).split(path.sep).join('/');
    const parts = relative.split('/');
    const isIndex = parts.at(-1) === 'index.html';
    const ancestors = [];
    if (relative !== 'index.html') ancestors.push(['index.html', 'GRG 23']);
    for (let i=1; i<parts.length; i++) {
      const folder = parts.slice(0,i).join('/');
      const index = `${folder}/index.html`;
      if (index === relative || !fs.existsSync(path.join(root,index))) continue;
      const pair = directories[folder];
      const parent = fs.readFileSync(path.join(root,index),'utf8');
      ancestors.push([index, pair ? label(...pair.map(escape)) : label(title(parent,'de'),title(parent,'en'))]);
    }
    const folder = parts.slice(0,-1).join('/');
    const known = isIndex && directories[folder];
    const current = relative === 'index.html' ? 'GRG 23' : known ? label(...known.map(escape)) : label(title(html,'de'),title(html,'en'));
    const items = ancestors.map(([target,name]) => {
      const href = path.relative(path.dirname(file),path.join(root,target)).split(path.sep).join('/');
      return `<li><a href="${escape(href)}">${name}</a></li>`;
    });
    items.push(`<li><span aria-current="page">${current}</span></li>`);
    const nav = `<!-- site-breadcrumb:start --><nav class="breadcrumb site-breadcrumb" aria-label="Brotkrumen / Breadcrumbs"><ol>${items.join('')}</ol></nav><!-- site-breadcrumb:end -->\n`;
    if (marker.test(html)) {
      html = html.replace(marker, nav);
    } else {
      // Replace only the first real, legacy navigation, not footer attribution
      // paragraphs that also happen to use class="breadcrumb".
      html = html.replace(/<(nav|p)\b[^>]*class="[^"]*\bbreadcrumb\b[^"]*"[^>]*>[\s\S]*?<\/\1>/i, old => /<a\b[^>]*href="(?!https?:)/i.test(old) ? '' : old);
      if (/<div\b[^>]*class="shell"[^>]*>/i.test(html)) {
        html = html.replace(/<div\b[^>]*class="shell"[^>]*>/i, '$&\n'+nav);
      } else if (/<main\b[^>]*>/i.test(html)) {
        html = html.replace(/<main\b[^>]*>/i, '$&\n'+nav);
      } else {
        html = html.replace(/<body\b[^>]*>/i, '$&\n'+nav);
      }
    }
    html = html.replace(marker, nav);
    const css = path.relative(path.dirname(file),path.join(root,'assets/breadcrumbs.css')).split(path.sep).join('/');
    if (!/<link\b[^>]*href="[^"]*\bbreadcrumbs\.css"/i.test(html)) {
      html = html.replace(/<\/head>/i, `<link rel="stylesheet" href="${css}">\n</head>`);
    }
    if (html !== original) { fs.writeFileSync(file,html); changed++; }
  }
  return {pages:files.length, changed};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(updateBreadcrumbs());
}
