document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector(".photo-grid");
  if (!grid) return;

  try {
    const res = await fetch("photos.json");
    const files = await res.json();

    // Create photo figures
    files.forEach(name => {
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.src = `../../../assets/img/photos-poems/photos/${encodeURIComponent(name)}`;
      img.alt = "Photo by Alma";
      fig.appendChild(img);
      grid.appendChild(fig);
    });

    // --- Lightbox setup ---
    const photos = grid.querySelectorAll("img");
    const lightbox = document.getElementById("photo-lightbox");
    const imgEl = lightbox.querySelector(".lightbox-img");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");
    let index = 0;

    const showLightbox = i => {
      index = i;
      imgEl.src = photos[i].src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const hideLightbox = () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    };

    const nextPhoto = dir => {
      index = (index + dir + photos.length) % photos.length;
      imgEl.src = photos[index].src;
    };

    photos.forEach((img, i) => img.addEventListener("click", () => showLightbox(i)));
    closeBtn.addEventListener("click", hideLightbox);
    prevBtn.addEventListener("click", () => nextPhoto(-1));
    nextBtn.addEventListener("click", () => nextPhoto(1));

    // Overlay click = close
    lightbox.addEventListener("click", e => {
      if (e.target.classList.contains("lightbox-overlay")) hideLightbox();
    });

    // Keyboard controls
    document.addEventListener("keydown", e => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") hideLightbox();
      if (e.key === "ArrowLeft") nextPhoto(-1);
      if (e.key === "ArrowRight") nextPhoto(1);
    });

  } catch (err) {
    console.error("Could not load photo list:", err);
  }
});
