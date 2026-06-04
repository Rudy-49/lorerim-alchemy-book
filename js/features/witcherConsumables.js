// =========================
// WITCHER CONSUMABLES PAGE
// =========================
let currentWitcherTab = "search";

function renderWitcherConsumablesPage() {
  const page = document.getElementById("witcherConsumablesPage");
  if (!page) return;

  const primaryEffects = [...new Set(
    ingredients.map(ingredient => ingredient.effects?.[0]?.name).filter(Boolean)
  )].sort();

  page.innerHTML = `
    <section class="effect-lookup-panel">
      <h2>Witcher's Consumables</h2>

      <div class="witcher-controls">
        <label>
          <input type="checkbox" id="witcherTraitToggle" checked>
          Witcher Trait
        </label>

        <label>
          <input type="checkbox" id="herbalistOneToggle">
          Herbalist I
        </label>

        <label>
          <input type="checkbox" id="herbalistTwoToggle" checked>
          Herbalist II
        </label>

        <p id="witcherMultiplierDisplay"></p>
      </div>

      <div class="witcher-tabs">
        <button
          type="button"
          class="witcher-tab-btn ${currentWitcherTab === "search" ? "active" : ""}"
          data-tab="search">
          Search Effects
        </button>

        <span class="witcher-tab-divider">|</span>

        <button
          type="button"
          class="witcher-tab-btn ${currentWitcherTab === "tracked" ? "active" : ""}"
          data-tab="tracked">
          Tracked Ingredients
        </button>
      </div>

      ${currentWitcherTab === "search" ? `
        <div class="effect-search-row">
          <div class="custom-dropdown">
            <input
              id="witcherEffectInput"
              class="book-input"
              type="text"
              placeholder="Search primary effect..."
              autocomplete="off"
            />

            <div id="witcherDropdownMenu" class="dropdown-menu"></div>
          </div>
        </div>

        <div id="witcherResults" class="effect-result empty">
          ${getWitcherEmptyResultsHTML("Select a primary effect to see matching ingredients.")}
        </div>
      ` : `
        <div class="effect-search-row witcher-tracked-summary-row">
          <span>Currently tracked Witcher ingredients</span>
        </div>

        <div id="witcherResults" class="effect-result">
          ${getTrackedWitcherIngredientsHTML()}
        </div>
      `}
    </section>
  `;

  document.querySelectorAll(".witcher-tab-btn").forEach(button => {
    button.addEventListener("click", event => {
      const selectedTab = event.currentTarget.dataset.tab;

      if (selectedTab === currentWitcherTab) return;

      currentWitcherTab = selectedTab;

      if (currentWitcherTab === "search") {
        trackFeatureOpen("Witcher Search");
      } else if (currentWitcherTab === "tracked") {
        trackFeatureOpen("Witcher Tracked Ingredients");
      }

      renderWitcherConsumablesPage();
    });
  });

  document.getElementById("herbalistOneToggle")
    ?.addEventListener("change", handleHerbalistToggle);

  document.getElementById("herbalistTwoToggle")
    ?.addEventListener("change", handleHerbalistToggle);

  document.getElementById("witcherTraitToggle")
    ?.addEventListener("change", updateWitcherConsumablesResults);

  if (currentWitcherTab === "tracked") {
    const multiplierDisplay = document.getElementById("witcherMultiplierDisplay");
    if (multiplierDisplay) {
      multiplierDisplay.textContent =
        `Current magnitude multiplier: ×${getWitcherConsumableMultiplier()}`;
    }

    bindTrackedWitcherButtons();
    return;
  }

  initWitcherDropdown(primaryEffects);
  updateWitcherConsumablesResults();
}

function getTrackedWitcherIngredientsHTML() {
  const tracked = getTrackedWitcherIngredients();

  if (!tracked.length) {
    return `
      <div class="witcher-table-row witcher-header-row witcher-tracked-header-row">
        <span>Track</span>
        <span>Ingredient</span>
        <span>Primary Effect</span>
      </div>

      <div class="effect-result-list">
        <p>No Witcher ingredients tracked.</p>
      </div>
    `;
  }

  const trackedIngredients = tracked
    .map(name =>
      ingredients.find(ingredient =>
        ingredient.name.toLowerCase() === name.toLowerCase()
      )
    )
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  return `
    <div class="witcher-table-row witcher-header-row witcher-tracked-header-row">
      <span>Track</span>
      <span>Ingredient</span>
      <span>Primary Effect</span>
    </div>

    <div class="effect-result-list">
      ${trackedIngredients.map(ingredient => `
        <div class="witcher-table-row witcher-result-row witcher-tracked-row">
          <span class="witcher-track-cell">
            <button
              type="button"
              class="track-witcher-ingredient-btn tracked"
              data-name="${escapeHTML(ingredient.name)}"
              title="Remove from collection list">
              ★
            </button>
          </span>

          <span>${escapeHTML(ingredient.name)}</span>

          <span>
            ${escapeHTML(ingredient.effects?.[0]?.name || "-")}
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

function bindTrackedWitcherButtons() {
  document
    .querySelectorAll(".track-witcher-ingredient-btn")
    .forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();

        const ingredientName = event.currentTarget.dataset.name;

        trackAction("Track Witcher Ingredient");

        toggleTrackedWitcherIngredient(ingredientName);

        renderWitcherConsumablesPage();

        if (document.getElementById("ingredientCollectionPage")) {
          renderIngredientCollectionPage();
        }
      });
    });
}


