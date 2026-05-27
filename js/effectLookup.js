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
        <div class="effect-result-row header-row">
          <span>Ingredient</span>
          <span>Magnitude</span>
          <span>Duration</span>
        </div>

        <div class="effect-result-list">
          <p>Select an effect to view matching ingredients.</p>
        </div>
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

  function showDropdown(filterText = "") {
    const searchText = filterText.toLowerCase();

    dropdown.innerHTML = sortedEffects
      .filter(effect => effect.name.toLowerCase().includes(searchText))
      .map(effect => `
        <button class="dropdown-option" type="button" data-name="${escapeHTML(effect.name)}">
          ${escapeHTML(effect.name)}
        </button>
      `).join("");

    dropdown.classList.add("show");
  }

  function selectEffect(name) {
    const effect = effectMap.get(name.trim().toLowerCase());

    input.value = name;
    dropdown.classList.remove("show");
    document.body.classList.remove("keyboard-open");

    setTimeout(() => {
      input.closest(".effect-search-row")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);

    if (!effect) return;

    selectedEffect = effect;
    renderEffectDetails(selectedEffect, result, currentSort);
  }

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
      selectedEffect = null;
      result.className = "effect-result empty";
      result.innerHTML = `
        <div class="effect-result-row header-row">
          <span>Ingredient</span>
          <span>Magnitude</span>
          <span>Duration</span>
        </div>

        <div class="effect-result-list">
          <p>Select an effect to view matching ingredients.</p>
        </div>
      `;
      return;
    }

    const exactMatch = effectMap.get(value.toLowerCase());
    if (!exactMatch) return;

    selectedEffect = exactMatch;
    renderEffectDetails(selectedEffect, result, currentSort);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      dropdown.classList.remove("show");
      document.body.classList.remove("keyboard-open");
    }, 200);
  });

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

    // allow scrolling without auto-selecting
    if (movedY > 10 || movedX > 10) return;

    event.preventDefault();
    selectEffect(option.dataset.name);
  });

  sortButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentSort = button.dataset.sort;

      sortButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      if (selectedEffect) {
        renderEffectDetails(selectedEffect, result, currentSort);
      }
    });
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".custom-dropdown")) {
      dropdown.classList.remove("show");
      document.body.classList.remove("keyboard-open");
    }
  });
}


// =========================
// EFFECT DATA MAPPING
// =========================
function buildEffectMap(ingredients) {
  const effectMap = new Map();

  ingredients.forEach(ingredient => {
    ingredient.effects.forEach(effect => {
      const effectName = effect.name.trim();
      const key = effectName.toLowerCase();

      if (!effectMap.has(key)) {
        effectMap.set(key, {
          name: effectName,
          ingredients: []
        });
      }

      effectMap.get(key).ingredients.push({
        ingredientName: ingredient.name,
        magnitude: effect.magnitude ?? "-",
        duration: effect.duration ?? "-"
      });
    });
  });

  return effectMap;
}


// =========================
// EFFECT RESULT RENDER
// =========================
function renderEffectDetails(effect, result, sortBy = "alphabetical") {
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
    <div class="effect-result-row header-row">
      <span>Ingredient</span>
      <span>Magnitude</span>
      <span>Duration</span>
    </div>

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