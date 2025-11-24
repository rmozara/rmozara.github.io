// =========================================
// Essays Page – Live Search Filter
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const cards = document.querySelectorAll(".essay-card");

  if (!input || !cards.length) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle("essay-hidden", !text.includes(query));
    });
  });
});
