# Password tester

`index.html` is the section landing page; its only activity is `tester.html`.
The interface, feedback and time estimates are available in English and German.
The initial language follows the browser's language (English fallback). A manual
choice is kept for the current tab session. The expandable explanation also
switches language. Both dictionaries stay active regardless of display language.
The checked options in the zxcvbn-ts demo are fixed on: translated feedback,
common keyboard graphs, common/English/German dictionaries, Levenshtein matching,
200 ms input debounce, and the Pwned Passwords matcher. No option controls or
user-inputs field are rendered. Other library settings retain their defaults.

The JavaScript and dictionaries are bundled locally, with no runtime CDN imports.
The breach matcher makes the upstream padded, SHA-1 prefix lookup to Have I Been
Pwned. Failed lookups time out after eight seconds and show a notice while keeping
the dictionary-based estimate. The page neither stores nor logs test input.

To rebuild after editing `src/tester.js`, run `npm install` then `npm run build`
inside this directory. Commit the updated `tester.js`. No build step is required
for GitHub Pages. Third-party notices are in `THIRD_PARTY_LICENSES.txt`.
