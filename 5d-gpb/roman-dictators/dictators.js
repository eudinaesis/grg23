import {DE_TEXT, DE_NOTES} from "./de.js";
// Only the language preference is stored, never search terms or selected records.
let language = "en";
const staticTexts = [], staticAttributes = [];
function t(value, vars = {}) {
  let text = language === "de" && Object.hasOwn(DE_TEXT, value) ? DE_TEXT[value] : value;
  if (language === "de" && text.startsWith("Livy, Book ")) text = text.replace("Livy, Book ", "Livius, Buch ");
  return text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? "{" + key + "}"));
}
function yearText(value) { return language === "de" ? value.replace(/^c\. /, "ca. ").replace(/\bBC\b/g, "v. Chr.") : value; }
function noteText(d) { return language === "de" ? DE_NOTES[d.id] : d.note; }
function captureStaticTranslations() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest("script,style,noscript,.language-switch,.site-footer em")) continue;
    const raw = node.nodeValue, key = raw.trim().replace(/\s+/g, " ");
    if (key) staticTexts.push({node, raw, key});
  }
  for (const element of document.querySelectorAll("[aria-label],[placeholder],[title]")) {
    if (element.closest(".language-switch")) continue;
    for (const name of ["aria-label", "placeholder", "title"]) if (element.hasAttribute(name)) staticAttributes.push({element, name, value: element.getAttribute(name)});
  }
}
function applyStaticLanguage() {
  for (const {node, raw, key} of staticTexts) node.nodeValue = language === "en" ? raw : raw.match(/^\s*/)[0] + t(key) + raw.match(/\s*$/)[0];
  for (const {element, name, value} of staticAttributes) element.setAttribute(name, t(value));
  document.title = t("Dictators of the Roman Republic (501–44 BC)");
}
function setLanguage(next, persist = true, redraw = true) {
  language = next === "de" ? "de" : "en";
  document.documentElement.lang = language;
  for (const button of document.querySelectorAll("[data-set-lang]")) button.setAttribute("aria-pressed", String(button.dataset.setLang === language));
  if (persist) { try { localStorage.setItem("grg23-language", language); } catch { /* Works without storage. */ } }
  applyStaticLanguage();
  if (redraw) {
    renderKPIs(); renderFilterPills(); renderDossier(); renderTimeline(); renderCenturyChart(); renderTable(); hideTooltip();
    const toggle = document.getElementById("toggleTableBtn");
    toggle.textContent = t(state.tableVisible ? "Hide Table" : "Show Table");
  }
}


