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

// --- Auto-update footer year ---
(() => {
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// --- Scroll-triggered nav transition (robust with partials + images) ---
(() => {
  const initNavScroll = () => {
    console.log("initNavScroll() triggered");

    const header = document.querySelector(".header");
    const nav = document.querySelector(".nav");
    if (!header || !nav) {
      console.warn("Header or nav not found yet. Retrying...");
      setTimeout(initNavScroll, 100);
      return;
    }

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
    console.log("scroll listener attached");
  };

  // Works for both direct load and injected header
  window.addEventListener("load", initNavScroll);
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
