// =========================
// STORAGE
// Handles localStorage read/write
// for saved potion data
// =========================

function getSavedPotions() {
  try {
    return JSON.parse(
      localStorage.getItem("potionDatabase")
    ) || [];
  } catch {
    return [];
  }
}

function savePotionsToStorage(potions) {
  localStorage.setItem(
    "potionDatabase",
    JSON.stringify(potions)
  );
}

function getTrackedWitcherIngredients() {
  try {
    return JSON.parse(
      localStorage.getItem("witcherTrackedIngredients")
    ) || [];
  } catch {
    return [];
  }
}

function saveTrackedWitcherIngredients(ingredientNames) {
  localStorage.setItem(
    "witcherTrackedIngredients",
    JSON.stringify(ingredientNames)
  );
}

function isWitcherIngredientTracked(ingredientName) {
  return getTrackedWitcherIngredients()
    .some(name => name.toLowerCase() === ingredientName.toLowerCase());
}

function toggleTrackedWitcherIngredient(ingredientName) {
  const tracked = getTrackedWitcherIngredients();
  const exists = tracked.some(
    name => name.toLowerCase() === ingredientName.toLowerCase()
  );

  const updated = exists
    ? tracked.filter(name => name.toLowerCase() !== ingredientName.toLowerCase())
    : [...tracked, ingredientName].sort((a, b) => a.localeCompare(b));

  saveTrackedWitcherIngredients(updated);
}