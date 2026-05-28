// =========================
// INGREDIENT COLLECTION STATE
// =========================
let currentCollectionFilter = "all";


// =========================
// INGREDIENT COLLECTION DATA
// =========================
function getPotionDatabaseIngredientNames() {
  const potions = getSavedPotions();

  return potions.flatMap(potion =>
    Array.isArray(potion.ingredients) ? potion.ingredients : []
  );
}

function buildIngredientCollectionList() {
  const potionIngredients = getPotionDatabaseIngredientNames();
  const witcherIngredients = getTrackedWitcherIngredients();

  const ingredientMap = new Map();

  potionIngredients.forEach(name => {
    const key = name.toLowerCase().trim();

    if (!ingredientMap.has(key)) {
      ingredientMap.set(key, {
        name,
        fromPotionDatabase: false,
        fromWitcher: false,
        potionCount: 0
      });
    }

    const item = ingredientMap.get(key);
    item.fromPotionDatabase = true;
    item.potionCount += 1;
  });

  witcherIngredients.forEach(name => {
    const key = name.toLowerCase().trim();

    if (!ingredientMap.has(key)) {
      ingredientMap.set(key, {
        name,
        fromPotionDatabase: false,
        fromWitcher: false,
        potionCount: 0
      });
    }

    ingredientMap.get(key).fromWitcher = true;
  });

  return [...ingredientMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getFilteredIngredientCollectionItems() {
  const items = buildIngredientCollectionList();

  if (currentCollectionFilter === "potion") {
    return items.filter(item => item.fromPotionDatabase);
  }

  if (currentCollectionFilter === "witcher") {
    return items.filter(item => item.fromWitcher);
  }

  return items;
}


// =========================
// TAG RENDERING
// =========================
function getIngredientCollectionTagHTML(item) {
  const tags = [];

  if (item.fromPotionDatabase) {
    tags.push(`Potion${item.potionCount > 1 ? ` ×${item.potionCount}` : ""}`);
  }

  if (item.fromWitcher) {
    tags.push("Witcher");
  }

  return tags
    .map(tag => `<span class="collection-tag">${escapeHTML(tag)}</span>`)
    .join("");
}


// =========================
// PAGE RENDER
// =========================
function renderIngredientCollectionPage() {
  const page = document.getElementById("ingredientCollectionPage");
  if (!page) return;

  const allItems = buildIngredientCollectionList();
  const filteredItems = getFilteredIngredientCollectionItems();

  const potionCount = allItems.filter(item => item.fromPotionDatabase).length;
  const witcherCount = allItems.filter(item => item.fromWitcher).length;

  page.innerHTML = `
    <section class="lookup-panel effect-lookup-panel ingredient-collection-panel">
      <h2>Ingredients to Collect</h2>

      <div class="collection-top-row">
        <select id="collectionFilterSelect" class="collection-filter-select">
            <option value="all">All</option>
            <option value="potion">Potion</option>
            <option value="witcher">Witcher</option>
        </select>

        <div class="collection-counts">
            <span>Total: <strong>${allItems.length}</strong></span>
            <span>Potion: <strong>${potionCount}</strong></span>
            <span>Witcher: <strong>${witcherCount}</strong></span>
        </div>
      </div>

      <div class="effect-result collection-result">
        <div class="effect-result-row header-row collection-header-row">
          <span>Ingredient</span>
          <span>Tags</span>
        </div>

        <div class="effect-result-list collection-result-list">
          ${
            filteredItems.length === 0
              ? `<p>No ingredients found.</p>`
              : filteredItems.map(item => `
                <div class="effect-result-row collection-result-row">
                  <span>${escapeHTML(item.name)}</span>
                  <span class="collection-tags">
                    ${getIngredientCollectionTagHTML(item)}
                  </span>
                </div>
              `).join("")
          }
        </div>
      </div>
    </section>
  `;

  const filterSelect = document.getElementById("collectionFilterSelect");

  if (filterSelect) {
    filterSelect.value = currentCollectionFilter;

    filterSelect.addEventListener("change", event => {
      currentCollectionFilter = event.target.value;
      renderIngredientCollectionPage();
    });
  }
}