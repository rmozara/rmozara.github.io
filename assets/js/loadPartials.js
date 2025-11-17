(async () => {

  /* ============================================================
     0. DEPTH SENSING FOR CORRECT RELATIVE PATHS
     ============================================================ */

  // Example:
  // "/" → depthParts = [] → prefix = ""
  // "/pages/essays/index.html" → ["pages","essays","index.html"] → prefix = "../../"
  const depthParts = location.pathname.split("/").filter(Boolean);
  const prefix = "../".repeat(Math.max(0, depthParts.length - 1));


  /* ============================================================
     1. APPLY PATH FIXES (ONLY FOR data-src)
     ============================================================ */

  const applyPathFixes = () => {
    document.querySelectorAll("[data-src]").forEach(el => {
      el.src = prefix + el.dataset.src.replace(/^\//, "");
    });
  };


  /* ============================================================
     2. DETECT HOME PAGE
     ============================================================ */

  const isHome =
    depthParts.length === 0 ||
    (depthParts.length === 1 && depthParts[0] === "index.html");


  /* ============================================================
     3. LOAD HEADER PARTIAL
     ============================================================ */

  const headerFile = isHome ? "header-home.html" : "header-simple.html";

  try {
    const headerHTML = await fetch(prefix + "partials/" + headerFile)
      .then(r => r.text());

    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    applyPathFixes();

  } catch (err) {
    console.error("HEADER FAILED:", err);
  }


  /* ============================================================
     4. ACTIVE NAVIGATION HIGHLIGHTING
     ============================================================ */

  let current = "";

  if (isHome) {
    current = "home";
  } else {
    if (depthParts.includes("essays")) current = "essays";
    else if (depthParts.includes("publications")) current = "publications";
    else if (depthParts.includes("photos-poems")) current = "photos-poems";
    else if (depthParts.includes("about-me")) current = "about-me";
    else if (depthParts.includes("contact")) current = "contact";
  }

  document.querySelectorAll(".nav .links a").forEach(a => {
    if (a.dataset.page === current) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });


  /* ============================================================
     5. PAGE TITLES FROM JSON
     ============================================================ */

  try {
    const titleData = await fetch(prefix + "assets/js/pageTitles.json")
      .then(r => r.json());

    const folder =
      depthParts.length >= 2 ? depthParts[depthParts.length - 2] : "";

    const spec = titleData[folder];

    const header = document.querySelector(".header--simple");
    if (header && spec) {
      const hero = header.querySelector(".hero");
      if (hero) {
        hero.innerHTML = `
          <h1>${spec.title}</h1>
          ${spec.subtitle ? `<p class="subtitle">${spec.subtitle}</p>` : ""}
        `;
      }
    }

  } catch (err) {
    console.error("TITLE JSON FAILED:", err);
  }


  /* ============================================================
     6. LOAD FOOTER PARTIAL
     ============================================================ */

  try {
    const footerHTML = await fetch(prefix + "partials/footer.html")
      .then(r => r.text());

    document.body.insertAdjacentHTML("beforeend", footerHTML);

    applyPathFixes();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if (window.lucide) {
      lucide.createIcons();
    }

    document.dispatchEvent(new Event("footerLoaded"));

  } catch (err) {
    console.error("FOOTER FAILED:", err);
  }


  /* ============================================================
     7. FINAL UI REVEAL
     ============================================================ */

  document.documentElement.classList.remove("preload");
  document.documentElement.classList.add("ready");

  document.dispatchEvent(new Event("headerLoaded"));


  /* ============================================================
     8. SIDEBAR FIX
     ============================================================ */

  document.addEventListener("headerLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      requestAnimationFrame(() => {
        sidebar.style.position = "relative";
        void sidebar.offsetHeight;
        sidebar.style.position = "";
      });
    }
  });

})();