// =========================================================================
// COMPLETE DATASET: ALL 90 RECORDED DICTATORSHIPS (70 DISTINCT MEN)
// =========================================================================
const DICTATORS = [
  // --- 6th–5th Century BC (13 entries) ---
  {
    id: "501-larcius",
    personId: "p-larcius",
    year: -501,
    yearLabel: "501 BC",
    name: "Titus Larcius Flavus",
    magister: "Spurius Cassius Vecellinus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "First dictator of the Roman Republic, appointed during a war scare with the Sabines and Latin League. Negotiated peace and resigned before his six-month term expired. Ancient sources disagreed on the year (501 vs. 498 BC) and whether Larcius or Manius Valerius was the first dictator."
  },
  {
    id: "496-postumius",
    personId: "p-postumius-albus",
    year: -496,
    yearLabel: "496 BC",
    name: "Aulus Postumius Albus Regillensis",
    magister: "Titus Aebutius Helva",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Commanded Rome to victory over the Latin League and the exiled Tarquins at the Battle of Lake Regillus, celebrated a triumph, and stepped down. Livy dates the Battle of Lake Regillus to 499 BC vs. 496 BC in the Fasti and Dionysius."
  },
  {
    id: "494-valerius",
    personId: "p-valerius-maximus",
    year: -494,
    yearLabel: "494 BC",
    name: "Manius Valerius Volusus Maximus",
    magister: "Quintus Servilius Priscus Structus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly (in protest)",
    note: "Defeated the Sabines during the First Secession of the Plebs. When the Senate refused to honor his pledge of debt relief for plebeian soldiers, he resigned early in protest."
  },
  {
    id: "463-mamercus",
    personId: "p-aemilius-mamercus",
    year: -463,
    yearLabel: "463 BC",
    name: "(Gaius Aemilius Mamercus)",
    magister: "Not recorded",
    causa: "religious",
    causaLatin: "clavi figendi causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "John the Lydian mentions an unnamed dictator in the 48th year of the Republic (associated by later scholars with driving the sacred nail during a severe plague), and Broughton rejects Mamercus as dictator, suggesting an interrex."
  },
  {
    id: "458-cincinnatus",
    personId: "p-cincinnatus",
    year: -458,
    yearLabel: "458 BC",
    name: "Lucius Quinctius Cincinnatus",
    magister: "Lucius Tarquitius Flaccus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly (16 days)",
    note: "Summoned from his farm to rescue a trapped Roman army, he defeated the Aequi at Mount Algidus, celebrated a triumph, and resigned in 16 days to return to his plow."
  },
  {
    id: "439-cincinnatus2",
    personId: "p-cincinnatus",
    year: -439,
    yearLabel: "439 BC",
    name: "Lucius Quinctius Cincinnatus II",
    magister: "Gaius Servilius Ahala",
    causa: "sedition",
    causaLatin: "seditionis sedandae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Recalled in old age to suppress the alleged monarchical plot of Spurius Maelius; after Ahala slew Maelius in the Forum, Cincinnatus resigned promptly once order was restored."
  },
  {
    id: "437-mamercinus",
    personId: "p-mamercinus",
    year: -437,
    yearLabel: "437 BC",
    name: "Mamercus Aemilius Mamercinus",
    magister: "Lucius Quinctius Cincinnatus (son)",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed for war against Veii and Fidenae; won a decisive victory, triumphed, and stepped down."
  },
  {
    id: "435-fidenas",
    personId: "p-fidenas",
    year: -435,
    yearLabel: "435 BC",
    name: "Quintus Servilius Priscus Fidenas",
    magister: "Postumus Aebutius Helva Cornicen",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Captured Fidenae by tunneling beneath its citadel, earning the cognomen Fidenas, then relinquished office."
  },
  {
    id: "434-mamercinus2",
    personId: "p-mamercinus",
    year: -434,
    yearLabel: "434 BC",
    name: "Mamercus Aemilius Mamercinus II",
    magister: "Aulus Postumius Tubertus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed during an Etruscan war scare. When hostilities did not materialize, he passed the Lex Aemilia reducing the censor's term to 18 months and resigned immediately."
  },
  {
    id: "431-tubertus",
    personId: "p-tubertus",
    year: -431,
    yearLabel: "431 BC",
    name: "Aulus Postumius Tubertus",
    magister: "Lucius Julius Iullus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated the Aequi and Volsci at Mount Algidus, celebrated a triumph, and stepped down."
  },
  {
    id: "426-mamercinus3",
    personId: "p-mamercinus",
    year: -426,
    yearLabel: "426 BC",
    name: "Mamercus Aemilius Mamercinus III",
    magister: "Aulus Cornelius Cossus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly (16 days)",
    note: "Defeated Veii and sacked Fidenae, then laid down the dictatorship after just 16 days."
  },
  {
    id: "418-fidenas2",
    personId: "p-fidenas",
    year: -418,
    yearLabel: "418 BC",
    name: "Quintus Servilius Priscus Fidenas II",
    magister: "Gaius Servilius Axilla",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly (8 days)",
    note: "Captured Labici from the Aequi in a swift campaign and resigned on his eighth day in office."
  },
  {
    id: "408-cossus",
    personId: "p-rutilus-cossus",
    year: -408,
    yearLabel: "408 BC",
    name: "Publius Cornelius Rutilus Cossus",
    magister: "Gaius Servilius Ahala",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated a Volscian army near Antium and returned promptly to Rome to resign."
  },

  // --- 4th Century BC (47 entries) ---
  {
    id: "396-camillus",
    personId: "p-camillus",
    year: -396,
    yearLabel: "396 BC",
    name: "Marcus Furius Camillus",
    magister: "Publius Cornelius Maluginensis",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Ended the ten-year siege of Veii by tunneling under the city, celebrated a famous triumph, and stepped down."
  },
  {
    id: "390-camillus2",
    personId: "p-camillus",
    year: -390,
    yearLabel: "390 BC",
    name: "Marcus Furius Camillus II",
    magister: "Lucius Valerius Potitus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "extended",
    exitLabel: "Extended (~1 yr, at Senate request)",
    note: "Recalled from exile after the Gallic sack of Rome; stayed roughly a full year at the Senate's request to oversee Rome's rebuilding before voluntarily stepping down."
  },
  {
    id: "389-camillus3",
    personId: "p-camillus",
    year: -389,
    yearLabel: "389 BC",
    name: "Marcus Furius Camillus III",
    magister: "Gaius Servilius Ahala",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated Volscian, Aequian, and Etruscan coalitions that attacked Rome after the Gallic sack, then resigned."
  },
  {
    id: "385-cossus",
    personId: "p-a-cornelius-cossus",
    year: -385,
    yearLabel: "385 BC",
    name: "Aulus Cornelius Cossus",
    magister: "Titus Quinctius Cincinnatus Capitolinus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated the Volsci and imprisoned Marcus Manlius Capitolinus during domestic unrest before stepping down."
  },
  {
    id: "380-cincinnatus-cap",
    personId: "p-t-quinctius-cincinnatus",
    year: -380,
    yearLabel: "380 BC",
    name: "Titus Quinctius Cincinnatus Capitolinus",
    magister: "Aulus Sempronius Atratinus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly (20 days)",
    note: "Defeated Praeneste at the Allia, captured nine towns, and resigned on his 20th day in office."
  },
  {
    id: "368-camillus4",
    personId: "p-camillus",
    year: -368,
    yearLabel: "368 BC",
    name: "Marcus Furius Camillus IV",
    magister: "Lucius Aemilius Mamercinus",
    causa: "sedition",
    causaLatin: "seditionis sedandae causa",
    exit: "forced",
    exitLabel: "Resigned under tribunician pressure",
    note: "Appointed by patricians to block the plebeian Licinio-Sextian reforms; faced stiff opposition from tribunes threatening a heavy fine and abdicated early."
  },
  {
    id: "368-manlius",
    personId: "p-p-manlius-capitolinus",
    year: -368,
    yearLabel: "368 BC",
    name: "Publius Manlius Capitolinus",
    magister: "Gaius Licinius Calvus",
    causa: "sedition",
    causaLatin: "seditionis sedandae et rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Replaced Camillus with a conciliatory stance and named the first plebeian Master of Horse before stepping down."
  },
  {
    id: "367-camillus5",
    personId: "p-camillus",
    year: -367,
    yearLabel: "367 BC",
    name: "Marcus Furius Camillus V",
    magister: "Titus Quinctius Cincinnatus Capitolinus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "At age 80, repelled another Gallic invasion, brokered the compromise passing the Licinio-Sextian laws, vowed the Temple of Concord, and resigned."
  },
  {
    id: "363-imperiosus",
    personId: "p-l-manlius-imperiosus",
    year: -363,
    yearLabel: "363 BC",
    name: "Lucius Manlius Capitolinus Imperiosus",
    magister: "Lucius Pinarius Natta",
    causa: "religious",
    causaLatin: "clavi figendi causa",
    exit: "forced",
    exitLabel: "Forced out by tribunes (overreach)",
    note: "Appointed strictly to hammer a sacred nail to end a pestilence, he tried to turn the religious appointment into a harsh military levy against the Hernici and was forced out by the tribunes."
  },
  {
    id: "362-claudius",
    personId: "p-ap-claudius-crassus",
    year: -362,
    yearLabel: "362 BC",
    name: "Appius Claudius Crassus Regillensis",
    magister: "Publius Cornelius Scapula (?)",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Took command against the Hernici after a consul fell in battle, secured victory, and resigned."
  },
  {
    id: "361-pennus",
    personId: "p-t-quinctius-pennus",
    year: -361,
    yearLabel: "361 BC",
    name: "Titus Quinctius Pennus Capitolinus Crispinus",
    magister: "Servius Cornelius Maluginensis",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Commanded against a Gallic incursion at the Anio River, celebrated a triumph, and stepped down."
  },
  {
    id: "360-ahala",
    personId: "p-q-servilius-ahala",
    year: -360,
    yearLabel: "360 BC",
    name: "Quintus Servilius Ahala",
    magister: "Titus Quinctius Pennus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated Gauls allied with Tibur near the Colline Gate, deferred credit to the consuls, and stepped down."
  },
  {
    id: "358-peticus",
    personId: "p-c-sulpicius-peticus",
    year: -358,
    yearLabel: "358 BC",
    name: "Gaius Sulpicius Peticus",
    magister: "Marcus Valerius Poplicola",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Routed a Gallic army using disguised camp muleteers as a decoy cavalry force, triumphed, and resigned."
  },
  {
    id: "356-rutilus",
    personId: "p-c-marcius-rutilus",
    year: -356,
    yearLabel: "356 BC",
    name: "Gaius Marcius Rutilus",
    magister: "Gaius Plautius Proculus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "First plebeian dictator in Roman history. Defeated the Etruscans, triumphed by vote of the people despite patrician resistance, and stepped down."
  },
  {
    id: "353-torquatus",
    personId: "p-t-manlius-torquatus",
    year: -353,
    yearLabel: "353 BC",
    name: "Titus Manlius Imperiosus Torquatus",
    magister: "Aulus Cornelius Cossus Arvina",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed against Caere; secured a 100-year truce without battle and stepped down."
  },
  {
    id: "352-iulus",
    personId: "p-c-julius-iulus",
    year: -352,
    yearLabel: "352 BC",
    name: "Gaius Julius Iulus",
    magister: "Lucius Aemilius Mamercinus",
    causa: "military",
    causaLatin: "rei gerundae et comitiorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed over a false Etruscan war rumor; tried unsuccessfully to steer consular elections for patricians, then stepped down."
  },
  {
    id: "351-ambustus",
    personId: "p-m-fabius-ambustus",
    year: -351,
    yearLabel: "351 BC",
    name: "Marcus Fabius Ambustus",
    magister: "Quintus Servilius Ahala",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "First dictator explicitly recorded by Livy as appointed solely to conduct consular elections; stepped down afterward."
  },
  {
    id: "350-camillus-l",
    personId: "p-l-furius-camillus",
    year: -350,
    yearLabel: "350 BC",
    name: "Lucius Furius Camillus",
    magister: "Publius Cornelius Scipio",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Held consular elections (winning election as consul for the following year) and stepped down."
  },
  {
    id: "349-torquatus2",
    personId: "p-t-manlius-torquatus",
    year: -349,
    yearLabel: "349 BC",
    name: "Titus Manlius Imperiosus Torquatus II",
    magister: "Aulus Cornelius Cossus Arvina II",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Presided over consular elections during campaigns against Gauls and Greek raiders, then resigned."
  },
  {
    id: "348-crassinus",
    personId: "p-c-claudius-crassinus",
    year: -348,
    yearLabel: "348 BC",
    name: "(Gaius Claudius Crassinus Regillensis)",
    magister: "Gaius Livius Denter (?)",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed strictly to hold consular elections and stepped down. Livy (7.26.15) leaves the dictator unnamed; the tentative name comes from 19th-century conjecture."
  },
  {
    id: "345-camillus-l2",
    personId: "p-l-furius-camillus",
    year: -345,
    yearLabel: "345 BC",
    name: "Lucius Furius Camillus II",
    magister: "Gnaeus Manlius Capitolinus Imperiosus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated the Aurunci in a single battle, vowed the Temple of Juno Moneta, and resigned immediately."
  },
  {
    id: "344-poplicola",
    personId: "p-p-valerius-poplicola",
    year: -344,
    yearLabel: "344 BC",
    name: "Publius Valerius Poplicola",
    magister: "Quintus Fabius Ambustus",
    causa: "religious",
    causaLatin: "feriarum constituendarum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed to establish religious expiation rites after a rain of stones and a daytime eclipse, then stepped down."
  },
  {
    id: "342-corvus",
    personId: "p-m-valerius-corvus",
    year: -342,
    yearLabel: "342 BC",
    name: "Marcus Valerius Corvus",
    magister: "Lucius Aemilius Mamercinus Privernas",
    causa: "sedition",
    causaLatin: "seditionis sedandae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defused a mutiny of Roman troops garrisoned at Capua through negotiation and amnesty, then resigned."
  },
  {
    id: "340-crassus",
    personId: "p-l-papirius-crassus",
    year: -340,
    yearLabel: "340 BC",
    name: "Lucius Papirius Crassus",
    magister: "Lucius Papirius Cursor",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Campaigned against Antium during the Latin War without a major battle and stepped down."
  },
  {
    id: "339-philo",
    personId: "p-q-publilius-philo",
    year: -339,
    yearLabel: "339 BC",
    name: "Quintus Publilius Philo",
    magister: "Decimus Junius Brutus Scaeva",
    causa: "sedition",
    causaLatin: "rei gerundae / leges Publiliae",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Plebeian dictator who passed three landmark pro-plebeian laws, then stepped down."
  },
  {
    id: "337-inregillensis",
    personId: "p-c-claudius-inregillensis",
    year: -337,
    yearLabel: "337 BC",
    name: "Gaius Claudius Inregillensis",
    magister: "Gaius Claudius Hortator",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "forced",
    exitLabel: "Abdicated (faulty auspices)",
    note: "Augurs declared the religious auspices at his appointment defective (vitio creatus); he abdicated immediately."
  },
  {
    id: "335-privernas",
    personId: "p-l-aemilius-privernas",
    year: -335,
    yearLabel: "335 BC",
    name: "Lucius Aemilius Mamercinus Privernas",
    magister: "Quintus Publilius Philo",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed solely to preside over consular elections while consuls were campaigning, then resigned."
  },
  {
    id: "334-rufinus1",
    personId: "p-rufinus-334",
    year: -334,
    yearLabel: "334/333 BC",
    name: "Publius Cornelius Rufinus",
    magister: "Marcus Antonius",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "forced",
    exitLabel: "Abdicated (faulty auspices; 1st Dictator Yr)",
    note: "Abdicated due to faulty auspices; followed in the Fasti Capitolini by the first 'Dictator Year' (333 BC, without consuls), generally regarded as chronological padding. Distinct from the dictator of c. 276 BC."
  },
  {
    id: "332-crassus-m",
    personId: "p-m-papirius-crassus",
    year: -332,
    yearLabel: "332 BC",
    name: "Marcus Papirius Crassus",
    magister: "Publius Valerius Poplicola",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed during a Gallic war scare; when scouts confirmed peace, he disbanded the levies and stepped down."
  },
  {
    id: "331-varus",
    personId: "p-cn-quinctilius-varus",
    year: -331,
    yearLabel: "331 BC",
    name: "Gnaeus Quinctilius Varus",
    magister: "Lucius Valerius Potitus",
    causa: "religious",
    causaLatin: "clavi figendi causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Hammered the sacred nail into the Temple of Jupiter to purify Rome after a mass-poisoning scandal, then resigned. Livy (8.18.12–13) names him Cn. Quinctius Capitolinus vs. Cn. Quinctilius Varus in the Fasti Capitolini."
  },
  {
    id: "327-marcellus",
    personId: "p-m-claudius-marcellus",
    year: -327,
    yearLabel: "327 BC",
    name: "Marcus Claudius Marcellus",
    magister: "Spurius Postumius Albinus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "forced",
    exitLabel: "Abdicated (flawed appointment)",
    note: "Plebeian dictator who abdicated after augurs declared his appointment religiously flawed—an act tribunes suspected of patrician obstruction."
  },
  {
    id: "325-cursor1",
    personId: "p-l-papirius-cursor",
    year: -325,
    yearLabel: "325/324 BC",
    name: "Lucius Papirius Cursor",
    magister: "Quintus Fabius Maximus Rullianus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "extended",
    exitLabel: "2nd 'Dictator Year' (324 BC)",
    note: "Defeated the Samnites and famously clashed with his Master of Horse for engaging without orders; associated with the second 'Dictator Year' (324 BC) in the Fasti."
  },
  {
    id: "322-arvina",
    personId: "p-a-cornelius-arvina",
    year: -322,
    yearLabel: "322 BC",
    name: "Aulus Cornelius Cossus Arvina",
    magister: "Marcus Fabius Ambustus",
    causa: "religious",
    causaLatin: "ludorum faciendorum / rei gerundae",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Presided over the Ludi Romani games when the praetor fell ill (some annalists also credited him with a Samnite victory), then stepped down."
  },
  {
    id: "321-ambustus",
    personId: "p-q-fabius-ambustus",
    year: -321,
    yearLabel: "321 BC",
    name: "Quintus Fabius Ambustus",
    magister: "Publius Aelius Paetus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "forced",
    exitLabel: "Abdicated (faulty auspices)",
    note: "Appointed after the Caudine Forks disaster to hold elections, but abdicated due to faulty auspices."
  },
  {
    id: "321-papus",
    personId: "p-m-aemilius-papus",
    year: -321,
    yearLabel: "321 BC",
    name: "Marcus Aemilius Papus",
    magister: "Lucius Valerius Flaccus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Replaced Fabius Ambustus to conduct elections, could not break the political deadlock, and stepped down for an interrex."
  },
  {
    id: "320-maenius",
    personId: "p-c-maenius",
    year: -320,
    yearLabel: "320 BC",
    name: "Gaius Maenius",
    magister: "Marcus Foslius Flaccinator",
    causa: "sedition",
    causaLatin: "causa uncertain",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "One of three dictators recorded in the Fasti Capitolini for 320 BC (omitted by Livy); the exact reason for his appointment is uncertain, though some scholars suggest a religious or administrative mandate."
  },
  {
    id: "320-lentulus",
    personId: "p-l-cornelius-lentulus",
    year: -320,
    yearLabel: "320 BC",
    name: "Lucius Cornelius Lentulus",
    magister: "Lucius Papirius Cursor II",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Campaigned against the Samnites in the aftermath of the Caudine Forks and relinquished office upon completion."
  },
  {
    id: "320-torquatus3",
    personId: "p-t-manlius-torquatus",
    year: -320,
    yearLabel: "320 BC",
    name: "Titus Manlius Imperiosus Torquatus III",
    magister: "Lucius Papirius Cursor III",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Third dictatorship; oversaw elections for the next year's magistrates and stepped down."
  },
  {
    id: "316-privernas2",
    personId: "p-l-aemilius-privernas",
    year: -316,
    yearLabel: "316 BC",
    name: "Lucius Aemilius Mamercinus Privernas II",
    magister: "Lucius Fulvius Curvus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Besieged Saticula during the Second Samnite War, defeated a Samnite relief force, and stepped down."
  },
  {
    id: "315-rullianus",
    personId: "p-q-fabius-rullianus",
    year: -315,
    yearLabel: "315 BC",
    name: "Quintus Fabius Maximus Rullianus",
    magister: "Quintus Aulius Cerretanus / Gaius Fabius Ambustus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Captured Saticula and fought the Battle of Lautulae against the Samnites (where his Master of Horse fell), then stepped down."
  },
  {
    id: "314-maenius2",
    personId: "p-c-maenius",
    year: -314,
    yearLabel: "314 BC",
    name: "Gaius Maenius II",
    magister: "Marcus Foslius Flaccinator II",
    causa: "sedition",
    causaLatin: "quaestionibus exercendis",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Investigated conspiracies at Capua and Rome; when nobles accused him of exceeding his remit, he resigned voluntarily to face trial and was acquitted."
  },
  {
    id: "313-poetelius",
    personId: "p-c-poetelius-libo",
    year: -313,
    yearLabel: "313 BC",
    name: "Gaius Poetelius Libo Visolus",
    magister: "Marcus Foslius Flaccinator III",
    causa: "military",
    causaLatin: "rei gerundae (et clavi figendi?) causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Captured Nola from the Samnites (and is linked by some sources to driving the sacred nail), then stepped down. Diodorus Siculus (19.101) attributes this dictatorship to Q. Fabius Maximus Rullianus instead."
  },
  {
    id: "312-longus",
    personId: "p-c-sulpicius-longus",
    year: -312,
    yearLabel: "312 BC",
    name: "Gaius Sulpicius Longus",
    magister: "Gaius Junius Bubulcus Brutus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Mobilized an army against a threatened Etruscan attack, held the border defensively, and resigned. Livy (9.29.3) names C. Junius Bubulcus Brutus as dictator in 312 BC vs. Gaius Sulpicius Longus in the Fasti."
  },
  {
    id: "310-cursor2",
    personId: "p-l-papirius-cursor",
    year: -310,
    yearLabel: "310/309 BC",
    name: "Lucius Papirius Cursor II",
    magister: "Gaius Junius Bubulcus Brutus II",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "extended",
    exitLabel: "3rd 'Dictator Year' (309 BC)",
    note: "Won a celebrated triumph over the Samnites; associated with the third 'Dictator Year' (309 BC) in the Fasti."
  },
  {
    id: "306-barbatus",
    personId: "p-p-cornelius-barbatus",
    year: -306,
    yearLabel: "306 BC",
    name: "Publius Cornelius Scipio Barbatus",
    magister: "Publius Decius Mus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Conducted consular elections while both consuls were tied down in the Samnite War, then stepped down."
  },
  {
    id: "302-brutus",
    personId: "p-c-junius-brutus",
    year: -302,
    yearLabel: "302 BC",
    name: "Gaius Junius Bubulcus Brutus",
    magister: "Marcus Titinius",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Defeated an Aequian revolt and returned in triumph on the eighth day, dedicated the Temple of Salus, and resigned."
  },
  {
    id: "302-corvus2",
    personId: "p-m-valerius-corvus",
    year: -302,
    yearLabel: "302/301 BC",
    name: "Marcus Valerius Corvus II",
    magister: "Marcus Aemilius Paullus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "extended",
    exitLabel: "4th 'Dictator Year' (301 BC)",
    note: "Defeated the Marsi and Etruscans, celebrating a triumph; associated with the fourth 'Dictator Year' (301 BC) in the Fasti."
  },

  // --- 3rd Century BC (24 entries) ---
  {
    id: "287-hortensius",
    personId: "p-q-hortensius",
    year: -287,
    yearLabel: "287 BC",
    name: "Quintus Hortensius",
    magister: "Not recorded",
    causa: "sedition",
    causaLatin: "seditionis sedandae causa",
    exit: "died",
    exitLabel: "Died in office (mortuus est)",
    note: "Appointed during the final Secession of the Plebs to the Janiculum Hill. Passed the historic Lex Hortensia making plebiscites binding on all citizens, then died in office."
  },
  {
    id: "287-caecus",
    personId: "p-ap-claudius-caecus",
    year: -287,
    yearLabel: "c. 287 BC",
    name: "Appius Claudius Caecus (?)",
    magister: "Not recorded",
    causa: "sedition",
    causaLatin: "dictator suffectus (?)",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Known from inscriptions to have held a dictatorship, possibly as suffect dictator after Hortensius's death. Broughton (MRR, Vol. 1) dates this and two other fragmentary dictators (Barbula and Rufinus) broadly to 292–285 BC."
  },
  {
    id: "285-barbula",
    personId: "p-m-aemilius-barbula",
    year: -285,
    yearLabel: "c. 285 BC",
    name: "Marcus Aemilius Barbula (?)",
    magister: "Not recorded",
    causa: "military",
    causaLatin: "causa uncertain",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Recorded in fragmentary sources from the lost books of Livy. Broughton (MRR, Vol. 1) dates this and two other fragmentary dictators (Caecus and Rufinus) broadly to 292–285 BC."
  },
  {
    id: "280-calvinus",
    personId: "p-cn-domitius-calvinus",
    year: -280,
    yearLabel: "280 BC",
    name: "Gnaeus Domitius Calvinus Maximus",
    magister: "Not recorded",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Presided over elections during the Pyrrhic War crisis, then stepped down."
  },
  {
    id: "276-rufinus2",
    personId: "p-rufinus-276",
    year: -276,
    yearLabel: "c. 276 BC",
    name: "Publius Cornelius Rufinus (?)",
    magister: "Not recorded",
    causa: "military",
    causaLatin: "rei gerundae causa (?)",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Two-time consul (290 and 277 BC) recorded as dictator in later sources, distinct from the dictator of 334 BC. Broughton (MRR, Vol. 1) dates this and two other fragmentary dictators (Caecus and Barbula) broadly to 292–285 BC."
  },
  {
    id: "263-centumalus",
    personId: "p-cn-fulvius-centumalus",
    year: -263,
    yearLabel: "263 BC",
    name: "Gnaeus Fulvius Maximus Centumalus",
    magister: "Quintus Marcius Philippus",
    causa: "religious",
    causaLatin: "clavi figendi causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Last recorded dictator appointed solely to hammer the sacred nail into the Temple of Jupiter; stepped down upon completing the rite."
  },
  {
    id: "257-ogulnius",
    personId: "p-q-ogulnius-gallus",
    year: -257,
    yearLabel: "257 BC",
    name: "Quintus Ogulnius Gallus",
    magister: "Marcus Laetorius Plancianus",
    causa: "religious",
    causaLatin: "Latinarum feriarum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Appointed to preside over the Latin Festival while consuls were fighting Carthage in the First Punic War, then stepped down."
  },
  {
    id: "249-glicia",
    personId: "p-m-claudius-glicia",
    year: -249,
    yearLabel: "249 BC",
    name: "Marcus Claudius Glicia",
    magister: "None (forced out immediately)",
    causa: "military",
    causaLatin: "rei gerundae causa (spite nomination)",
    exit: "forced",
    exitLabel: "Compelled to resign immediately",
    note: "Freedman and scribe nominated in spite by the disgraced consul P. Claudius Pulcher after losing at Drepana; the Senate compelled Glicia to resign immediately."
  },
  {
    id: "249-calatinus",
    personId: "p-a-atilius-calatinus",
    year: -249,
    yearLabel: "249 BC",
    name: "Aulus Atilius Calatinus",
    magister: "Lucius Caecilius Metellus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Replaced Glicia and became the first Roman dictator to command an army outside the Italian peninsula (in Sicily against Carthage), then stepped down."
  },
  {
    id: "246-coruncanius",
    personId: "p-ti-coruncanius",
    year: -246,
    yearLabel: "246 BC",
    name: "Tiberius Coruncanius",
    magister: "Marcus Fulvius Flaccus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Rome's first plebeian Pontifex Maximus; appointed to hold elections while consuls fought in Sicily, then stepped down."
  },
  {
    id: "231-duilius",
    personId: "p-c-duilius",
    year: -231,
    yearLabel: "231 BC",
    name: "Gaius Duilius",
    magister: "Gaius Aurelius Cotta",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Naval hero of Mylae; appointed in old age to conduct consular elections, then stepped down."
  },
  {
    id: "224-metellus",
    personId: "p-l-caecilius-metellus",
    year: -224,
    yearLabel: "224 BC",
    name: "Lucius Caecilius Metellus",
    magister: "Numerius Fabius Buteo",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Presided over elections during the Gallic wars in northern Italy, then stepped down."
  },
  {
    id: "221-fabius1",
    personId: "p-q-fabius-maximus",
    year: -221,
    yearLabel: "c. 221 BC",
    name: "Quintus Fabius Maximus Verrucosus",
    magister: "Gaius Flaminius",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa (?)",
    exit: "forced",
    exitLabel: "Abdicated (bad omen: squeaking shrew)",
    note: "According to Valerius Maximus, Fabius and Flaminius abdicated after the squeak of a shrew (sorex) was heard during the auspices (Plutarch tells the same omen story with Minucius as dictator)."
  },
  {
    id: "217-fabius",
    personId: "p-q-fabius-maximus",
    year: -217,
    yearLabel: "217 BC",
    name: "Quintus Fabius Maximus Verrucosus II",
    magister: "Marcus Minucius Rufus",
    causa: "military",
    causaLatin: "rei gerundae causa (prodictator)",
    exit: "quiet",
    exitLabel: "Left quietly (6-month term)",
    note: "Appointed after Hannibal's ambush at Lake Trasimene; Livy (22.8 & 31) explicitly calls Fabius a prodictator elected by the people because the surviving consul was cut off by Hannibal. Pioneered 'Fabian' delaying tactics; even after a popular law granted his Master of Horse Minucius equal authority, Fabius rescued him and stepped down at six months."
  },
  {
    id: "217-philo",
    personId: "p-l-veturius-philo",
    year: -217,
    yearLabel: "217 BC",
    name: "Lucius Veturius Philo",
    magister: "Marcus Pomponius Matho",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "forced",
    exitLabel: "Abdicated (14 days, faulty appointment)",
    note: "Appointed to hold elections after Fabius's term ended, but abdicated after 14 days due to a faulty appointment."
  },
  {
    id: "216-pera",
    personId: "p-m-junius-pera",
    year: -216,
    yearLabel: "216 BC",
    name: "Marcus Junius Pera",
    magister: "Tiberius Sempronius Gracchus",
    causa: "military",
    causaLatin: "rei gerundae causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Last traditional military dictator of the Republic; appointed after the disaster at Cannae, he armed 8,000 slaves and prisoners to defend Rome, then stepped down."
  },
  {
    id: "216-buteo",
    personId: "p-m-fabius-buteo",
    year: -216,
    yearLabel: "216 BC",
    name: "Marcus Fabius Buteo",
    magister: "None (sine magistro equitum)",
    causa: "sedition",
    causaLatin: "senatus legendi causa",
    exit: "quiet",
    exitLabel: "Left quietly (same day!)",
    note: "Appointed without a Master of Horse (sine magistro equitum) while Pera was still in office, strictly to enroll 177 new senators after Cannae; he completed the list and resigned the same day."
  },
  {
    id: "213-centho",
    personId: "p-c-claudius-centho",
    year: -213,
    yearLabel: "213 BC",
    name: "Gaius Claudius Centho",
    magister: "Quintus Fulvius Flaccus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Presided over elections while consuls campaigned against Hannibal, then stepped down."
  },
  {
    id: "210-flaccus",
    personId: "p-q-fulvius-flaccus",
    year: -210,
    yearLabel: "210 BC",
    name: "Quintus Fulvius Flaccus",
    magister: "Publius Licinius Crassus Dives",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Conducted elections (sparking debate when the leading century voted for Flaccus himself as consul), then stepped down."
  },
  {
    id: "208-torquatus-t",
    personId: "p-t-manlius-torquatus-208",
    year: -208,
    yearLabel: "208 BC",
    name: "Titus Manlius Torquatus",
    magister: "Gaius Servilius Geminus",
    causa: "elections",
    causaLatin: "comitiorum et ludorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Conducted both consular elections and the Great Games after both consuls were struck down in Hannibal's ambush, then resigned."
  },
  {
    id: "207-salinator",
    personId: "p-m-livius-salinator",
    year: -207,
    yearLabel: "207 BC",
    name: "Marcus Livius Salinator",
    magister: "Quintus Caecilius Metellus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Victor of the Battle of the Metaurus; appointed to conduct elections, then stepped down."
  },
  {
    id: "205-metellus-q",
    personId: "p-q-caecilius-metellus",
    year: -205,
    yearLabel: "205 BC",
    name: "Quintus Caecilius Metellus",
    magister: "Lucius Veturius Philo",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Held elections while Scipio prepared his African invasion, then stepped down."
  },
  {
    id: "203-galba",
    personId: "p-p-sulpicius-galba",
    year: -203,
    yearLabel: "203 BC",
    name: "Publius Sulpicius Galba Maximus",
    magister: "Marcus Servilius Pulex Geminus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Recalled the consul Cn. Servilius Caepio from Sicily before he could cross to Africa and conducted elections, then stepped down."
  },
  {
    id: "202-geminus",
    personId: "p-c-servilius-geminus",
    year: -202,
    yearLabel: "202 BC",
    name: "Gaius Servilius Geminus",
    magister: "Publius Aelius Paetus",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly",
    note: "Final traditional dictator of the Republic. Held elections after Zama and stepped down—ushering in a 120-year hiatus in which the office went unused."
  },

  // --- 1st Century BC (6 entries) ---
  {
    id: "82-sulla",
    personId: "p-sulla",
    year: -82,
    yearLabel: "82–81 BC",
    name: "Lucius Cornelius Sulla Felix",
    magister: "Lucius Valerius Flaccus",
    causa: "constitution",
    causaLatin: "legibus scribundis et rei publicae constituendae",
    exit: "broke_limit",
    exitLabel: "Broke 6-month limit (~1 yr), then resigned",
    note: "Revived the office after 120 years with no time limit following civil war. Executed thousands via proscriptions and rewrote Rome's constitution, then resigned the dictatorship in late 81 BC (serving as ordinary consul in 80 BC before retiring to private life in 79 BC)."
  },
  {
    id: "49-caesar1",
    personId: "p-caesar",
    year: -49,
    yearLabel: "49 BC",
    name: "Gaius Julius Caesar",
    magister: "None (sine magistro equitum)",
    causa: "elections",
    causaLatin: "comitiorum habendorum causa",
    exit: "quiet",
    exitLabel: "Left quietly (11 days)",
    note: "Appointed without a Master of Horse (sine magistro equitum) after crossing the Rubicon; oversaw his own consular election and debt measures, then resigned after 11 days."
  },
  {
    id: "48-caesar2",
    personId: "p-caesar",
    year: -48,
    yearLabel: "48–47 BC",
    name: "Gaius Julius Caesar II",
    magister: "Marcus Antonius",
    causa: "constitution",
    causaLatin: "rei gerundae causa (1-year term)",
    exit: "broke_limit",
    exitLabel: "Broke 6-month limit (1-year term)",
    note: "After defeating Pompey at Pharsalus, Caesar was appointed dictator for a full year—double the traditional six-month cap."
  },
  {
    id: "46-caesar3",
    personId: "p-caesar",
    year: -46,
    yearLabel: "46–45 BC",
    name: "Gaius Julius Caesar III",
    magister: "Marcus Aemilius Lepidus",
    causa: "constitution",
    causaLatin: "rei publicae constituendae (10-year grant)",
    exit: "broke_limit",
    exitLabel: "Broke 6-month limit (10-year grant, yr 1)",
    note: "After Thapsus (April 46 BC), the Senate granted Caesar ten consecutive annual dictatorships, effectively ending the Republican constitutional order."
  },
  {
    id: "45-caesar4",
    personId: "p-caesar",
    year: -45,
    yearLabel: "45–44 BC",
    name: "Gaius Julius Caesar IV",
    magister: "Marcus Aemilius Lepidus II",
    causa: "constitution",
    causaLatin: "rei publicae constituendae (10-year grant)",
    exit: "broke_limit",
    exitLabel: "Broke 6-month limit (10-year grant, yr 2)",
    note: "Second annual term under his ten-year grant; held while consolidating sole power after Munda and preparing his Parthian campaign."
  },
  {
    id: "44-caesar4",
    personId: "p-caesar",
    year: -44,
    yearLabel: "44 BC",
    name: "Gaius Julius Caesar (Dictator Perpetuo)",
    magister: "M. Aemilius Lepidus; C. Octavius & Cn. Domitius Calvinus (designated)",
    causa: "constitution",
    causaLatin: "dictator perpetuo",
    exit: "broke_limit",
    exitLabel: "Refused limit (Perpetual) — Assassinated",
    note: "Assumed 'Dictator in Perpetuity' in February 44 BC, shattering the Republic's foundational taboo against permanent sole rule. Assassinated on the Ides of March; Mark Antony subsequently abolished the dictatorship forever via the Leges Antoniae."
  }
];

