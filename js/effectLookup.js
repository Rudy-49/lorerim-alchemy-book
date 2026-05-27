// =========================
// EFFECT LOOKUP PAGE RENDER
// =========================
function renderEffectLookupPage() {
  const targetPage = isMobileView() ? leftPageContent : rightPageContent;

  targetPage.innerHTML = `
    <section class="lookup-panel effect-lookup-panel">
      <h2>Effect Lookup</h2>

      <div class="effect-search-row">
        <div class="custom-dropdown">
          <input
            id="effectLookupInput"
            class="book-input"
            type="text"
            placeholder="Search or select an effect..."
            autocomplete="off"
          />
          <div id="effectDropdownMenu" class="dropdown-menu"></div>
        </div>

        <div class="effect-sort-controls">
          <button type="button" class="effect-sort-btn active" data-sort="alphabetical">A-Z</button>
          <button type="button" class="effect-sort-btn" data-sort="magnitude">Mag</button>
          <button type="button" class="effect-sort-btn" data-sort="duration">Dur</button>
        </div>
      </div>

      <div id="effectLookupResult" class="effect-result empty">
        ${getEffectEmptyStateHTML(
          "Select an effect to view matching ingredients."
        )}
      </div>
    </section>
  `;

  initEffectLookup(ingredients);
}


// =========================
// EFFECT LOOKUP INIT
// =========================
function initEffectLookup(ingredients) {
  const input = document.getElementById("effectLookupInput");
  const dropdown = document.getElementById("effectDropdownMenu");
  const result = document.getElementById("effectLookupResult");
  const sortButtons = document.querySelectorAll(".effect-sort-btn");

  if (!input || !dropdown || !result) return;

  let selectedEffect = null;
  let currentSort = "alphabetical";

  const effectMap = buildEffectMap(ingredients);

  const sortedEffects = [...effectMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  createSearchDropdown({
    input,
    dropdown,

    items: sortedEffects,

    getLabel: effect => effect.name,

    scrollTargetSelector: ".effect-search-row",

    onEmpty: () => {
      selectedEffect = null;

      renderEffectEmptyState(
        result,
        "Select an effect to view matching ingredients."
      );
    },

    onSelect: effectName => {
      const effect =
        effectMap.get(effectName.trim().toLowerCase());

      if (!effect) return;

      selectedEffect = effect;

      renderEffectDetails(
        selectedEffect,
        result,
        currentSort
      );
    }
  });

  input.addEventListener("input", () => {
    const value = input.value.trim();

    const exactMatch =
      effectMap.get(value.toLowerCase());

    if (!exactMatch) return;

    selectedEffect = exactMatch;

    renderEffectDetails(
      selectedEffect,
      result,
      currentSort
    );
  });

  sortButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentSort = button.dataset.sort;

      sortButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      if (selectedEffect) {
        renderEffectDetails(
          selectedEffect,
          result,
          currentSort
        );
      }
    });
  });
}

// =========================
// EFFECT RESULT RENDER
// =========================
function renderEffectDetails(
  effect,
  result,
  sortBy = "alphabetical"
) {
  const sortedIngredients = [...effect.ingredients];

  if (sortBy === "alphabetical") {
    sortedIngredients.sort((a, b) =>
      a.ingredientName.localeCompare(b.ingredientName)
    );
  } else if (sortBy === "magnitude") {
    sortedIngredients.sort((a, b) =>
      Number(b.magnitude) - Number(a.magnitude)
    );
  } else if (sortBy === "duration") {
    sortedIngredients.sort((a, b) =>
      Number(b.duration) - Number(a.duration)
    );
  }

  result.className = "effect-result";

  result.innerHTML = `
    ${getEffectResultHeaderHTML()}

    <div class="effect-result-list">
      ${sortedIngredients.map(item => `
        <div class="effect-result-row">
          <span>${escapeHTML(item.ingredientName)}</span>
          <span>${escapeHTML(formatIngredientNumber(item.magnitude))}</span>
          <span>${escapeHTML(formatIngredientNumber(item.duration))}</span>
        </div>
      `).join("")}
    </div>
  `;
}