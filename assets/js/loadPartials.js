(async () => {
  // -----------------------------------------
  // Determine depth and base path
  // -----------------------------------------
  const parts = location.pathname.replace(/^\//, "").split("/");
  const relative = (path) => {
    const depth = location.pathname.split("/").filter(Boolean).length;
    return "../".repeat(depth) + path;
  };
  // Home = nur "/" oder "/index.html"
  const isHome = parts.length === 0 || (parts.length === 1 && parts[0] === "index.html");

  // -----------------------------------------
  // Load header partial
  // -----------------------------------------
  const headerFile = isHome ? "header-home.html" : "header-simple.html";

  try {
//    const headerHTML = await fetch(`${depth}partials/${headerFile}`).then(r => r.text());
    const headerHTML = await fetch(relative("partials/" + headerFile));
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
  } catch (err) {
    console.error("Failed to load header partial:", err);
  }

  // -----------------------------------------
  // Highlight active navigation link
  // -----------------------------------------
  let current;

  if (isHome) {
    // Home-Seite → Home-Link aktiv machen
    current = "index.html";
  } else if (parts.includes("essays")) {
    // alle Essay-Unterseiten
    current = "essays";
  } else {
    // sonst Ordner vor index.html, z.B. "about-me"
    current = parts[parts.length - 2] || "";
  }

  document.querySelectorAll(".nav .links a").forEach(a => {
    const href = a.getAttribute("href") || "";

    // Home: explizit den Home-Link markieren
    if (isHome) {
      const isHomeLink =
        href === "/" ||
        href === "index.html" ||
        href === "./";

      if (isHomeLink) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }

      return; // verhindert Aktivierung anderer Links
    }

    // Unterseiten: wie bisher, aber nur wenn current nicht leer
    if (!isHome && current && href.includes(current)) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  // -----------------------------------------
  // Inject page-specific header title from JSON
  // -----------------------------------------
  (async () => {
    try {
      const titleData = await fetch(`${depth}assets/js/pageTitles.json`).then(r => r.json());
      const pathParts = location.pathname.split("/").filter(Boolean);
      const folder = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";
      const spec = titleData[folder];

      const header = document.querySelector(".header--simple");
      if (header && spec) {
        const hero = document.createElement("div");
        hero.className = "hero";
        hero.innerHTML = `
          <h1>${spec.title}</h1>
          ${spec.subtitle ? `<p class="subtitle">${spec.subtitle}</p>` : ""}
        `;
        header.appendChild(hero);
      }
    } catch (err) {
      console.error("Failed to load pageTitles.json:", err);
    }
  })();

  // -----------------------------------------
  // Load footer partial, then set year + icons
  // -----------------------------------------
  fetch(`${depth}partials/footer.html`)
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);

      const yearEl = document.getElementById("year");
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }

      if (window.lucide) {
        lucide.createIcons();
      }

      document.dispatchEvent(new Event("footerLoaded"));
    })
    .catch(err => {
      console.error("Failed to load footer partial:", err);
    });

  // -----------------------------------------
  // Dispatch headerLoaded once (for other scripts)
  // -----------------------------------------
  document.dispatchEvent(new Event("headerLoaded"));

  // -----------------------------------------
  // Reveal page (no double logic)
  // -----------------------------------------
  document.documentElement.classList.remove("preload");
  document.documentElement.classList.add("ready");

  // --- Sidebar position fix (for dynamically loaded header) ---
  document.addEventListener("headerLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      requestAnimationFrame(() => {
        sidebar.style.position = "relative";
        void sidebar.offsetHeight; // trigger reflow
        sidebar.style.position = ""; // revert
      });
    }
  });

})();