// =========================================================================
// METADATA & APPLICATION STATE
// =========================================================================
const SVG_NS = "http://www.w3.org/2000/svg";

const CAUSA_META = {
  military: { label: "Military Emergency", color: "#2b5c8f" },
  elections: { label: "Holding Elections", color: "#2e7d5b" },
  religious: { label: "Religious Rite / Games", color: "#8c5a9e" },
  sedition: { label: "Civic Crisis / Senate", color: "#c47f17" },
  constitution: { label: "Rewrite Constitution", color: "#a61c24" }
};

const EXIT_META = {
  quiet: { label: "Left Quietly", shape: "circle", accent: "#1f6b4b" },
  forced: { label: "Forced Out / Faulty Auspices", shape: "diamond", accent: "#b45309" },
  extended: { label: "Extended / Dictator Year", shape: "square", accent: "#2b5c8f" },
  died: { label: "Died in Office", shape: "cross", accent: "#57534e" },
  broke_limit: { label: "Broke 6-Month Limit", shape: "star", accent: "#a61c24" }
};

const ERA_RANGES = {
  all: { min: -508, max: -38, dataMin: -501, dataMax: -44 },
  early: { min: -506, max: -362, dataMin: -501, dataMax: -367 },
  peak: { min: -370, max: -283, dataMin: -366, dataMax: -287 },
  punic: { min: -290, max: -198, dataMin: -286, dataMax: -202 },
  late: { min: -86, max: -41, dataMin: -82, dataMax: -44 }
};

