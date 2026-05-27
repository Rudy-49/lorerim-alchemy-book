// =========================
// SHARED RESULT RENDERERS
// =========================

function getEffectResultHeaderHTML() {
  return `
    <div class="effect-result-row header-row">
      <span>Ingredient</span>
      <span>Magnitude</span>
      <span>Duration</span>
    </div>
  `;
}

function getEffectEmptyStateHTML(message) {
  return `
    ${getEffectResultHeaderHTML()}

    <div class="effect-result-list">
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

function renderEffectEmptyState(
  resultElement,
  message = "Select an effect to view matching ingredients."
) {
  if (!resultElement) return;

  resultElement.className = "effect-result empty";
  resultElement.innerHTML = getEffectEmptyStateHTML(message);
}

function getEffectResultRowsHTML(items) {
  return `
    ${getEffectResultHeaderHTML()}

    <div class="effect-result-list">
      ${items.map(item => `
        <div class="effect-result-row">
          <span>${escapeHTML(item.name)}</span>
          <span>${escapeHTML(formatIngredientNumber(item.magnitude))}</span>
          <span>${escapeHTML(item.duration)}</span>
        </div>
      `).join("")}
    </div>
  `;
}