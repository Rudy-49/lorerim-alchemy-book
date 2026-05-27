// =========================
// WITCHER CONSUMABLES PAGE
// =========================
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
        <div class="effect-result-row header-row">
          <span>Ingredient</span>
          <span>Magnitude</span>
          <span>Duration</span>
        </div>

        <div class="effect-result-list">
          <p>Select a primary effect to see matching ingredients.</p>
        </div>
      </div>
    </section>
  `;

  initWitcherDropdown(primaryEffects);

  document.getElementById("herbalistOneToggle")
    ?.addEventListener("change", handleHerbalistToggle);

  document.getElementById("herbalistTwoToggle")
    ?.addEventListener("change", handleHerbalistToggle);

  document.getElementById("witcherTraitToggle")
    ?.addEventListener("change", updateWitcherConsumablesResults);

  updateWitcherConsumablesResults();
}


// =========================
// WITCHER EFFECT DROPDOWN
// =========================
function initWitcherDropdown(primaryEffects) {
  const input = document.getElementById("witcherEffectInput");
  const dropdown = document.getElementById("witcherDropdownMenu");

  if (!input || !dropdown) return;

  function showDropdown(filter = "") {
    const search = filter.toLowerCase();

    dropdown.innerHTML = primaryEffects
      .filter(effect => effect.toLowerCase().includes(search))
      .map(effect => `
        <button
          class="dropdown-option"
          type="button"
          data-name="${escapeHTML(effect)}">

          ${escapeHTML(effect)}
        </button>
      `).join("");

    dropdown.classList.add("show");
  }

  function resetWitcherResults() {
    const results = document.getElementById("witcherResults");

    if (!results) return;

    results.className = "effect-result empty";

    results.innerHTML = `
      <div class="effect-result-row header-row">
        <span>Ingredient</span>
        <span>Magnitude</span>
        <span>Duration</span>
      </div>

      <div class="effect-result-list">
        <p>Select a primary effect to see matching ingredients.</p>
      </div>
    `;
  }

  function selectEffect(effectName) {
    input.value = effectName;

    dropdown.classList.remove("show");
    document.body.classList.remove("keyboard-open");

    updateWitcherConsumablesResults();

    setTimeout(() => {
      input.closest(".effect-search-row")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  }

  // =========================
  // INPUT EVENTS
  // =========================
  input.addEventListener("focus", () => {
    setTimeout(() => {
      input.closest(".effect-search-row")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 350);

    input.select();
    showDropdown("");
  });

  input.addEventListener("click", () => {
    input.select();
    showDropdown(input.value);
  });

  input.addEventListener("input", () => {
    const value = input.value.trim();

    showDropdown(value);

    if (value === "") {
      resetWitcherResults();
      return;
    }

    updateWitcherConsumablesResults();
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      dropdown.classList.remove("show");
      document.body.classList.remove("keyboard-open");
    }, 200);
  });

  // =========================
  // MOBILE SAFE DROPDOWN
  // =========================
  let pointerStartY = 0;
  let pointerStartX = 0;

  dropdown.addEventListener("pointerdown", event => {
    pointerStartY = event.clientY;
    pointerStartX = event.clientX;
  });

  dropdown.addEventListener("pointerup", event => {
    const option = event.target.closest(".dropdown-option");
    if (!option) return;

    const movedY = Math.abs(event.clientY - pointerStartY);
    const movedX = Math.abs(event.clientX - pointerStartX);

    // allow scrolling without selecting
    if (movedY > 10 || movedX > 10) return;

    event.preventDefault();

    selectEffect(option.dataset.name);
  });

  // =========================
  // OUTSIDE CLICK
  // =========================
  document.addEventListener("click", event => {
    if (!event.target.closest(".custom-dropdown")) {
      dropdown.classList.remove("show");
      document.body.classList.remove("keyboard-open");
    }
  });
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
    results.className = "effect-result empty";

    results.innerHTML = `
      <div class="effect-result-row header-row">
        <span>Ingredient</span>
        <span>Magnitude</span>
        <span>Duration</span>
      </div>

      <div class="effect-result-list">
        <p>Select a primary effect to see matching ingredients.</p>
      </div>
    `;

    return;
  }

  const matchingIngredients =
    getMatchingWitcherIngredients(selectedEffect, multiplier);

  if (!matchingIngredients.length) {
    results.className = "effect-result empty";

    results.innerHTML = `
      <div class="effect-result-row header-row">
        <span>Ingredient</span>
        <span>Magnitude</span>
        <span>Duration</span>
      </div>

      <div class="effect-result-list">
        <p>No matching ingredients found.</p>
      </div>
    `;

    return;
  }

  results.className = "effect-result";

  results.innerHTML = `
    <div class="effect-result-row header-row">
      <span>Ingredient</span>
      <span>Magnitude</span>
      <span>Duration</span>
    </div>

    <div class="effect-result-list">
      ${matchingIngredients.map(item => `
        <div class="effect-result-row">
          <span>${escapeHTML(item.name)}</span>
          <span>${escapeHTML(formatIngredientNumber(item.magnitude))}</span>
          <span>${escapeHTML(item.duration)}</span>
        </div>
      `).join("")}
    </div>
  `;
}