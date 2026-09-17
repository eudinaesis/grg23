(() => {
  const buttons = document.querySelectorAll("[data-set-lang]");
  if (!buttons.length) return;
  const saved = localStorage.getItem("grg23-language");
  const browserLanguage = navigator.language.toLowerCase().startsWith("en") ? "en" : "de";
  const initial = saved === "de" || saved === "en" ? saved : browserLanguage;

  function setLanguage(language) {
    document.documentElement.lang = language;
    localStorage.setItem("grg23-language", language);
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLang === language));
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.setLang));
  });
  setLanguage(initial);
})();
