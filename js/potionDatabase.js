// =========================
// DELETE / UNDO STATE
// =========================
let lastDeletedPotions = [];
let undoDeleteTimer = null;
let currentDatabaseFilter = "all";


// =========================
// SELECTION HELPERS
// =========================
function getSelectedPotionIds() {
  return Array.from(
    document.querySelectorAll(".potion-select-checkbox:checked")
  ).map(checkbox => checkbox.dataset.id);
}

function toggleSelectAllPotions() {
  const checkboxes = Array.from(
    document.querySelectorAll(".potion-select-checkbox")
  );

  if (checkboxes.length === 0) return;

  const allSelected = checkboxes.every(checkbox => checkbox.checked);

  checkboxes.forEach(checkbox => {
    checkbox.checked = !allSelected;
  });

  const selectAllBtn = document.getElementById("selectAllPotionsBtn");
  if (selectAllBtn) {
    selectAllBtn.textContent = allSelected ? "Select All" : "Unselect All";
  }
}


// =========================
// DELETE POTIONS
// =========================
function deleteSelectedPotions() {
  const selectedIds = getSelectedPotionIds();

  if (selectedIds.length === 0) {
    alert("Select at least one potion to delete.");
    return;
  }

  const confirmDelete = confirm(
    `Delete ${selectedIds.length} selected potion${selectedIds.length === 1 ? "" : "s"}?`
  );

  if (!confirmDelete) return;

  const potions = getSavedPotions();

  lastDeletedPotions = potions.filter(potion =>
    selectedIds.includes(String(potion.id))
  );

  const remainingPotions = potions.filter(potion =>
    !selectedIds.includes(String(potion.id))
  );

  savePotionsToStorage(remainingPotions);
  renderPotionDatabasePage();
  showUndoDeleteToast(selectedIds.length);
}

function showUndoDeleteToast(count) {
  const existingToast = document.getElementById("undoDeleteToast");
  if (existingToast) existingToast.remove();

  if (undoDeleteTimer) clearTimeout(undoDeleteTimer);

  const toast = document.createElement("div");
  toast.id = "undoDeleteToast";
  toast.className = "undo-delete-toast";

  toast.innerHTML = `
    <span>Deleted ${count} potion${count === 1 ? "" : "s"}.</span>
    <button id="undoDeleteBtn" type="button">Undo</button>
  `;

  document.querySelector(".potion-database-panel").appendChild(toast);
  document.getElementById("undoDeleteBtn")?.addEventListener("click", undoDeletePotions);

  undoDeleteTimer = setTimeout(() => {
    toast.remove();
    lastDeletedPotions = [];
    undoDeleteTimer = null;
  }, 10000);
}

function undoDeletePotions() {
  if (lastDeletedPotions.length === 0) return;

  const currentPotions = getSavedPotions();

  savePotionsToStorage([...lastDeletedPotions, ...currentPotions]);
  lastDeletedPotions = [];

  if (undoDeleteTimer) {
    clearTimeout(undoDeleteTimer);
    undoDeleteTimer = null;
  }

  document.getElementById("undoDeleteToast")?.remove();
  renderPotionDatabasePage();
}


// =========================
// IMPORT / EXPORT
// =========================
function exportPotionsJSON() {
  const potions = getSavedPotions();

  if (potions.length === 0) {
    alert("No saved potions to export.");
    return;
  }

  const selectedIds = getSelectedPotionIds();

  if (selectedIds.length === 0) {
    alert("Select at least one potion to export.");
    return;
  }

  const potionsToExport = potions.filter(potion =>
    selectedIds.includes(String(potion.id))
  );

  if (potionsToExport.length === 0) {
    alert("No selected potions found.");
    return;
  }

  const fileName = prompt(
    "Name your export file:",
    "lorerim-alchemy-potions"
  );

  if (!fileName) return;

  const exportData = {
    app: "LoreRim Alchemy Book",
    version: 1,
    count: potionsToExport.length,

    potions: potionsToExport.map(potion => ({
      id: potion.id,
      name: potion.name,
      type: potion.type,
      ingredients: potion.ingredients,
      notes: potion.notes || "",
      favorite: potion.favorite || false
    }))
  };

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function importPotionsJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);

      if (!Array.isArray(importedData.potions)) {
        alert("Invalid file. No potion list found.");
        return;
      }

      const currentPotions = getSavedPotions();
      const existingKeys = new Set(currentPotions.map(getPotionIngredientKey));

      const newPotions = [];
      let skippedCount = 0;

      importedData.potions.forEach(potion => {
        const normalizedPotion = {
          id: Date.now() + Math.floor(Math.random() * 1000000),
          name: potion.name || "Unnamed Potion",
          type: potion.type || "Potion",
          ingredients: Array.isArray(potion.ingredients) ? potion.ingredients : [],
          notes: potion.notes || "",
          favorite: Boolean(potion.favorite)
        };

        const key = getPotionIngredientKey(normalizedPotion);

        if (existingKeys.has(key)) {
          skippedCount++;
          return;
        }

        existingKeys.add(key);
        newPotions.push(normalizedPotion);
      });

      savePotionsToStorage([...newPotions, ...currentPotions]);
      renderPotionDatabasePage();

      alert(`${newPotions.length} potion(s) imported. ${skippedCount} duplicate(s) skipped.`);
    } catch (error) {
      alert("Could not import this file.");
      console.error(error);
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}


// =========================
// FILTERING / FAVORITES
// =========================
function getPotionType(potion) {
  if (potion.type) return potion.type;

  return potion.name.toLowerCase().includes("poison")
    ? "Poison"
    : "Potion";
}

