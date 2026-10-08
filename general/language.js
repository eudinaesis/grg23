(() => {
  const requested = new URLSearchParams(location.search).get("lang");
  const browser = (navigator.language || "de").toLowerCase();
  const initial = requested === "de" || requested === "en" ? requested : browser.startsWith("en") ? "en" : "de";
  document.documentElement.lang = initial;
  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("[data-set-lang]");
    function setLanguage(language) {
      document.documentElement.lang = language;
      document.title = document.documentElement.dataset["title" + (language === "de" ? "De" : "En")];
      buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.setLang === language)));
      document.querySelectorAll("[data-alt-de]").forEach(image => {
        image.alt = image.dataset[language === "de" ? "altDe" : "altEn"];
      });
      document.querySelectorAll('a[href]').forEach(anchor => {
        const target = new URL(anchor.getAttribute("href"), location.href);
        if (target.origin === location.origin && /\/general\/(?:[^/]*\.html)?$/.test(target.pathname)) {
          target.searchParams.set("lang", language);
          anchor.href = target.href;
        }
      });
    }
    buttons.forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.setLang)));
    document.querySelectorAll("[data-print]").forEach(button => button.addEventListener("click", () => window.print()));
    setLanguage(initial);
  });
})();