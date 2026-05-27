// =========================
// HTML SANITIZATION
// Prevents injected HTML from rendering
// =========================
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================
// NUMBER FORMATTING
// Formats ingredient values while removing
// unnecessary trailing decimals
// =========================
function formatIngredientNumber(value) {
  if (value == null || value === "") return "Unknown";

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return parseFloat(number.toFixed(4)).toString();
}


// =========================
// POTION IDENTIFIER
// Creates a normalized ingredient key used
// for comparisons, storage, and duplicates
// =========================
function getPotionIngredientKey(potion) {
  return [...potion.ingredients]
    .map(name => name.toLowerCase().trim())
    .sort()
    .join("|");
}