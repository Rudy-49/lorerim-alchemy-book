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

  function snapPotionBuilderToTopIfIdle() {
    setTimeout(() => {
      const activeElement = document.activeElement;

      const notesFocused = activeElement === notesInput;

      const inputFocused =
        activeElement === input1 ||
        activeElement === input2 ||
        activeElement === input3;

      const dropdownOpen =
        dropdown1.classList.contains("show") ||
        dropdown2.classList.contains("show") ||
        dropdown3.classList.contains("show");

      if (notesFocused || inputFocused || dropdownOpen) return;

      document.querySelector(".potion-builder-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 350);
  }

  function getEffectNames(ingredient) {
    return (ingredient.effects || []).map(effect => effect.name);
  }

  function sharesEffect(a, b) {
    if (!a || !b) return false;
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

  function isNegativeEffect(effectName) {
    const effect = effects.find(e => e.name === effectName);

    if (effect) {
      const typeText = String(
        effect.type ||
        effect.category ||
        effect.school ||
        ""
      ).toLowerCase();

      if (
        typeText.includes("negative") ||
        typeText.includes("poison") ||
        typeText.includes("harmful")
      ) {
        return true;
      }
    }

    const negativeKeywords = [
      "damage",
      "ravage",
      "drain",
      "weakness",
      "slow",
      "paralysis",
      "fear",
      "frenzy",
      "lingering damage"
    ];

    return negativeKeywords.some(word =>
      effectName.toLowerCase().includes(word)
    );
  }

  function getPotionTypeFromEffects(shared) {
    return shared.some(isNegativeEffect)
      ? "Poison"
      : "Potion";
  }

  function generatePotionName(shared) {
    if (shared.length === 0) return "No valid potion";

    const potionType = getPotionTypeFromEffects(shared);
    const prefix = potionType === "Poison" ? "Poison of" : "Potion of";

    if (shared.length === 1) return `${prefix} ${shared[0]}`;
    if (shared.length === 2) return `${prefix} ${shared[0]} and ${shared[1]}`;

    return `${prefix} ${shared.join(", ")}`;
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

    document.body.classList.remove("keyboard-open");

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

  function selectDropdownOption(input, dropdown, option, onSelect) {
    const ingredient = dropdown.currentList[Number(option.dataset.index)];
    if (!ingredient) return;

    input.value = ingredient.name;
    dropdown.classList.remove("show");

    const wasIngredient3 = input === input3;

    onSelect(ingredient);
    updatePreview();

    if (wasIngredient3) {
      snapPotionBuilderToTopIfIdle();
    }
  }

  function setupDropdown(input, dropdown, getList, onSelect) {
    input.addEventListener("focus", () => {
      if (input.disabled) return;

      setTimeout(() => {
        input.closest(".potion-ingredient-card")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 350);

      input.select();
      renderDropdown(dropdown, getList(), input.value);
    });

    input.addEventListener("blur", () => {
      setTimeout(() => {
        dropdown.classList.remove("show");
        document.body.classList.remove("keyboard-open");
      }, 200);
    });

    input.addEventListener("click", () => {
      if (input.disabled) return;

      input.select();
      renderDropdown(dropdown, getList(), input.value);
    });

    input.addEventListener("input", () => {
      if (input.disabled) return;

      if (input === input1 && input.value.trim() === "") {
        ingr1 = null;
        ingr2 = null;
        ingr3 = null;

        input2.value = "";
        input3.value = "";
        input2.disabled = true;
        input3.disabled = true;

        dropdown2.classList.remove("show");
        dropdown3.classList.remove("show");

        updatePreview();
      }

      if (input === input2 && input.value.trim() === "") {
        ingr2 = null;
        ingr3 = null;

        input3.value = "";
        input3.disabled = true;

        dropdown3.classList.remove("show");

        updatePreview();
      }

      if (input === input3 && input.value.trim() === "") {
        ingr3 = null;
        updatePreview();
      }

      renderDropdown(dropdown, getList(), input.value);
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

      if (movedY > 10 || movedX > 10) return;

      event.preventDefault();
      selectDropdownOption(input, dropdown, option, onSelect);
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
      ingredient.name !== ingr1?.name &&
      sharesEffect(ingredient, ingr1)
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
      ingredient.name !== ingr1?.name &&
      ingredient.name !== ingr2?.name &&
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
    const selectedIngredients = [ingr1, ingr2, ingr3].filter(Boolean);

    const uniqueIngredientNames = new Set(
      selectedIngredients.map(i => i.name.toLowerCase())
    );

    if (uniqueIngredientNames.size !== selectedIngredients.length) {
      alert("Duplicate ingredients are not allowed.");
      return;
    }

    const shared = getSharedEffects(selectedIngredients);

    if (shared.length === 0) {
      alert("No valid potion.");
      return;
    }

    const potionType = getPotionTypeFromEffects(shared);
    const potionName = generatePotionName(shared);

    const potion = {
      id: Date.now(),
      name: potionName,
      type: potionType,
      ingredients: selectedIngredients.map(i => i.name),
      notes: notesInput.value,
      favorite: false
    };

    const saved = getSavedPotions();

    const newPotionKey = potion.ingredients
      .map(name => name.toLowerCase())
      .sort()
      .join("|");

    const duplicatePotion = saved.some(existingPotion => {
      const existingKey = existingPotion.ingredients
        .map(name => name.toLowerCase())
        .sort()
        .join("|");

      return existingKey === newPotionKey;
    });

    if (duplicatePotion) {
      alert("This ingredient combination is already saved.");
      return;
    }

    saved.unshift(potion);
    savePotionsToStorage(saved);
    clearPotionBuilder();

    if (isMobileView()) {
      currentSpread = 1;
      currentMobileSide = "left";
      renderSpread();
    } else {
      renderPotionDatabasePage();
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest(".custom-dropdown")) return;

    dropdown1.classList.remove("show");
    dropdown2.classList.remove("show");
    dropdown3.classList.remove("show");
    document.body.classList.remove("keyboard-open");
  });

  updatePreview();
}