# Lesson authoring contract

Create JSON arrays of lesson objects in your assigned `lessons-XX-YY.json`. These files feed a buildless static site generator. Do not edit other files.

Each object: `id` integer; `en` and `de` objects. Each language object has:
- `title`, `question`, `intro` strings.
- `goals`: 3 strings.
- `agenda`: array of `{minutes: integer, title: string, task: string}` totalling exactly 100 (include a 5-minute break). Every task references local materials by their title, gives concrete actions and a deliverable. No missing role cards or unavailable worksheets.
- `materials`: array of `{title: string, html: string}`. HTML fragments can use p, ul, ol, li, strong, em, h3, table/caption/thead/tbody/tr/th/td. Provide an original accessible case reader (about 250–400 words), plus enough actual cards/tables/source comparisons/templates for the activity. Fictional data explicitly labelled; real data sourced with date and units. Avoid long quotations; paraphrase with attribution and do not exceed 200 words derived from any one webpage across your pack. Facts should be verified with web tools, using primary sources. Materials entirely self-contained except explicitly marked extension links.
- `sources`: array of `{title, url, date, use}` strings; actual verified URLs only, dates may be 'Undated; checked 6 October 2026'. Dated historical sources not presented as latest.
- `languageSupport`: HTML string. EN pathway includes German/Austrian connection and original-reading extension with precise passage instruction. DE pathway has an original SHORT English bridge text you write (labelled teacher-written, not a quote) and German questions plus glossary. Same intellectual level, different scaffolding.
- `submission`: concrete individual output, length/format and success criteria; no due dates or upload mechanism invented. Students use teacher's assignment platform or paper; website does not collect responses.
- `exit`: 2 questions.
- `homework`: concrete task <=25 min using supplied material.
- `teacher`: `{preparation: string[], facilitation: string[], answers: string[], misconceptions: string[], differentiation: string[], extension: string}`. Answers include worked calculations where relevant; open-ended alternatives justified. Teacher notes are published openly, labelled as such, not secure.

Audience Austrian grades 10–12 (15–18), semester elective, no prior economics assumed. Focus mechanisms, power, uneven consequences, policy choices, evidence and uncertainty. Do not turn course into advocacy for any author. Distinguish facts, interpretation, values; do not manufacture false balance on established facts. No personal household finance disclosure. Simulations must have complete rules, starting resources, timing, costs, scoring, and debrief/limitations. Shared assessments: portfolio in lessons 5, 8, 13; final individual/pair investigation 1000–1200 words, 2–3 charts, >=4 sources incl independent evidence and contrasting analysis; individual oral defence. Root adds common glossary/rubric/source log/project templates.

This is an initial course draft but all 16 lessons need actual usable starting materials, not placeholder promises.
