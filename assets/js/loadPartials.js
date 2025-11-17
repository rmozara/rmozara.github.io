(async () => {

  /* ============================================================
     0. BASIC PATH INFO (NO REPO PREFIX NEEDED)
     ============================================================ */

  const parts = location.pathname.split("/").filter(Boolean);

  // We always use absolute paths (starting with "/") in HTML,
  // so fix() just returns the path unchanged.
  const fix = (path) => path;


  /* ============================================================
     1. APPLY PATH FIXES (CURRENTLY A NO-OP BUT KEEPS data-src LOGIC)
     ============================================================ */

  const applyPathFixes = () => {
    // <img data-src="/assets/...">
    document.querySelectorAll("[data-src]").forEach(el => {
      el.src = fix(el.dataset.src);
    });

    // <img src="/assets/...">
    document.querySelectorAll("img[src^='/']").forEach(img => {
      img.src = fix(img.getAttribute("src"));
    });

    // <a href="/pages/...">
    document.querySelectorAll("a[href^='/']").forEach(a => {
      a.href = fix(a.getAttribute("href"));
    });
  };


  /* ============================================================
     2. DETECT HOME PAGE
     ============================================================ */

  const isHome =
    parts.length === 0 ||                          // "/"
    (parts.length === 1 && parts[0] === "index.html"); // "/index.html"


  /* ============================================================
     3. LOAD HEADER PARTIAL
     ============================================================ */

  const headerFile = isHome ? "header-home.html" : "header-simple.html";

  try {
    const headerHTML = await fetch(fix("/partials/" + headerFile))
      .then(r => r.text());

    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    applyPathFixes();

  } catch (err) {
    console.error("HEADER FAILED:", err);
  }


  /* ============================================================
     4. ACTIVE NAVIGATION HIGHLIGHT
     ============================================================ */

  let current = "";

  if (isHome) {
    current = "home";
  } else {
    if (parts.includes("essays")) current = "essays";
    else if (parts.includes("publications")) current = "publications";
    else if (parts.includes("photos-poems")) current = "photos-poems";
    else if (parts.includes("about-me")) current = "about-me";
    else if (parts.includes("contact")) current = "contact";
  }

  document.querySelectorAll(".nav .links a").forEach(a => {
    if (a.dataset.page === current) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });


  /* ============================================================
     5. PAGE TITLES (JSON)
     ============================================================ */

  try {
    const titleData = await fetch(fix("/assets/js/pageTitles.json"))
      .then(r => r.json());

    const folder =
      parts.length >= 2 ? parts[parts.length - 2] : "";

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
     6. LOAD FOOTER
     ============================================================ */

  try {
    const footerHTML = await fetch(fix("/partials/footer.html"))
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
     8. SIDEBAR FIX FOR DYNAMIC HEADER
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