// =========================================================================
// CLICKABLE BIOGRAPHY & PRIMARY SOURCE LINKS (ALL 70 MEN + KEY CLAIMS)
// =========================================================================

// Restrict source navigation to reviewed HTTPS origins; never accept active URLs.
const SOURCE_HOSTS = new Set(["en.wikipedia.org", "en.wikisource.org", "topostext.org", "penelope.uchicago.edu", "archive.org", "press.umich.edu"]);
function safeSourceURL(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !SOURCE_HOSTS.has(url.hostname) || url.username || url.password || url.port) throw new Error("Unapproved source URL");
  return url.href;
}

const WIKI = slug => `https://en.wikipedia.org/wiki/${slug}`;
const LIVY = book => `https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_${book}`;

const PERSON_WIKI = {
  "p-larcius": "Titus_Larcius",
  "p-postumius-albus": "Aulus_Postumius_Albus_Regillensis",
  "p-valerius-maximus": "Manius_Valerius_Maximus",
  "p-aemilius-mamercus": "Aemilia_gens",
  "p-cincinnatus": "Lucius_Quinctius_Cincinnatus",
  "p-mamercinus": "Mamercus_Aemilius_Mamercinus",
  "p-fidenas": "Quintus_Servilius_Priscus_Fidenas",
  "p-tubertus": "Aulus_Postumius_Tubertus",
  "p-rutilus-cossus": "Publius_Cornelius_Rutilus_Cossus",
  "p-camillus": "Marcus_Furius_Camillus",
  "p-a-cornelius-cossus": "Aulus_Cornelius_Cossus_(dictator_385_BC)",
  "p-t-quinctius-cincinnatus": "Titus_Quinctius_Cincinnatus_Capitolinus",
  "p-p-manlius-capitolinus": "Publius_Manlius_Capitolinus",
  "p-l-manlius-imperiosus": "Lucius_Manlius_Capitolinus_Imperiosus",
  "p-ap-claudius-crassus": "Appius_Claudius_Crassus_(consul_349_BC)",
  "p-t-quinctius-pennus": "Titus_Quinctius_Pennus_Capitolinus_Crispinus",
  "p-q-servilius-ahala": "Quintus_Servilius_Ahala_(consul_365_BC)",
  "p-c-sulpicius-peticus": "Gaius_Sulpicius_Peticus",
  "p-c-marcius-rutilus": "Gaius_Marcius_Rutilus",
  "p-t-manlius-torquatus": "Titus_Manlius_Imperiosus_Torquatus",
  "p-c-julius-iulus": "Gaius_Julius_Iulus_(dictator_352_BC)",
  "p-m-fabius-ambustus": "Marcus_Fabius_Ambustus_(consul_360_BC)",
  "p-l-furius-camillus": "Lucius_Furius_Camillus_(consul_349_BC)",
  "p-c-claudius-crassinus": "Claudia_gens",
  "p-p-valerius-poplicola": "Publius_Valerius_Poplicola_(consul_352_BC)",
  "p-m-valerius-corvus": "Marcus_Valerius_Corvus",
  "p-l-papirius-crassus": "Lucius_Papirius_Crassus_(dictator_340_BC)",
  "p-q-publilius-philo": "Quintus_Publilius_Philo",
  "p-c-claudius-inregillensis": "Gaius_Claudius_Inregillensis",
  "p-l-aemilius-privernas": "Lucius_Aemilius_Mamercinus_Privernas",
  "p-rufinus-334": "Publius_Cornelius_Rufinus_(dictator_334_BC)",
  "p-m-papirius-crassus": "Marcus_Papirius_Crassus",
  "p-cn-quinctilius-varus": "Gnaeus_Quinctilius_Varus",
  "p-m-claudius-marcellus": "Marcus_Claudius_Marcellus_(consul_331_BC)",
  "p-l-papirius-cursor": "Lucius_Papirius_Cursor",
  "p-a-cornelius-arvina": "Aulus_Cornelius_Cossus_Arvina",
  "p-q-fabius-ambustus": "Quintus_Fabius_Ambustus_(dictator_321_BC)",
  "p-m-aemilius-papus": "Marcus_Aemilius_Papus",
  "p-c-maenius": "Gaius_Maenius",
  "p-l-cornelius-lentulus": "Lucius_Cornelius_Lentulus_(consul_327_BC)",
  "p-q-fabius-rullianus": "Quintus_Fabius_Maximus_Rullianus",
  "p-c-poetelius-libo": "Gaius_Poetelius_Libo_Visolus",
  "p-c-sulpicius-longus": "Gaius_Sulpicius_Longus",
  "p-p-cornelius-barbatus": "Publius_Cornelius_Scipio_Barbatus",
  "p-c-junius-brutus": "Gaius_Junius_Bubulcus_Brutus",
  "p-q-hortensius": "Quintus_Hortensius_(dictator)",
  "p-ap-claudius-caecus": "Appius_Claudius_Caecus",
  "p-m-aemilius-barbula": "Marcus_Aemilius_Barbula",
  "p-cn-domitius-calvinus": "Gnaeus_Domitius_Calvinus_Maximus",
  "p-rufinus-276": "Publius_Cornelius_Rufinus_(consul_290_BC)",
  "p-cn-fulvius-centumalus": "Gnaeus_Fulvius_Maximus_Centumalus",
  "p-q-ogulnius-gallus": "Quintus_Ogulnius_Gallus",
  "p-m-claudius-glicia": "Marcus_Claudius_Glicia",
  "p-a-atilius-calatinus": "Aulus_Atilius_Calatinus",
  "p-ti-coruncanius": "Tiberius_Coruncanius",
  "p-c-duilius": "Gaius_Duilius",
  "p-l-caecilius-metellus": "Lucius_Caecilius_Metellus_(consul_251_BC)",
  "p-q-fabius-maximus": "Quintus_Fabius_Maximus_Verrucosus",
  "p-l-veturius-philo": "Lucius_Veturius_Philo_(consul_220_BC)",
  "p-m-junius-pera": "Marcus_Junius_Pera",
  "p-m-fabius-buteo": "Marcus_Fabius_Buteo",
  "p-c-claudius-centho": "Gaius_Claudius_Centho",
  "p-q-fulvius-flaccus": "Quintus_Fulvius_Flaccus",
  "p-t-manlius-torquatus-208": "Titus_Manlius_Torquatus_(consul_235_BC)",
  "p-m-livius-salinator": "Marcus_Livius_Salinator",
  "p-q-caecilius-metellus": "Quintus_Caecilius_Metellus_(consul_206_BC)",
  "p-p-sulpicius-galba": "Publius_Sulpicius_Galba_Maximus",
  "p-c-servilius-geminus": "Gaius_Servilius_Geminus",
  "p-sulla": "Sulla",
  "p-caesar": "Julius_Caesar"
};