function getFilteredPotions(filterOverride = null) {
  const potions = getSavedPotions();
  const searchInput = document.getElementById("potionDatabaseSearch");

  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const filterValue = filterOverride || currentDatabaseFilter || "all";

  return potions
    .filter(potion => {
      const matchesSearch =
        potion.name.toLowerCase().includes(searchText) ||
        potion.ingredients.join(" ").toLowerCase().includes(searchText) ||
        (potion.notes || "").toLowerCase().includes(searchText);

      const matchesFilter =
        filterValue === "all" ||
        (filterValue === "favorites" && potion.favorite) ||
        getPotionType(potion) === filterValue;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => Number(b.favorite === true) - Number(a.favorite === true));
}

function toggleFavoritePotion(potionId) {
  const potions = getSavedPotions();

  const updatedPotions = potions.map(potion => {
    if (String(potion.id) !== String(potionId)) return potion;

    return {
      ...potion,
      favorite: !potion.favorite
    };
  });

  savePotionsToStorage(updatedPotions);
  updatePotionList();
}


// =========================
// POTION LIST RENDER
// =========================
function updatePotionList(filterOverride = null) {
  const listContainer = document.getElementById("potionDatabaseList");
  if (!listContainer) return;

  const potions = getSavedPotions();
  const filtered = getFilteredPotions(filterOverride);

  updateDatabaseCounts();

  if (potions.length === 0) {
    listContainer.innerHTML = `
      <div class="database-empty-state">
        <strong>No saved potions yet</strong>
        <span>Saved recipes will appear here.</span>
      </div>
    `;
    return;
  }

  function updateDatabaseCounts() {
  const counts = document.getElementById("databaseCounts");
  if (!counts) return;

  const potions = getSavedPotions();
  const favoriteCount = potions.filter(potion => potion.favorite).length;

  counts.innerHTML = `
    <div>Saved Potions: <strong>${potions.length}</strong></div>
    <div>Favorites: <strong>${favoriteCount}</strong></div>
  `;
}

  listContainer.innerHTML = filtered.length === 0
    ? `
      <div class="database-empty-state">
        <strong>No matching potions found</strong>
        <span>Try adjusting your search or filter.</span>
      </div>
    `
    : filtered.map(potion => `
      <div class="saved-potion-card ${potion.favorite ? "favorited" : ""}" data-id="${potion.id}">
        <input
          type="checkbox"
          class="potion-select-checkbox"
          data-id="${potion.id}"
          title="Select potion"
        />

        <button
          class="favorite-potion-btn ${potion.favorite ? "favorited" : ""}"
          type="button"
          data-id="${potion.id}"
          title="Favorite">
          ${potion.favorite ? "★" : "☆"}
        </button>

        <div class="saved-potion-content">
          <h3>${escapeHTML(potion.name)}</h3>
          <p><strong>Ingredients:</strong> ${potion.ingredients.map(escapeHTML).join(", ")}</p>
          ${potion.notes ? `<p><strong>Notes:</strong> ${escapeHTML(potion.notes)}</p>` : ""}
        </div>
      </div>
    `).join("");

  document.querySelectorAll(".favorite-potion-btn").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavoritePotion(event.currentTarget.dataset.id);
    });
  });
}


// =========================
// DATABASE PAGE RENDER
// =========================
function renderPotionDatabasePage() {
  const targetPage = isMobileView() ? leftPageContent : rightPageContent;

  targetPage.innerHTML = `
    <section class="lookup-panel potion-database-panel">
      <h2>Potion Database</h2>

      <div class="database-search-row">
        <input
          id="potionDatabaseSearch"
          class="book-input"
          type="text"
          placeholder="Search saved potions..."
          autocomplete="off"
        />
      </div>

      <div class="database-toolbar-row">
        <div class="database-toolbar-left">
          <select id="databaseFilterSelect" class="database-filter-select">
            <option value="all">All</option>
            <option value="favorites">Favorites</option>
            <option value="Potion">Potions</option>
            <option value="Poison">Poisons</option>
          </select>

          <button id="selectAllPotionsBtn" type="button">Select All</button>
        </div>

        <div id="databaseCounts" class="database-counts"></div>

        <div class="database-toolbar-right">
          <button id="exportPotionsBtn" type="button">Export</button>
          <button id="importPotionsBtn" type="button">Import</button>
          <input id="importPotionsInput" type="file" accept=".json" hidden />
          <button id="deleteSelectedPotionsBtn" type="button">Delete</button>
        </div>
      </div>

      <div id="potionDatabaseList" class="potion-database-list"></div>
    </section>
  `;

  document.getElementById("potionDatabaseSearch")
    ?.addEventListener("input", updatePotionList);

  const filterSelect = document.getElementById("databaseFilterSelect");

  if (filterSelect) {
    filterSelect.value = currentDatabaseFilter;

    filterSelect.addEventListener("change", event => {
      currentDatabaseFilter = event.target.value;
      updatePotionList(currentDatabaseFilter);
    });

    filterSelect.addEventListener("input", event => {
      currentDatabaseFilter = event.target.value;
      updatePotionList(currentDatabaseFilter);
    });
  }

  document.getElementById("selectAllPotionsBtn")
    ?.addEventListener("click", toggleSelectAllPotions);

  document.getElementById("deleteSelectedPotionsBtn")
    ?.addEventListener("click", deleteSelectedPotions);

  document.getElementById("exportPotionsBtn")
    ?.addEventListener("click", exportPotionsJSON);

  const importBtn = document.getElementById("importPotionsBtn");
  const importInput = document.getElementById("importPotionsInput");

  importBtn?.addEventListener("click", () => {
    importInput?.click();
  });

  importInput?.addEventListener("change", importPotionsJSON);

  updatePotionList();
}