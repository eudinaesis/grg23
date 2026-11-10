import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {updateBreadcrumbs} from './update-breadcrumbs.mjs';

test('static ancestor chains, bilingual headings, attribution, and idempotence', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'grg23-breadcrumbs-'));
  const page=(heading,body='')=>`<!doctype html><html lang="de"><head><title>Test</title></head><body><main><h1>${heading}</h1>${body}</main></body></html>`;
  const write=(file,html)=>{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),html);};
  const read=file=>fs.readFileSync(path.join(root,file),'utf8');
  try {
    write('index.html',page('Home'));
    write('general/index.html',page('General','<p class="breadcrumb"><a href="index.html">Self link</a></p>'));
    write('general/topic.html',page('<span data-lang="de">Video &amp; Ton</span><span data-lang="en">Video &amp; audio</span>'));
    write('3b-dgb/index.html',page('3B'));
    write('3b-dgb/unit/index.html',page('Einheit','<p class="breadcrumb"><a href="../">Back</a></p><p class="breadcrumb">Attribution <a href="https://example.com/">Source</a></p>'));
    write('3b-dgb/unit/print.html','<!doctype html><html lang="de"><head></head><body><h1>Print</h1></body></html>');
    write('polycrisis/index.html',page('Course'));
    write('polycrisis/en/index.html',page('English'));
    write('polycrisis/en/lesson.html','<!doctype html><html lang="en"><head></head><body><div class="shell"><header>Hero</header><main><h1>Lesson</h1></main></div></body></html>');
    assert.equal(updateBreadcrumbs(root).pages,9);
    const general=read('general/index.html');
    assert.match(general,/<a href="\.\.\/index.html">GRG 23<\/a>/);
    assert.doesNotMatch(general,/Self link/);
    assert.match(read('general/topic.html'),/data-lang="de">Video &amp; Ton<\/span><span data-lang="en">Video &amp; audio/);
    assert.match(read('3b-dgb/unit/print.html'),/href="\.\.\/\.\.\/index.html"/);
    assert.match(read('3b-dgb/unit/print.html'),/href="\.\.\/index.html"/);
    assert.match(read('3b-dgb/unit/print.html'),/href="index.html"/);
    assert.match(read('3b-dgb/unit/index.html'),/Attribution <a href="https:\/\/example.com\/">Source/);
    assert.match(read('polycrisis/en/lesson.html'),/class="shell">\n<!-- site-breadcrumb:start -->/);
    assert.equal((read('polycrisis/en/lesson.html').match(/<li><a /g)||[]).length,3);
    assert.equal(updateBreadcrumbs(root).changed,0);
    assert.equal((read('general/topic.html').match(/breadcrumbs.css/g)||[]).length,1);
    assert.doesNotMatch(read('index.html'),/<li><a /);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
