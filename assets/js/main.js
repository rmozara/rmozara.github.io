// =========================================
//  main.js — Core Functional UI Logic
//  -----------------------------------------
//  Responsibilities:
//  • Auto-update the copyright year.
//  • Handle nav scroll activation (adds .scrolled).
//  • Initialize Lucide icons globally.
//  -----------------------------------------
//  Notes:
//  - No manual scroll manipulations or layout forcing.
//  - Fully passive event listeners for performance.
// =========================================

// --- Scroll-triggered nav transition (robust with partials + images) ---
(() => {
  const initNavScroll = () => {
    if (initNavScroll.initialized) return;

    const header = document.querySelector(".header");
    const nav = document.querySelector(".nav");
    if (!header || !nav) {
      return;
    }

    initNavScroll.initialized = true;

    const getTriggerPoint = () => header.offsetHeight * 0.05;

    const updateNav = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.classList.toggle("scrolled", scrollTop > getTriggerPoint());
    };

    // Attach passive scroll listener
    window.addEventListener("scroll", updateNav, { passive: true });

    // Recalculate trigger height on resize or image load
    window.addEventListener("resize", updateNav);
    window.addEventListener("load", updateNav);

    // Run once after everything is loaded
    updateNav();
  };

  // Works for both direct load and injected header
  document.addEventListener("headerLoaded", initNavScroll);

  document.addEventListener("headerLoaded", () => {
    const side = document.querySelector(".sidebar");
    if (side) side.style.top = getComputedStyle(side).top; // force layout re-calc
  });

})();

// --- Lucide icon activation ---
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();
  });
})();

// --- Mobile burger toggle (delegated; works with injected headers) ---
(() => {
  const toggleMenu = (force) => {
    const open = (force !== undefined)
      ? force
      : !document.body.classList.contains("nav-open");

    document.body.classList.toggle("nav-open", open);

    // update aria-expanded on ALL toggles (safe even if multiple headers exist)
    document.querySelectorAll(".nav-toggle").forEach(btn => {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-toggle");
    if (btn) {
      e.preventDefault();
      toggleMenu();
      return;
    }

    // close when a nav link is clicked
    const link = e.target.closest(".nav .links a");
    if (link) toggleMenu(false);
  });

  // optional: close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(false);
  });
})();
