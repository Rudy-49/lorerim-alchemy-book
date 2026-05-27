// =========================
// INGREDIENT LOOKUP PAGE
// =========================
function renderIngredientLookupPage() {
  leftPageContent.innerHTML = `
    <section class="lookup-panel ingredient-lookup-panel">
      <h2>Ingredient Lookup</h2>

      <div id="ingredientImageBox" class="ingredient-image-box">
        <span>No ingredient selected</span>
      </div>

      <div class="ingredient-search-card">
        <label class="ingredient-search-label" for="ingredientLookupInput">
          Search Ingredient
        </label>

        <div class="custom-dropdown">
          <input
            id="ingredientLookupInput"
            class="book-input"
            type="text"
            placeholder="Search or select an ingredient..."
            autocomplete="off"
          />

          <div id="ingredientDropdownMenu" class="dropdown-menu"></div>
        </div>

        <div id="ingredientLookupResult" class="ingredient-result empty">
          <div class="ingredient-stats-row">
            <div class="info-box">
              <strong>Weight</strong>
              <span>-</span>
            </div>

            <div class="info-box">
              <strong>Cost</strong>
              <span>-</span>
            </div>
          </div>

          <div class="ingredient-effects-grid">
            <div class="effect-box"></div>
            <div class="effect-box"></div>
            <div class="effect-box"></div>
            <div class="effect-box"></div>
          </div>
        </div>
      </div>
    </section>
  `;

  initIngredientLookup(ingredients);
}


// =========================
// INGREDIENT LOOKUP INIT
// =========================
function initIngredientLookup(ingredients) {
  const input = document.getElementById("ingredientLookupInput");
  const dropdown = document.getElementById("ingredientDropdownMenu");
  const result = document.getElementById("ingredientLookupResult");
  const imageBox = document.getElementById("ingredientImageBox");

  if (!input || !dropdown || !result || !imageBox) return;

  const ingredientMap = new Map();

  ingredients.forEach(ingredient => {
    const key = ingredient.name.trim().toLowerCase();

    if (!ingredientMap.has(key)) {
      ingredientMap.set(key, ingredient);
    }
  });

  const sortedIngredients =
    [...ingredientMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  function showDropdown(filterText = "") {
    const search = filterText.toLowerCase();

    dropdown.innerHTML = sortedIngredients
      .filter(ingredient =>
        ingredient.name.toLowerCase().includes(search)
      )
      .map(ingredient => `
        <button
          class="dropdown-option"
          type="button"
          data-name="${escapeHTML(ingredient.name)}">

          ${escapeHTML(ingredient.name)}
        </button>
      `).join("");

    dropdown.classList.add("show");
  }

  function selectIngredient(name) {
    const ingredient =
      ingredientMap.get(name.trim().toLowerCase());

    input.value = name;
    dropdown.classList.remove("show");

    if (!ingredient) return;

    renderIngredientDetails(ingredient, imageBox, result);
  }


  // Search events
  input.addEventListener("focus", () => {
    input.select();
    showDropdown("");
  });

  input.addEventListener("click", () => {
    input.select();
    showDropdown("");
  });

  input.addEventListener("input", () => {
    showDropdown(input.value);

    const exactMatch =
      ingredientMap.get(input.value.trim().toLowerCase());

    if (exactMatch) {
      renderIngredientDetails(exactMatch, imageBox, result);
    }
  });


  // Dropdown selection
  dropdown.addEventListener("pointerdown", event => {
    const option = event.target.closest(".dropdown-option");

    if (!option) return;

    event.preventDefault();
    selectIngredient(option.dataset.name);
  });


  // Close dropdown outside click
  document.addEventListener("click", event => {
    if (!event.target.closest(".custom-dropdown")) {
      dropdown.classList.remove("show");
    }
  });
}


// =========================
// INGREDIENT DETAILS RENDER
// =========================
function renderIngredientDetails(
  ingredient,
  imageBox,
  result
) {
  const imagePath =
    `assets/ingredients/${ingredient.imageKey}.webp`;

  imageBox.innerHTML = imagePath
    ? `
      <img
        src="${imagePath}"
        alt="${escapeHTML(ingredient.name)}"
        onerror="this.src='assets/ingredients/placeholder.webp';"
      />
    `
    : `<span>No image found</span>`;

  const weight =
    formatIngredientNumber(ingredient.weight);

  const cost =
    formatIngredientNumber(
      ingredient.cost ?? ingredient.value
    );

  const ingredientEffects =
    ingredient.effects || [];

  result.className = "ingredient-result";

  result.innerHTML = `
    <div class="ingredient-stats-row">

      <div class="info-box">
        <strong>Weight</strong>
        <span>${escapeHTML(weight)}</span>
      </div>

      <div class="info-box">
        <strong>Cost</strong>
        <span>${escapeHTML(cost)}</span>
      </div>

    </div>

    <div class="ingredient-effects-grid">
      ${[0,1,2,3].map(index => `
        <div class="effect-box">
          ${escapeHTML(
            ingredientEffects[index]?.name || ""
          )}
        </div>
      `).join("")}
    </div>
  `;
}