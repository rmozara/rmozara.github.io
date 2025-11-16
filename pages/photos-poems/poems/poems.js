// poems.js — Plugin-free flipbook (cover → spreads → closing)
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // --- Load data ---
    const res = await fetch("poems.json");
    const data = await res.json();

    const book = document.getElementById("book");
    const frame = document.querySelector(".book-frame");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    // --- Build spreads list ---
    const spreads = [];

    // Cover (single, right)
    spreads.push({
      kind: "single",
      side: "right",
      html: singleCoverHTML(data.cover)
    });

    // Poems (double spreads)
    data.poems.forEach(p => {
      spreads.push({
        kind: "double",
        htmlLeft: photoPageHTML(p.image, p.title),
        htmlRight: poemPageHTML(p.title, p.text)
      });
    });

    // Closing (single, left)
    spreads.push({
      kind: "single",
      side: "left",
      html: closingHTML()
    });

    let idx = 0; // current spread index

    // =========================================================
    // RENDER FUNCTION (with fade + slide animation)
    // =========================================================
    function render(dir = 0) { // dir: 1 = next, -1 = prev, 0 = initial
      const s = spreads[idx];
    
      // --- Create new spread ---
      const incoming = document.createElement("div");
      incoming.className = `spread ${s.kind === "double" ? "spread--double" : "spread--single"}`;
    
      // Layout and size
      frame.style.justifyContent = s.kind === "single"
        ? (s.side === "right" ? "flex-end" : "flex-start")
        : "center";
      book.className = `book book--${s.kind}`;
      book.style.width = s.kind === "single" ? "450px" : "900px";
    
      // Fill content
      if (s.kind === "single") {
        // render only the single-side page (right for cover, left for closing)
        const align = s.side === "right" ? "flex-end" : "flex-start";
        frame.style.justifyContent = align;
        incoming.innerHTML = `
          <div class="page page--single page--${s.side}">
            ${s.html}
          </div>`;
      } else {
        incoming.innerHTML = `
          <div class="page page--photo">${s.htmlLeft}</div>
          <div class="page page--poem">${s.htmlRight}</div>`;
      }
    
      // Insert new spread, with starting offset
      incoming.style.setProperty('--dx', dir > 0 ? '20px' : (dir < 0 ? '-20px' : '0px'));
      book.appendChild(incoming);
      void incoming.offsetWidth; // force reflow
      incoming.classList.add("active");
    
      // --- Handle previous spread (staggered fade) ---
      const prevSpreads = book.querySelectorAll(".spread");
      if (prevSpreads.length > 1) {
        const outgoing = prevSpreads[0];
        const pages = outgoing.querySelectorAll(".page");
        const [leftPage, rightPage] = pages;
    
        const delay = 0.25; // seconds — visibly slower
    
        // set staggered delays
        if (dir > 0 && rightPage) {
          // turn right → right first, then left
          rightPage.style.transitionDelay = "0s";
          if (leftPage) leftPage.style.transitionDelay = `${delay}s`;
        } else if (dir < 0 && leftPage) {
          // turn left → left first, then right
          leftPage.style.transitionDelay = "0s";
          if (rightPage) rightPage.style.transitionDelay = `${delay}s`;
        }
    
        outgoing.classList.add("fading");              // trigger per-page opacity fade
        outgoing.classList.remove("active");           // trigger spread slide/fade
        outgoing.style.setProperty("--dx", dir > 0 ? "-20px" : "20px");
    
        outgoing.addEventListener("transitionend", () => outgoing.remove(), { once: true });
      }

      // Navigation visibility
      prevBtn.style.visibility = idx === 0 ? "hidden" : "visible";
      nextBtn.style.visibility = idx === spreads.length - 1 ? "hidden" : "visible";

      // Update sidebar highlighting (if present)
      updateActiveLink();
    }

    // =========================================================
    // PAGE TEMPLATES
    // =========================================================
    function singleCoverHTML(cover) {
      return `
        <div class="cover" style="background-image:url('${cover.image}')">
          <div class="cover__overlay"></div>
          <div class="cover__inner">
            <h2>${cover.title}</h2>
            <p>${cover.subtitle}</p>
          </div>
        </div>
      `;
    }

    function photoPageHTML(src, alt) {
      return `<img src="${src}" alt="${alt || ""}">`;
    }

    function poemPageHTML(title, text) {
      return `
        <div class="poem">
          <h3>${title}</h3>
          <div class="poem__scroll scroll-thin">
            <pre>${text}</pre>
          </div>
        </div>
      `;
    }

    function closingHTML() {
      return `<div class="closing"><p>Thank you for reading.<br>© Alma</p></div>`;
    }

    // =========================================================
    // CONTROLS
    // =========================================================
    prevBtn.addEventListener("click", () => {
      if (idx > 0) {
        idx--;
        render(-1);
      }
    });

    nextBtn.addEventListener("click", () => {
      if (idx < spreads.length - 1) {
        idx++;
        render(1);
      }
    });

    // Keyboard navigation
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
    });

    // =========================================================
    // SIDEBAR: Jump between poems
    // =========================================================
    const sidebarLinks = document.querySelectorAll(".poem-list a");
    if (sidebarLinks.length) {
      sidebarLinks.forEach((link, i) => {
        link.addEventListener("click", e => {
          e.preventDefault();
          // Spread index: +1 offset because index 0 = cover
          const target = i + 1;
          if (target >= 0 && target < spreads.length - 1) {
            idx = target;
            render(0);
          }
        });
      });
    }

    // Highlight currently active link
    function updateActiveLink() {
      if (!sidebarLinks.length) return;
      sidebarLinks.forEach((link, i) => {
        link.classList.toggle("active", i + 1 === idx);
      });
    }

    // =========================================================
    // INITIAL RENDER
    // =========================================================
    render(0);
    updateActiveLink();

  } catch (err) {
    console.error("Failed to load poems:", err);
  }
});
