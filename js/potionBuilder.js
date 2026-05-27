// =========================
// POTION BUILDER PAGE
// =========================
function renderPotionBuilderPage() {
  leftPageContent.innerHTML = `
    <section class="lookup-panel potion-builder-panel">
      <h2>Potion Builder</h2>

      <div id="potionResultBox" class="potion-result-box">
        <div class="potion-result-text">
          <div id="generatedPotionName" class="generated-potion-name">
            No potion created
          </div>

          <div id="sharedEffectsDisplay" class="shared-effects-box">
            Select at least 2 ingredients
          </div>
        </div>

        <button id="savePotionBtn" class="book-button save-potion-btn" type="button">
          Save Potion
        </button>
      </div>

      <div class="ingredient-search-card potion-builder-card">
        <div class="potion-ingredient-stack">

          <div class="potion-ingredient-card">
            <label for="ingredient1Input">INGR 1</label>
            <div class="custom-dropdown">
              <input id="ingredient1Input" class="book-input" type="text" placeholder="Search ingredient..." autocomplete="off">
              <div id="ingredient1Dropdown" class="dropdown-menu"></div>
            </div>
          </div>

          <div class="potion-ingredient-card">
            <label for="ingredient2Input">INGR 2</label>
            <div class="custom-dropdown">
              <input id="ingredient2Input" class="book-input" type="text" placeholder="Choose Ingredient 1 first..." autocomplete="off">
              <div id="ingredient2Dropdown" class="dropdown-menu"></div>
            </div>
          </div>

          <div class="potion-ingredient-card">
            <label for="ingredient3Input">INGR 3</label>
            <div class="custom-dropdown">
              <input id="ingredient3Input" class="book-input" type="text" placeholder="Choose Ingredient 2 first..." autocomplete="off">
              <div id="ingredient3Dropdown" class="dropdown-menu"></div>
            </div>
          </div>

          <div class="potion-notes-card">
            <label for="potionNotesInput">Notes</label>
            <textarea id="potionNotesInput" class="potion-notes-input" placeholder="Add notes..."></textarea>
          </div>

        </div>
      </div>
    </section>
  `;

  initPotionBuilder();
}


