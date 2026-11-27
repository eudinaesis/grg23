import{test,expect}from'bun:test';
import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('shared touch-only assignment preserves setup, gesture, evidence and submission',()=>{
 const h=read('general/iPad-Multitasking.html');
 for(const text of ['26.2','Apps als Fenster','Windowed Apps','Slide Over aufrufen','Enter Slide Over','OneNote','Safari','Teams','Home-Taste','volume button','Abgegeben','Turned in','private chats','iPad-Multitasking-OneNote.html','iPad-Multitasking-OneNote-EN.html'])expect(h).toContain(text);
 expect(h).not.toMatch(/\b2[Ee]\b|\b1[AaDd]\b|⌘|Split View|Kurzbefehle-App/);
 expect((h.match(/class="questions"/g)||[]).length).toBe(2);
 for(const id of ['vorbereitung','nebeneinander','slide-over','verstecken','meine-arbeit','abgeben'])expect(h).toContain(`id="${id}"`);
});
test('1A routes through lesson 7 bonus; General retains its shared assignment link',()=>{
 expect(read('1a-dgb/index.html')).toContain('href="EVA-iPad-Teams.html"');
 expect(read('1a-dgb/EVA-iPad-Teams.html')).toContain('href="../general/iPad-Multitasking.html"');
 expect(read('general/index.html')).toContain('iPad-Multitasking.html');
 // 1D now has a separate single-window iPad lesson; do not require its obsolete direct multitasking link.
});
for(const name of ['iPad-Multitasking-OneNote.html','iPad-Multitasking-OneNote-EN.html'])test(name+': copy-ready without scripts, class labels or external content styles',()=>{
 const h=read('general/'+name);
 expect(h).toContain('noindex, nofollow');expect(h).toContain('background-color: #ffff00;');expect(h).not.toContain('<script');
 for(const m of h.matchAll(/<(body|h1|h2|h3)\b([^>]*)>/g))expect(m[2]).toContain("font-family: 'Times New Roman', Times, serif;");
 expect(h).toContain('SCREENSHOT');expect(h).toContain('26.2');expect(h).toContain('https://pnorthup.me/grg23/general/iPad-Multitasking.html');
 expect((h.match(/class="questions"/g)||[]).length).toBe(1);
 expect(h).not.toMatch(/\b2[Ee]\b|\b1[AaDd]\b/);
});
test('all new assignment views contain ancestor navigation',()=>{
 for(const n of ['iPad-Multitasking.html','iPad-Multitasking-OneNote.html','iPad-Multitasking-OneNote-EN.html']){
 const h=read('general/'+n);expect(h).toContain('site-breadcrumb:start');expect(h).toContain('href="../index.html"');expect(h).toContain('href="index.html"');}
});