// =========================
// WITCHER EFFECT DROPDOWN
// =========================
function initWitcherDropdown(primaryEffects) {
  const input = document.getElementById("witcherEffectInput");
  const dropdown = document.getElementById("witcherDropdownMenu");

  if (!input || !dropdown) return;

  createSearchDropdown({
    input,
    dropdown,

    items: primaryEffects,

    getLabel: effect => effect,

    scrollTargetSelector: ".effect-search-row",

    onEmpty: () => {
      resetWitcherResults();
    },

    onSelect: () => {
      trackAction("Witcher Search");
      updateWitcherConsumablesResults();
    }
  });

  input.addEventListener("input", updateWitcherConsumablesResults);
}


// =========================
// WITCHER TOGGLES
// =========================
function handleHerbalistToggle(event) {
  const herb1 = document.getElementById("herbalistOneToggle");
  const herb2 = document.getElementById("herbalistTwoToggle");

  if (!herb1 || !herb2) return;

  if (event.target === herb1 && herb1.checked) herb2.checked = false;
  if (event.target === herb2 && herb2.checked) herb1.checked = false;

  updateWitcherConsumablesResults();
}

function getWitcherConsumableMultiplier() {
  let multiplier = 1;

  if (document.getElementById("witcherTraitToggle")?.checked) multiplier *= 3;
  if (document.getElementById("herbalistOneToggle")?.checked) multiplier *= 2;
  if (document.getElementById("herbalistTwoToggle")?.checked) multiplier *= 5;

  return multiplier;
}


// =========================
// WITCHER RESULT HELPERS
// =========================
function formatWitcherDuration(duration) {
  const value = Number(duration);
  return value > 0 ? `${value}s` : "Instant";
}

function getMatchingWitcherIngredients(selectedEffect, multiplier) {
  return ingredients
    .filter(ingredient => ingredient.effects?.[0]?.name === selectedEffect)
    .map(ingredient => {
      const primary = ingredient.effects[0];
      const baseMagnitude = Number(primary.magnitude) || 0;

      return {
        name: ingredient.name,
        magnitude: baseMagnitude * multiplier,
        duration: formatWitcherDuration(primary.duration)
      };
    })
    .sort((a, b) => b.magnitude - a.magnitude);
}

function getWitcherResultHeaderHTML() {
  return `
    <div class="witcher-table-row witcher-header-row">
      <span>Track</span>
      <span>Ingredient</span>
      <span>Magnitude</span>
      <span>Duration</span>
    </div>
  `;
}

function getWitcherEmptyResultsHTML(message) {
  return `
    ${getWitcherResultHeaderHTML()}

    <div class="effect-result-list">
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

function resetWitcherResults(
  message = "Select a primary effect to see matching ingredients."
) {
  const results = document.getElementById("witcherResults");

  if (!results) return;

  results.className = "effect-result empty";
  results.innerHTML = getWitcherEmptyResultsHTML(message);
}


// =========================
// WITCHER RESULTS RENDER
// =========================
function updateWitcherConsumablesResults() {
  const input = document.getElementById("witcherEffectInput");
  const results = document.getElementById("witcherResults");
  const multiplierDisplay = document.getElementById("witcherMultiplierDisplay");

  if (!input || !results || !multiplierDisplay) return;

  const selectedEffect = input.value.trim();
  const multiplier = getWitcherConsumableMultiplier();

  multiplierDisplay.textContent =
    `Current magnitude multiplier: ×${multiplier}`;

  if (!selectedEffect) {
    resetWitcherResults();
    return;
  }

  const matchingIngredients =
    getMatchingWitcherIngredients(selectedEffect, multiplier);

  if (!matchingIngredients.length) {
    resetWitcherResults("No matching ingredients found.");
    return;
  }

  results.className = "effect-result";

  results.innerHTML = `
    ${getWitcherResultHeaderHTML()}

    <div class="effect-result-list">
      ${matchingIngredients.map(item => {
        const isTracked =
          isWitcherIngredientTracked(item.name);

        return `
          <div class="witcher-table-row witcher-result-row">

            <span class="witcher-track-cell">
              <button
                type="button"
                class="track-witcher-ingredient-btn ${isTracked ? "tracked" : ""}"
                data-name="${escapeHTML(item.name)}"
                title="${isTracked
                  ? "Remove from collection list"
                  : "Add to collection list"}">

                ${isTracked ? "★" : "☆"}

              </button>
            </span>

            <span>
              ${escapeHTML(item.name)}
            </span>

            <span>
              ${escapeHTML(
                formatIngredientNumber(item.magnitude)
              )}
            </span>

            <span>
              ${escapeHTML(item.duration)}
            </span>

          </div>
        `;
      }).join("")}
    </div>
  `;

  document
    .querySelectorAll(".track-witcher-ingredient-btn")
    .forEach(button => {

      button.addEventListener("click", event => {
        event.stopPropagation();

        const ingredientName =
          event.currentTarget.dataset.name;

        trackAction("Track Witcher Ingredient");

        toggleTrackedWitcherIngredient(
          ingredientName
        );

        updateWitcherConsumablesResults();

        if (
          document.getElementById(
            "ingredientCollectionPage"
          )
        ) {
          renderIngredientCollectionPage();
        }
      });

    });
}