// =========================
// POTION BUILDER INIT
// =========================
function initPotionBuilder() {
  const input1 = document.getElementById("ingredient1Input");
  const input2 = document.getElementById("ingredient2Input");
  const input3 = document.getElementById("ingredient3Input");

  const dropdown1 = document.getElementById("ingredient1Dropdown");
  const dropdown2 = document.getElementById("ingredient2Dropdown");
  const dropdown3 = document.getElementById("ingredient3Dropdown");

  const saveBtn = document.getElementById("savePotionBtn");
  const notesInput = document.getElementById("potionNotesInput");
  const nameBox = document.getElementById("generatedPotionName");
  const effectsBox = document.getElementById("sharedEffectsDisplay");

  let ingr1 = null;
  let ingr2 = null;
  let ingr3 = null;

  input2.disabled = true;
  input3.disabled = true;

  const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));

  function focusAndSelect(input) {
    setTimeout(() => {
      input.focus();
      input.select?.();
    }, 0);
  }

  function getEffectNames(ingredient) {
    return (ingredient.effects || []).map(effect => effect.name);
  }

  function sharesEffect(a, b) {
    return getEffectNames(a).some(effect => getEffectNames(b).includes(effect));
  }

  function getSharedEffects(list) {
    const valid = list.filter(Boolean);
    if (valid.length < 2) return [];

    const counts = new Map();

    valid.forEach(ingredient => {
      [...new Set(getEffectNames(ingredient))].forEach(effect => {
        counts.set(effect, (counts.get(effect) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .filter(([, count]) => count >= 2)
      .map(([effect]) => effect)
      .sort();
  }

  function generatePotionName(shared) {
    if (shared.length === 0) return "No valid potion";
    if (shared.length === 1) return `Potion of ${shared[0]}`;
    if (shared.length === 2) return `Potion of ${shared[0]} and ${shared[1]}`;

    return `Potion of ${shared.join(", ")}`;
  }

  function updatePreview() {
    const shared = getSharedEffects([ingr1, ingr2, ingr3]);

    nameBox.textContent = generatePotionName(shared);
    effectsBox.textContent = shared.length
      ? `Shared Effects: ${shared.join(", ")}`
      : "Select ingredients";
  }

  function clearPotionBuilder() {
    ingr1 = null;
    ingr2 = null;
    ingr3 = null;

    input1.value = "";
    input2.value = "";
    input3.value = "";
    notesInput.value = "";

    input2.disabled = true;
    input3.disabled = true;

    dropdown1.classList.remove("show");
    dropdown2.classList.remove("show");
    dropdown3.classList.remove("show");

    updatePreview();
    focusAndSelect(input1);
  }

  function renderDropdown(dropdown, list, filter = "") {
    const search = filter.toLowerCase();

    const filtered = list.filter(ingredient =>
      ingredient.name.toLowerCase().includes(search)
    );

    dropdown.currentList = filtered;

    dropdown.innerHTML = filtered.map((ingredient, index) => `
      <button class="dropdown-option" data-index="${index}" type="button">
        ${escapeHTML(ingredient.name)}
      </button>
    `).join("");

    dropdown.classList.add("show");
  }

  function setupDropdown(input, dropdown, getList, onSelect) {
    input.addEventListener("focus", () => {
      if (input.disabled) return;

      input.select();
      renderDropdown(dropdown, getList(), input.value);
    });

    input.addEventListener("click", () => {
      if (input.disabled) return;

      input.select();
      renderDropdown(dropdown, getList(), input.value);
    });

    input.addEventListener("input", () => {
      if (input.disabled) return;

      renderDropdown(dropdown, getList(), input.value);
    });

    dropdown.addEventListener("pointerdown", event => {
      const option = event.target.closest(".dropdown-option");
      if (!option) return;

      event.preventDefault();

      const ingredient = dropdown.currentList[Number(option.dataset.index)];
      if (!ingredient) return;

      input.value = ingredient.name;
      dropdown.classList.remove("show");

      onSelect(ingredient);
      updatePreview();
    });
  }

  setupDropdown(input1, dropdown1, () => sortedIngredients, ingredient => {
    ingr1 = ingredient;
    ingr2 = null;
    ingr3 = null;

    input2.disabled = false;
    input3.disabled = true;

    input2.value = "";
    input3.value = "";

    focusAndSelect(input2);
  });

  setupDropdown(input2, dropdown2, () =>
    sortedIngredients.filter(ingredient =>
      ingredient !== ingr1 && sharesEffect(ingredient, ingr1)
    ),
    ingredient => {
      ingr2 = ingredient;
      ingr3 = null;

      input3.disabled = false;
      input3.value = "";

      focusAndSelect(input3);
    }
  );

  setupDropdown(input3, dropdown3, () =>
    sortedIngredients.filter(ingredient =>
      ingredient !== ingr1 &&
      ingredient !== ingr2 &&
      (sharesEffect(ingredient, ingr1) || sharesEffect(ingredient, ingr2))
    ),
    ingredient => {
      ingr3 = ingredient;

      setTimeout(() => {
        notesInput.focus();
      }, 0);
    }
  );

  saveBtn.addEventListener("click", () => {
    const shared = getSharedEffects([ingr1, ingr2, ingr3]);

    if (shared.length === 0) {
      alert("No valid potion.");
      return;
    }

    const potion = {
      id: Date.now(),
      name: generatePotionName(shared),
      ingredients: [ingr1, ingr2, ingr3].filter(Boolean).map(i => i.name),
      notes: notesInput.value,
      favorite: false
    };

    const saved = getSavedPotions();

    saved.unshift(potion);
    savePotionsToStorage(saved);
    renderPotionDatabasePage();
    clearPotionBuilder();
  });

  document.addEventListener("click", event => {
    if (event.target.closest(".custom-dropdown")) return;

    dropdown1.classList.remove("show");
    dropdown2.classList.remove("show");
    dropdown3.classList.remove("show");
  });

  updatePreview();
}