# Polycrisis semester elective — initial teaching draft

16 × 100-minute lessons for Austrian grades 10–12. Two equally demanding pathways:
- `en/`: English-led bilingual DE/EN, with Austrian German-source connections.
- `de/`: German-led, with supported English bridge passages.

Open `index.html`. All essential navigation, readings and assignments are static HTML and work without JavaScript. Use the browser's Print command on lesson worksheets. The website does not collect student responses. Teacher guidance and model answers are public.

## Editing

Lesson content lives in `content/lessons-*.json`; shared content in `content/common.json`. Rebuild with `node polycrisis/build.mjs` from the repository root, or `node build.mjs` from this folder. Check with `node polycrisis/check.mjs`. Generated HTML is committed so no server/build dependency is required by the host. CSS is isolated within this directory.

All additions are confined to `/polycrisis`. The repository's main `index.html` has no link to this course and is unchanged. An unlinked URL is public, not access-controlled.

## Editorial scope

This is an initial course draft for teacher review. Historical cases are dated; hypothetical classroom datasets are labelled. The authors are analytical sources, not a required political position. Common assessment criteria are suggestions, not an assertion about statutory Austrian grading rules. Individual source links and reading instructions accompany each lesson. No publisher articles are reproduced wholesale.

Prepared 6 October 2026. Before teaching, check external links, choose the pathway, align assessment with school arrangements, and update any explicitly current-affairs extension.

## Applying the delivery package

The accompanying `polycrisis-course.zip` contains a top-level `polycrisis/` folder. Copy that folder into the existing grg23 checkout; it adds no entry to the main homepage. Alternatively run `git apply --check /path/to/polycrisis-grg23.patch` followed by `git apply /path/to/polycrisis-grg23.patch` from the grg23 repository root. Inspect the additions, then commit and push using the repository's normal workflow. The target course URL after the hosting system deploys the commit is `https://pnorthup.me/grg23/polycrisis/`.

The delivery package was prepared because this session's GitHub write tool required approval while its approval policy was set to never. No remote commit or publication was made by this session. Static checks cover lesson completeness, timings, document structure, balanced markup, internal links and anchors. Browser visual review was unavailable because access to Safari was denied.