const ENTRY_EXTRA_SOURCES = {
  "501-larcius": [{ label: "Livy, Book 2.18", url: LIVY(2) }],
  "496-postumius": [{ label: "Battle of Lake Regillus", url: WIKI("Battle_of_Lake_Regillus") }],
  "494-valerius": [{ label: "First Secession of the Plebs", url: WIKI("First_secession_of_the_plebs") }],
  "463-mamercus": [{ label: "John the Lydian", url: WIKI("John_the_Lydian") }],
  "458-cincinnatus": [{ label: "Battle of Mount Algidus", url: WIKI("Battle_of_Mount_Algidus") }],
  "439-cincinnatus2": [{ label: "Spurius Maelius", url: WIKI("Spurius_Maelius") }],
  "396-camillus": [{ label: "Battle of Veii", url: WIKI("Battle_of_Veii") }],
  "390-camillus2": [{ label: "Sack of Rome (390 BC)", url: WIKI("Battle_of_the_Allia") }],
  "368-camillus4": [{ label: "Lex Licinia Sextia", url: WIKI("Lex_Licinia_Sextia") }],
  "367-camillus5": [{ label: "Lex Licinia Sextia", url: WIKI("Lex_Licinia_Sextia") }],
  "363-imperiosus": [{ label: "Livy, Book 7.3", url: LIVY(7) }],
  "339-philo": [{ label: "Leges Publiliae", url: WIKI("Leges_Publiliae") }],
  "334-rufinus1": [{ label: "Fasti Capitolini", url: WIKI("Fasti_Capitolini") }],
  "325-cursor1": [{ label: "Fasti Capitolini", url: WIKI("Fasti_Capitolini") }],
  "321-ambustus": [{ label: "Battle of the Caudine Forks", url: WIKI("Battle_of_the_Caudine_Forks") }],
  "320-maenius": [{ label: "Fasti Capitolini", url: WIKI("Fasti_Capitolini") }],
  "314-maenius2": [{ label: "Livy, Book 9.26", url: LIVY(9) }],
  "310-cursor2": [{ label: "Fasti Capitolini", url: WIKI("Fasti_Capitolini") }],
  "302-corvus2": [{ label: "Fasti Capitolini", url: WIKI("Fasti_Capitolini") }],
  "287-hortensius": [{ label: "Lex Hortensia", url: WIKI("Lex_Hortensia") }],
  "287-caecus": [{ label: "Broughton, MRR", url: "https://archive.org/details/broughton-magistrates-roman-republic" }],
  "285-barbula": [{ label: "Broughton, MRR", url: "https://archive.org/details/broughton-magistrates-roman-republic" }],
  "276-rufinus2": [{ label: "Broughton, MRR", url: "https://archive.org/details/broughton-magistrates-roman-republic" }],
  "249-glicia": [{ label: "Battle of Drepana", url: WIKI("Battle_of_Drepana") }],
  "221-fabius1": [
    { label: "Valerius Maximus 1.1.5", url: "https://topostext.org/work/871" },
    { label: "Plutarch, Marcellus 5", url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Marcellus*.html" }
  ],
  "217-fabius": [
    { label: "Fabian Strategy", url: WIKI("Fabian_strategy") },
    { label: "Battle of Lake Trasimene", url: WIKI("Battle_of_Lake_Trasimene") }
  ],
  "216-pera": [{ label: "Battle of Cannae", url: WIKI("Battle_of_Cannae") }],
  "216-buteo": [{ label: "Battle of Cannae", url: WIKI("Battle_of_Cannae") }],
  "202-geminus": [{ label: "Battle of Zama", url: WIKI("Battle_of_Zama") }],
  "82-sulla": [
    { label: "Lex Valeria (82 BC)", url: WIKI("Lex_Valeria_(82_BC)") },
    { label: "Plutarch, Life of Sulla", url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Sulla*.html" }
  ],
  "49-caesar1": [{ label: "Caesar's Civil War", url: WIKI("Caesar%27s_civil_war") }],
  "48-caesar2": [{ label: "Battle of Pharsalus", url: WIKI("Battle_of_Pharsalus") }],
  "46-caesar3": [{ label: "Battle of Thapsus", url: WIKI("Battle_of_Thapsus") }],
  "45-caesar4": [{ label: "Battle of Munda", url: WIKI("Battle_of_Munda") }],
  "44-caesar4": [
    { label: "Dictator perpetuo", url: WIKI("Dictator_perpetuo") },
    { label: "Leges Antoniae", url: WIKI("Leges_Antoniae") },
    { label: "Plutarch, Life of Caesar", url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html" }
  ]
};

function getLivyBookForYear(year) {
  if (year <= -468) return 2;
  if (year <= -449) return 3;
  if (year <= -404) return 4;
  if (year <= -390) return 5;
  if (year <= -367) return 6;
  if (year <= -342) return 7;
  if (year <= -322) return 8;
  if (year <= -304) return 9;
  if (year <= -293) return 10;
  if (year === -217) return 22;
  if (year === -216) return 23;
  if (year === -213) return 25;
  if (year === -210 || year === -208) return 27;
  if (year === -207) return 28;
  if (year === -205) return 29;
  if (year === -203 || year === -202) return 30;
  return null;
}

function getSourcesForDictator(d) {
  const sources = [];
  const wikiSlug = PERSON_WIKI[d.personId];
  if (wikiSlug) {
    sources.push({ label: "Biography (Wikipedia)", url: WIKI(wikiSlug), primary: true });
  }

  const extras = ENTRY_EXTRA_SOURCES[d.id] || [];
  const hasExplicitLivy = extras.some(s => s.label.startsWith("Livy"));
  const livyBook = getLivyBookForYear(d.year);
  if (livyBook && !hasExplicitLivy && d.id !== "320-maenius") {
    sources.push({ label: `Livy, Book ${livyBook}`, url: LIVY(livyBook), primary: false });
  }

  for (const ex of extras) {
    sources.push({ label: ex.label, url: ex.url, primary: false });
  }

  sources.push({
    label: "List of Roman Dictators",
    url: WIKI("List_of_Roman_dictators"),
    primary: false
  });
  return sources;
}

const state = {
  era: "all",
  causa: null,
  exit: null,
  search: "",
  selectedId: "44-caesar4",
  tableVisible: true
};

// =========================================================================
// SVG HELPER (STRICT createElementNS)
// =========================================================================
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

function starPath(r) {
  const outer = r * 1.45;
  const inner = r * 0.62;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push(`${(Math.cos(angle) * rad).toFixed(2)},${(Math.sin(angle) * rad).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function diamondPath(r) {
  const s = r * 1.22;
  return `M 0 ${-s} L ${s} 0 L 0 ${s} L ${-s} 0 Z`;
}

function appendShapeMarker(parent, shape, r, fillColor, strokeColor = "#ffffff") {
  if (shape === "circle") {
    parent.appendChild(svgEl("circle", {
      r,
      fill: fillColor,
      stroke: strokeColor,
      "stroke-width": 1.4
    }));
  } else if (shape === "diamond") {
    parent.appendChild(svgEl("path", {
      d: diamondPath(r),
      fill: fillColor,
      stroke: strokeColor,
      "stroke-width": 1.3
    }));
  } else if (shape === "square") {
    const s = r * 1.65;
    parent.appendChild(svgEl("rect", {
      x: -s / 2,
      y: -s / 2,
      width: s,
      height: s,
      rx: 2,
      fill: fillColor,
      stroke: strokeColor,
      "stroke-width": 1.3
    }));
  } else if (shape === "cross") {
    parent.appendChild(svgEl("circle", {
      r: r * 1.05,
      fill: "#f8f6f1",
      stroke: fillColor,
      "stroke-width": 2
    }));
    const c = r * 0.55;
    parent.appendChild(svgEl("path", {
      d: `M ${-c} ${-c} L ${c} ${c} M ${c} ${-c} L ${-c} ${c}`,
      stroke: fillColor,
      "stroke-width": 2.1,
      "stroke-linecap": "round"
    }));
  } else if (shape === "star") {
    parent.appendChild(svgEl("path", {
      d: starPath(r),
      fill: fillColor,
      stroke: "#f59e0b",
      "stroke-width": 1.4
    }));
  }
}

function buildMiniShapeIcon(shape, color) {
  const svg = svgEl("svg", {
    width: 15,
    height: 15,
    viewBox: "-10 -10 20 20",
    "aria-hidden": "true"
  });
  appendShapeMarker(svg, shape, 5.6, color, "#ffffff");
  return svg;
}

// =========================================================================
// DYNAMIC KPI COMPUTATION
// =========================================================================
function renderKPIs() {
  const total = DICTATORS.length;
  const uniqueMen = new Set(DICTATORS.map(d => d.personId)).size;
  const fourthCentury = DICTATORS.filter(d => d.year > -400 && d.year <= -300).length;

  const quietCount = DICTATORS.filter(d => d.exit === "quiet").length;
  const quietPct = Math.round((quietCount / total) * 100);

  const forcedCount = DICTATORS.filter(d => d.exit === "forced").length;
  const extendedCount = DICTATORS.filter(d => d.exit === "extended").length;
  const diedCount = DICTATORS.filter(d => d.exit === "died").length;
  const disputedTotal = forcedCount + extendedCount + diedCount;

  const brokeList = DICTATORS.filter(d => d.exit === "broke_limit");
  const brokeMen = new Set(brokeList.map(d => d.personId)).size;

  document.getElementById("headerTotal").textContent = String(total);
  document.getElementById("kpiTotal").textContent = String(total);
  document.getElementById("kpiUniqueMen").textContent = t("{n} distinct men", {n: uniqueMen});
  document.getElementById("kpiFourthPeak").textContent = String(fourthCentury);

  document.getElementById("kpiQuietCount").textContent = String(quietCount);
  document.getElementById("kpiQuietPct").textContent = `${quietPct}%`;

  document.getElementById("kpiDisputedCount").textContent = String(disputedTotal);
  document.getElementById("kpiDisputedDetail").textContent = t("{forced} forced • {other} ext/died", {forced: forcedCount, other: extendedCount + diedCount});

  document.getElementById("kpiBrokeMen").textContent = String(brokeMen);
  document.getElementById("kpiBrokeTerms").textContent = t("{men} men, {terms} terms", {men: brokeMen, terms: brokeList.length});
}

// =========================================================================
// FILTERING
// =========================================================================
function getFilteredDictators() {
  const range = ERA_RANGES[state.era];
  const q = state.search.trim().toLowerCase();
  return DICTATORS.filter(d => {
    if (d.year < range.dataMin || d.year > range.dataMax) return false;
    if (state.causa && d.causa !== state.causa) return false;
    if (state.exit && d.exit !== state.exit) return false;
    if (q) {
      const hay = `${d.name} ${d.magister} ${d.yearLabel} ${d.causaLatin} ${d.note} ${d.exitLabel} ${DE_NOTES[d.id]} ${t(CAUSA_META[d.causa].label)} ${t(EXIT_META[d.exit].label)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// =========================================================================
// RENDER FILTER PILLS
// =========================================================================
function renderFilterPills() {
  const causaWrap = document.getElementById("causaFilters");
  const exitWrap = document.getElementById("exitFilters");
  causaWrap.replaceChildren();
  exitWrap.replaceChildren();

  for (const [key, meta] of Object.entries(CAUSA_META)) {
    const count = DICTATORS.filter(d => d.causa === key).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `pill-btn${state.causa === key ? " active" : ""}`;
    btn.dataset.causa = key;

    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.backgroundColor = meta.color;
    btn.appendChild(sw);

    const lbl = document.createElement("span");
    lbl.textContent = t(meta.label);
    btn.appendChild(lbl);

    const cnt = document.createElement("span");
    cnt.className = "pill-count";
    cnt.textContent = `(${count})`;
    btn.appendChild(cnt);

    btn.addEventListener("click", () => {
      state.causa = state.causa === key ? null : key;
      refreshViews();
    });
    causaWrap.appendChild(btn);
  }

  for (const [key, meta] of Object.entries(EXIT_META)) {
    const count = DICTATORS.filter(d => d.exit === key).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `pill-btn${state.exit === key ? " active" : ""}`;
    btn.dataset.exit = key;

    const iconColor = state.exit === key ? "#fde68a" : meta.accent;
    btn.appendChild(buildMiniShapeIcon(meta.shape, iconColor));

    const lbl = document.createElement("span");
    lbl.textContent = t(meta.label);
    btn.appendChild(lbl);

    const cnt = document.createElement("span");
    cnt.className = "pill-count";
    cnt.textContent = `(${count})`;
    btn.appendChild(cnt);

    btn.addEventListener("click", () => {
      state.exit = state.exit === key ? null : key;
      refreshViews();
    });
    exitWrap.appendChild(btn);
  }
}

// =========================================================================
// RENDER INTERACTIVE SVG TIMELINE
// =========================================================================
function renderTimeline() {
  const stage = document.getElementById("timelineStage");
  stage.replaceChildren();

  const containerW = Math.max(stage.clientWidth || 960, 320);
  const compact = containerW < 620;
  const width = containerW;
  const margin = { top: 54, right: 28, bottom: 48, left: 28 };
  const innerW = width - margin.left - margin.right;

  const range = ERA_RANGES[state.era];
  const xOf = year => ((year - range.min) / (range.max - range.min)) * innerW;

  const eraItems = DICTATORS.filter(d => d.year >= range.dataMin && d.year <= range.dataMax);
  const filtered = getFilteredDictators();
  const filteredIds = new Set(filtered.map(d => d.id));

  document.getElementById("visibleCountPill").textContent = t("Showing {n} of {total}", {n: filtered.length, total: DICTATORS.length});

  // Marker radius & collision-free vertical stacking
  const r = state.era === "all" ? (compact ? 5.2 : 6.4) : (compact ? 6.8 : 8.5);
  const minDist = r * 2.45;
  const placed = [];
  const sorted = [...eraItems].sort((a, b) => a.year - b.year);

  let maxStackHeight = 0;
  for (const d of sorted) {
    const px = xOf(d.year);
    let levelY = r + 10;
    let guard = 0;
    while (guard < 40) {
      const collides = placed.some(p => Math.hypot(p.px - px, p.levelY - levelY) < minDist);
      if (!collides) break;
      levelY += r * 2.35;
      guard++;
    }
    if (levelY > maxStackHeight) maxStackHeight = levelY;
    placed.push({ ...d, px, levelY });
  }

  const innerH = Math.max(compact ? 220 : 270, maxStackHeight + 44);
  const height = innerH + margin.top + margin.bottom;

  const svg = svgEl("svg", {
    class: "timeline-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": t("Interactive timeline of Roman Republic dictatorships")
  });

  const g = svgEl("g", { transform: `translate(${margin.left}, ${margin.top})` });
  svg.appendChild(g);

  // Contextual background shading in "all" view
  if (state.era === "all") {
    // 4th-century peak shading (399–300 BC)
    const peakCount = DICTATORS.filter(d => d.year > -400 && d.year <= -300).length;
    const pStart = xOf(-399);
    const pEnd = xOf(-300);
    g.appendChild(svgEl("rect", {
      x: pStart,
      y: 0,
      width: Math.max(0, pEnd - pStart),
      height: innerH,
      rx: 8,
      fill: "#fef3c7",
      opacity: "0.38"
    }));
    const peakLabel = svgEl("text", {
      x: (pStart + pEnd) / 2,
      y: -14,
      "text-anchor": "middle",
      fill: "#92400e",
      "font-size": compact ? 9.5 : 11,
      "font-weight": 700,
      "letter-spacing": "0.05em"
    });
    peakLabel.textContent = t(compact && language === "de" ? "4th-c. peak ({n})" : "4TH-CENTURY PEAK ({n} TERMS)", {n: peakCount});
    g.appendChild(peakLabel);

    // 120-year hiatus band (202–82 BC)
    const hStart = xOf(-202);
    const hEnd = xOf(-82);
    g.appendChild(svgEl("rect", {
      x: hStart,
      y: 0,
      width: Math.max(0, hEnd - hStart),
      height: innerH,
      rx: 8,
      fill: "#ece6da",
      opacity: "0.72"
    }));
    const hiatusTitle = svgEl("text", {
      x: (hStart + hEnd) / 2,
      y: innerH * 0.48,
      "text-anchor": "middle",
      fill: "#57534e",
      "font-size": compact ? 9.5 : 11.5,
      "font-weight": 700,
      "letter-spacing": "0.07em"
    });
    hiatusTitle.textContent = t(compact && language === "de" ? "120-year pause" : "120-YEAR HIATUS");
    g.appendChild(hiatusTitle);

    const hiatusSub = svgEl("text", {
      x: (hStart + hEnd) / 2,
      y: innerH * 0.48 + 15,
      "text-anchor": "middle",
      fill: "#78716c",
      "font-size": compact ? 8.5 : 10.5
    });
    hiatusSub.textContent = t(compact && language === "de" ? "202–82 BC" : "No dictators (202–82 BC)");
    g.appendChild(hiatusSub);
  }

  // Compute clean x-axis ticks
  const span = range.max - range.min;
  const step = span > 300 ? (compact ? 100 : 50) : span > 100 ? 20 : span > 40 ? 10 : 5;
  const firstTick = Math.ceil(range.min / step) * step;
  for (let yr = firstTick; yr <= range.max; yr += step) {
    const tx = xOf(yr);
    g.appendChild(svgEl("line", {
      x1: tx,
      x2: tx,
      y1: 0,
      y2: innerH,
      stroke: "#e5e0d5",
      "stroke-dasharray": "3,3",
      "stroke-width": 1
    }));
    g.appendChild(svgEl("line", {
      x1: tx,
      x2: tx,
      y1: innerH,
      y2: innerH + 6,
      stroke: "#a8a29e",
      "stroke-width": 1.2
    }));
    const lbl = svgEl("text", {
      x: tx,
      y: innerH + 22,
      "text-anchor": "middle",
      fill: "#57534e",
      "font-size": compact ? 10 : 11.5,
      "font-weight": 600
    });
    lbl.textContent = yearText(`${Math.abs(yr)} BC`);
    g.appendChild(lbl);
  }

  // Baseline
  g.appendChild(svgEl("line", {
    x1: 0,
    x2: innerW,
    y1: innerH,
    y2: innerH,
    stroke: "#bdb6a8",
    "stroke-width": 1.5
  }));

  // Milestone callouts
  const callouts = [
    { id: "458-cincinnatus", text: "Cincinnatus (16d)", dy: -22 },
    { id: "390-camillus2", text: "Sack of Rome", dy: -22 },
    { id: "217-fabius", text: "Hannibal Crisis", dy: -22 },
    { id: "82-sulla", text: "Sulla (82–81)", dy: -24 },
    { id: "44-caesar4", text: "Caesar Perpetuo", dy: -26 }
  ];

  for (const c of callouts) {
    const target = placed.find(p => p.id === c.id);
    if (!target || !filteredIds.has(target.id)) continue;
    const cy = innerH - target.levelY;
    const labelY = Math.max(-2, cy + c.dy);
    const anchor = target.px < 70 ? "start" : target.px > innerW - 70 ? "end" : "middle";

    g.appendChild(svgEl("line", {
      x1: target.px,
      x2: target.px,
      y1: cy - r - 2,
      y2: labelY + 4,
      stroke: "#a8a29e",
      "stroke-width": 1,
      "stroke-dasharray": "2,2",
      "pointer-events": "none"
    }));

    const calloutTxt = svgEl("text", {
      x: target.px,
      y: labelY,
      "text-anchor": anchor,
      fill: c.id === "44-caesar4" ? "#8b1e24" : "#44403c",
      "font-size": compact ? 9.5 : 10.5,
      "font-weight": 700,
      "pointer-events": "none"
    });
    calloutTxt.textContent = t(c.text);
    g.appendChild(calloutTxt);
  }

  // Render dictator markers (draw selected marker last so it stays on top without DOM reparenting)
  const nodesLayer = svgEl("g");
  g.appendChild(nodesLayer);

  const renderOrder = [...placed].sort((a, b) => {
    if (a.id === state.selectedId) return 1;
    if (b.id === state.selectedId) return -1;
    return 0;
  });

  for (const d of renderOrder) {
    const isVisible = filteredIds.has(d.id);
    const isSelected = d.id === state.selectedId;
    const cy = innerH - d.levelY;
    const cMeta = CAUSA_META[d.causa];
    const eMeta = EXIT_META[d.exit];

    const nodeG = svgEl("g", {
      class: "node-group",
      transform: `translate(${d.px.toFixed(2)}, ${cy.toFixed(2)})`,
      opacity: isVisible ? "1" : "0.14",
      tabindex: "0",
      role: "button",
      "aria-label": `${d.name}, ${yearText(d.yearLabel)}`
    });

    // Transparent hit target ensures reliable clicking/tapping on all shapes across browsers
    nodeG.appendChild(svgEl("circle", {
      r: r + 4,
      fill: "transparent",
      "pointer-events": "all"
    }));

    // Pure-SVG hover ring (avoids Blink CSS filter + DOM reparenting click bugs)
    nodeG.appendChild(svgEl("circle", {
      class: "hover-ring",
      r: r + 3.5,
      fill: "none",
      stroke: "#1c1917",
      "stroke-width": 1.6,
      "pointer-events": "none"
    }));

    if (isSelected) {
      nodeG.appendChild(svgEl("circle", {
        r: r + 5.5,
        fill: "none",
        stroke: "#c47f17",
        "stroke-width": 2.2,
        "stroke-dasharray": "3,2",
        "pointer-events": "none"
      }));
    }

    appendShapeMarker(nodeG, eMeta.shape, r, cMeta.color, "#ffffff");

    nodeG.addEventListener("mouseenter", evt => {
      showTooltip(evt, d);
    });
    nodeG.addEventListener("mousemove", evt => positionTooltip(evt));
    nodeG.addEventListener("mouseleave", hideTooltip);
    nodeG.addEventListener("click", evt => {
      evt.stopPropagation();
      selectDictator(d.id);
    });
    nodeG.addEventListener("keydown", evt => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        selectDictator(d.id);
      }
    });

    nodesLayer.appendChild(nodeG);
  }

  stage.appendChild(svg);
}

function showTooltip(evt, d) {
  const tooltip = document.getElementById("tooltip");
  const cMeta = CAUSA_META[d.causa];
  tooltip.replaceChildren();

  const nameEl = document.createElement("div");
  nameEl.className = "tooltip-name";
  nameEl.textContent = d.name;
  tooltip.appendChild(nameEl);

  const yrEl = document.createElement("div");
  yrEl.className = "tooltip-year";
  yrEl.textContent = `${yearText(d.yearLabel)} • ${t(d.causaLatin)}`;
  tooltip.appendChild(yrEl);

  const causaRow = document.createElement("div");
  causaRow.className = "tooltip-row";
  const sw = document.createElement("span");
  sw.className = "swatch";
  sw.style.backgroundColor = cMeta.color;
  causaRow.appendChild(sw);
  const cTxt = document.createElement("span");
  cTxt.textContent = t(cMeta.label);
  causaRow.appendChild(cTxt);
  tooltip.appendChild(causaRow);

  const exitRow = document.createElement("div");
  exitRow.className = "tooltip-row";
  exitRow.textContent = t("Exit: {status}", {status: t(d.exitLabel)});
  tooltip.appendChild(exitRow);

  tooltip.style.opacity = "1";
  tooltip.setAttribute("aria-hidden", "false");
  positionTooltip(evt);
}

function positionTooltip(evt) {
  const tooltip = document.getElementById("tooltip");
  const pad = 14;
  const rect = tooltip.getBoundingClientRect();
  let left = evt.clientX + pad;
  let top = evt.clientY - 12;
  if (left + rect.width > window.innerWidth - 10) {
    left = evt.clientX - rect.width - pad;
  }
  if (top + rect.height > window.innerHeight - 10) {
    top = window.innerHeight - rect.height - 10;
  }
  tooltip.style.left = `${Math.max(10, left)}px`;
  tooltip.style.top = `${Math.max(10, top)}px`;
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  tooltip.style.opacity = "0";
  tooltip.setAttribute("aria-hidden", "true");
}

// =========================================================================
// RENDER DETAIL DOSSIER
// =========================================================================
function renderDossier() {
  const d = DICTATORS.find(item => item.id === state.selectedId) || DICTATORS[DICTATORS.length - 1];
  const idx = DICTATORS.findIndex(item => item.id === d.id);
  const cMeta = CAUSA_META[d.causa];
  const eMeta = EXIT_META[d.exit];

  document.getElementById("dossierYearBadge").textContent = yearText(d.yearLabel);
  const body = document.getElementById("dossierBody");
  body.replaceChildren();

  const nameEl = document.createElement("h3");
  nameEl.className = "dossier-name";
  nameEl.textContent = d.name;
  body.appendChild(nameEl);

  const metaEl = document.createElement("p");
  metaEl.className = "dossier-meta";
  metaEl.append(document.createTextNode(t("Master of Horse (")));
  const latin = document.createElement("em"); latin.textContent = t("Magister Equitum");
  const master = document.createElement("strong"); master.textContent = t(d.magister);
  metaEl.append(latin, document.createTextNode("): "), master);
  body.appendChild(metaEl);

  const badges = document.createElement("div");
  badges.className = "dossier-badges";

  // Causa box
  const cBox = document.createElement("div");
  cBox.className = "dossier-box";
  cBox.style.borderLeft = `4px solid ${cMeta.color}`;
  const cLbl = document.createElement("span");
  cLbl.className = "dossier-box-label";
  cLbl.textContent = t("Reason Appointed (Causa)");
  cBox.appendChild(cLbl);

  const cVal = document.createElement("div");
  cVal.className = "dossier-box-val";
  const sw = document.createElement("span");
  sw.className = "swatch";
  sw.style.backgroundColor = cMeta.color;
  cVal.appendChild(sw);
  const cTxt = document.createElement("span");
  cTxt.textContent = t(cMeta.label);
  cVal.appendChild(cTxt);
  cBox.appendChild(cVal);

  const cLat = document.createElement("p");
  cLat.className = "dossier-latin";
  cLat.textContent = t(d.causaLatin);
  cBox.appendChild(cLat);
  badges.appendChild(cBox);

  // Exit box
  const eBox = document.createElement("div");
  eBox.className = "dossier-box";
  eBox.style.borderLeft = `4px solid ${eMeta.accent}`;
  const eLbl = document.createElement("span");
  eLbl.className = "dossier-box-label";
  eLbl.textContent = t("Exit Status");
  eBox.appendChild(eLbl);

  const eVal = document.createElement("div");
  eVal.className = "dossier-box-val";
  eVal.appendChild(buildMiniShapeIcon(eMeta.shape, eMeta.accent));
  const eTxt = document.createElement("span");
  eTxt.textContent = t(d.exitLabel);
  eVal.appendChild(eTxt);
  eBox.appendChild(eVal);
  badges.appendChild(eBox);

  body.appendChild(badges);

  // Historical note
  const noteBox = document.createElement("div");
  noteBox.className = "dossier-note-box";
  noteBox.textContent = noteText(d);
  body.appendChild(noteBox);

  // Clickable Sources & References
  const sourcesWrap = document.createElement("div");
  sourcesWrap.className = "dossier-sources";
  const srcLabel = document.createElement("span");
  srcLabel.className = "dossier-box-label";
  srcLabel.textContent = t("Sources & Further Reading");
  sourcesWrap.appendChild(srcLabel);

  const linksRow = document.createElement("div");
  linksRow.className = "source-links";
  for (const src of getSourcesForDictator(d)) {
    const a = document.createElement("a");
    a.className = `source-chip${src.primary ? "" : " secondary"}`;
    a.href = safeSourceURL(src.url);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = `${t(src.label)} ↗`;
    linksRow.appendChild(a);
  }
  sourcesWrap.appendChild(linksRow);
  body.appendChild(sourcesWrap);

  // Prev / Next navigation
  const nav = document.createElement("div");
  nav.className = "dossier-nav";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "nav-btn";
  prevBtn.textContent = t("← Previous");
  prevBtn.addEventListener("click", () => {
    const prevIdx = (idx - 1 + DICTATORS.length) % DICTATORS.length;
    selectDictator(DICTATORS[prevIdx].id);
  });

  const pos = document.createElement("span");
  pos.className = "nav-pos";
  pos.textContent = t("#{n} of {total}", {n: idx + 1, total: DICTATORS.length});

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "nav-btn";
  nextBtn.textContent = t("Next →");
  nextBtn.addEventListener("click", () => {
    const nextIdx = (idx + 1) % DICTATORS.length;
    selectDictator(DICTATORS[nextIdx].id);
  });

  nav.appendChild(prevBtn);
  nav.appendChild(pos);
  nav.appendChild(nextBtn);
  body.appendChild(nav);
}

// =========================================================================
// RENDER CENTURY BREAKDOWN SVG BAR CHART
// =========================================================================
function renderCenturyChart() {
  const stage = document.getElementById("centuryChartStage");
  const legendWrap = document.getElementById("centuryLegend");
  stage.replaceChildren();
  legendWrap.replaceChildren();

  const buckets = [
    { line1: "6th–5th c. BC", line2: "(501–400)", test: d => d.year <= -400 },
    { line1: "4th c. BC", line2: "(399–300)", test: d => d.year > -400 && d.year <= -300 },
    { line1: "3rd c. BC", line2: "(299–200)", test: d => d.year > -300 && d.year <= -200 },
    { line1: "2nd c. BC", line2: "(199–100)", test: d => d.year > -200 && d.year <= -100 },
    { line1: "1st c. BC", line2: "(99–44)", test: d => d.year > -100 }
  ];

  const causaKeys = Object.keys(CAUSA_META);
  const rows = buckets.map(b => {
    const items = DICTATORS.filter(b.test);
    const counts = {};
    for (const k of causaKeys) {
      counts[k] = items.filter(x => x.causa === k).length;
    }
    return { ...b, total: items.length, counts };
  });

  const width = Math.max(stage.clientWidth || 520, 300);
  const height = 250;
  const margin = { top: 24, right: 16, bottom: 44, left: 32 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const maxY = 50;
  const yOf = val => innerH - (val / maxY) * innerH;

  const svg = svgEl("svg", {
    class: "timeline-svg",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": t("Stacked bar chart of Roman dictatorships by century")
  });

  const g = svgEl("g", { transform: `translate(${margin.left}, ${margin.top})` });
  svg.appendChild(g);

  // Horizontal gridlines & y-axis labels
  for (let v = 0; v <= 50; v += 10) {
    const y = yOf(v);
    g.appendChild(svgEl("line", {
      x1: 0,
      x2: innerW,
      y1: y,
      y2: y,
      stroke: v === 0 ? "#bdb6a8" : "#e5e0d5",
      "stroke-dasharray": v === 0 ? "" : "2,2",
      "stroke-width": 1
    }));
    const yTxt = svgEl("text", {
      x: -8,
      y: y + 4,
      "text-anchor": "end",
      fill: "#78716c",
      "font-size": 10.5
    });
    yTxt.textContent = String(v);
    g.appendChild(yTxt);
  }

  // Stacked bars
  const slotW = innerW / rows.length;
  const barW = Math.min(54, slotW * 0.56);

  rows.forEach((row, i) => {
    const cx = slotW * i + slotW / 2;
    const bx = cx - barW / 2;
    let running = 0;

    for (const k of causaKeys) {
      const val = row.counts[k];
      if (!val) continue;
      const yTop = yOf(running + val);
      const yBot = yOf(running);
      g.appendChild(svgEl("rect", {
        x: bx,
        y: yTop,
        width: barW,
        height: Math.max(0, yBot - yTop),
        fill: CAUSA_META[k].color,
        rx: 2
      }));
      running += val;
    }

    // Total label above bar
    const totTxt = svgEl("text", {
      x: cx,
      y: yOf(row.total) - 7,
      "text-anchor": "middle",
      fill: row.total === 0 ? "#78716c" : "#1c1917",
      "font-size": 11.5,
      "font-weight": 700
    });
    totTxt.textContent = row.total === 0 ? t("0 (Hiatus)") : String(row.total);
    g.appendChild(totTxt);

    // X-axis two-line label
    const l1 = svgEl("text", {
      x: cx,
      y: innerH + 17,
      "text-anchor": "middle",
      fill: "#1c1917",
      "font-size": width < 420 ? 9.5 : 11,
      "font-weight": 700
    });
    l1.textContent = t(row.line1);
    g.appendChild(l1);

    const l2 = svgEl("text", {
      x: cx,
      y: innerH + 31,
      "text-anchor": "middle",
      fill: "#78716c",
      "font-size": width < 420 ? 9 : 10
    });
    l2.textContent = row.line2;
    g.appendChild(l2);
  });

  stage.appendChild(svg);

  // Compact legend
  for (const [k, meta] of Object.entries(CAUSA_META)) {
    const item = document.createElement("span");
    item.className = "mini-legend-item";
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.backgroundColor = meta.color;
    item.appendChild(sw);
    const txt = document.createElement("span");
    txt.textContent = t(meta.label);
    item.appendChild(txt);
    legendWrap.appendChild(item);
  }
}

// =========================================================================
// RENDER FILTERABLE DATA TABLE
// =========================================================================
function renderTable() {
  const filtered = getFilteredDictators();
  document.getElementById("tableCount").textContent = String(filtered.length);

  const tbody = document.getElementById("ledgerBody");
  tbody.replaceChildren();

  if (filtered.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.style.textAlign = "center";
    td.style.padding = "20px";
    td.style.color = "#78716c";
    td.textContent = t("No dictators match the current filters.");
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const d of filtered) {
    const tr = document.createElement("tr");
    if (d.id === state.selectedId) tr.className = "selected-row";

    const tdYear = document.createElement("td");
    tdYear.className = "td-year";
    tdYear.textContent = yearText(d.yearLabel);
    tr.appendChild(tdYear);

    const tdName = document.createElement("td");
    tdName.className = "td-name";
    tdName.textContent = d.name;
    tr.appendChild(tdName);

    const tdCausa = document.createElement("td");
    const cMeta = CAUSA_META[d.causa];
    const cTag = document.createElement("span");
    cTag.className = "tag";
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.backgroundColor = cMeta.color;
    cTag.appendChild(sw);
    cTag.appendChild(document.createTextNode(t(cMeta.label)));
    tdCausa.appendChild(cTag);
    tr.appendChild(tdCausa);

    const tdExit = document.createElement("td");
    const eMeta = EXIT_META[d.exit];
    const eTag = document.createElement("span");
    eTag.className = "tag";
    eTag.appendChild(buildMiniShapeIcon(eMeta.shape, eMeta.accent));
    eTag.appendChild(document.createTextNode(t(d.exitLabel)));
    tdExit.appendChild(eTag);
    tr.appendChild(tdExit);

    const tdSources = document.createElement("td");
    const linkGroup = document.createElement("div");
    linkGroup.className = "table-link-group";
    const sources = getSourcesForDictator(d);
    const bioSrc = sources[0];
    if (bioSrc) {
      const bioLink = document.createElement("a");
      bioLink.className = "table-source-link";
      bioLink.href = safeSourceURL(bioSrc.url);
      bioLink.target = "_blank";
      bioLink.rel = "noopener noreferrer";
      bioLink.textContent = t("Bio ↗");
      bioLink.title = t("Open Wikipedia biography for {name}", {name: d.name});
      bioLink.addEventListener("click", evt => evt.stopPropagation());
      linkGroup.appendChild(bioLink);
    }
    const primarySrc = sources.find(s => !s.primary && s.label !== "List of Roman Dictators");
    if (primarySrc) {
      const pLink = document.createElement("a");
      pLink.className = "table-source-link";
      pLink.href = safeSourceURL(primarySrc.url);
      pLink.target = "_blank";
      pLink.rel = "noopener noreferrer";
      pLink.textContent = `${t(primarySrc.label)} ↗`;
      pLink.addEventListener("click", evt => evt.stopPropagation());
      linkGroup.appendChild(pLink);
    }
    tdSources.appendChild(linkGroup);
    tr.appendChild(tdSources);

    tr.addEventListener("click", () => {
      selectDictator(d.id);
      document.getElementById("dossierBody").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    tbody.appendChild(tr);
  }
}

// =========================================================================
// SELECTION & ORCHESTRATION
// =========================================================================
function updateEraButtons() {
  document.querySelectorAll(".era-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.era === state.era);
  });
}

function selectDictator(id) {
  const target = DICTATORS.find(d => d.id === id);
  if (!target) return;
  state.selectedId = id;
  const range = ERA_RANGES[state.era];
  if (target.year < range.dataMin || target.year > range.dataMax) {
    state.era = "all";
    updateEraButtons();
  }
  renderDossier();
  renderTimeline();
  renderTable();
}

function refreshViews() {
  renderFilterPills();
  renderTimeline();
  renderTable();
}

function bindEvents() {
  // Era buttons
  document.querySelectorAll(".era-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.era = btn.dataset.era;
      updateEraButtons();
      renderTimeline();
      renderTable();
    });
  });

  // Spotlight buttons
  document.querySelectorAll(".spotlight-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.causa = null;
      state.exit = null;
      state.search = "";
      document.getElementById("searchInput").value = "";
      renderFilterPills();
      selectDictator(btn.dataset.spotlight);
    });
  });

  // Search input
  document.getElementById("searchInput").addEventListener("input", evt => {
    state.search = evt.target.value;
    renderTimeline();
    renderTable();
  });

  // Reset filters
  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    state.era = "all";
    state.causa = null;
    state.exit = null;
    state.search = "";
    document.getElementById("searchInput").value = "";
    updateEraButtons();
    refreshViews();
  });

  // Table toggle
  const toggleBtn = document.getElementById("toggleTableBtn");
  const tableWrap = document.getElementById("tableWrap");
  toggleBtn.addEventListener("click", () => {
    state.tableVisible = !state.tableVisible;
    tableWrap.classList.toggle("collapsed", !state.tableVisible);
    toggleBtn.textContent = t(state.tableVisible ? "Hide Table" : "Show Table");
  });

  // Responsive redraw on resize
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderTimeline();
      renderCenturyChart();
    }, 120);
  });
}

// =========================================================================
// INITIALIZATION
// =========================================================================
function init() {
  captureStaticTranslations();
  let saved = "en";
  try { saved = localStorage.getItem("grg23-language") || "en"; } catch { /* Storage is optional. */ }
  setLanguage(saved, false, false);
  for (const button of document.querySelectorAll("[data-set-lang]")) button.addEventListener("click", () => setLanguage(button.dataset.setLang));
  renderKPIs();
  renderFilterPills();
  renderDossier();
  renderTimeline();
  renderCenturyChart();
  renderTable();
  bindEvents();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
  