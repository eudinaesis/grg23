# EVA: Geräte zuordnen (Deutsch)

Browser activity: https://pnorthup.me/grg23/tasks/eva-prinzip/

German adaptation of the 16-item LearningApps exercise `posy2fyyk24`, with expandable explanations, drag-and-drop, tap and keyboard controls. Original attribution retained in the page footer. No LearningApps runtime or analytics are loaded.

## Editing

- `content.js`: readable item labels, hints and answer categories.
- `app.js`, `style.css`: exercise behavior and presentation.
- `scorm.js`: SCORM 1.2 adapter; on this static website no LMS is connected.
- `index.html`: browser entry page, full static site breadcrumbs and optional SCORM download.
- `EVA-Deutsch-mit-Hinweisen-SCORM12.zip`: unchanged importable package delivered 2026-11-19. Its entry HTML is deliberately independent of site breadcrumbs/styles.

The static copy has the same questions and grading as the package, but the no-LMS message describes website practice rather than a preview. Results and progress are **not** saved on the static site; pupils write their score on the worksheet. Reloading starts again. The ZIP can separately save progress when imported in an LMS.

Web edits do not automatically change the downloadable ZIP. Rebuild and re-test the SCORM source separately when changing its content. Workspace source and tests: `/workspace/projects/class-materials/scorm/eva-de/`; original is preserved there outside the public repository. Reusable skill: `scorm-editing`.
