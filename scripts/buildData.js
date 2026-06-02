const fs = require("fs");

// ====== FILE PATHS ======
const INPUT = "data/raw/data.csv";
const OUTPUT_INGREDIENTS = "data/processed/ingredients.json";
const OUTPUT_DUPES = "data/processed/duplicateReview.csv";

// ====== LOAD CSV ======
const raw = fs.readFileSync(INPUT, "utf-8");
const lines = raw.split(/\r?\n/).filter(l => l.trim());

// remove header only if one exists
if (lines[0].toLowerCase().includes("ingredient_name")) {
  lines.shift();
}

// ====== PARSER ======
function parse(line) {
  return line
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map(p => p.replace(/^"|"$/g, "").trim());
}

// ====== IMAGE KEY HELPER ======
function createImageKey(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// ====== GROUP BY INGREDIENT ======
const ingredientsMap = {};

lines.forEach(line => {
  const parts = parse(line);

  const [
    ingredient_id,
    ingredient_name,
    ingredient_editor_id,
    ingredient_origin_plugin,
    ingredient_winning_plugin,
    ingredient_fixed_form_id,
    ingredient_load_order_form_id,
    effect_id,
    effect_name,
    effect_editor_id,
    effect_origin_plugin,
    effect_winning_plugin,
    effect_fixed_form_id,
    effect_load_order_form_id,
    effect_type,
    effect_order,
    magnitude,
    duration,
    weight,
    value
  ] = parts;

  const identityKey = `${ingredient_origin_plugin}|${ingredient_fixed_form_id}`;

  if (!ingredientsMap[identityKey]) {
    ingredientsMap[identityKey] = {
      identityKey,
      name: ingredient_name,
      editorId: ingredient_editor_id,
      plugin: ingredient_origin_plugin,
      fixedFormId: ingredient_fixed_form_id,
      imageKey: createImageKey(ingredient_name),
      weight,
      value,
      effects: []
    };
  }

  ingredientsMap[identityKey].effects.push({
    name: effect_name,
    type: effect_type,
    magnitude,
    duration,
    order: Number(effect_order)
  });
});

// ====== CLEAN + SORT EFFECTS ======
const ingredients = Object.values(ingredientsMap).map(ing => {
  ing.effects.sort((a, b) => a.order - b.order);
  return ing;
});

// ====== DUPLICATE DETECTION ======
// same name + same 4 effects + different identityKey

const signatureMap = {};

ingredients.forEach(ing => {
  const effectSignature = ing.effects
    .map(e => e.name.toLowerCase())
    .sort()
    .join("|");

  const key = `${ing.name.toLowerCase()}||${effectSignature}`;

  if (!signatureMap[key]) {
    signatureMap[key] = [];
  }

  signatureMap[key].push(ing);
});

// find duplicates
const duplicateGroups = Object.values(signatureMap)
  .filter(group => group.length > 1);

// ====== EXPORT DUPLICATE REVIEW ======
const dupeOutput = [];

dupeOutput.push("IngredientName,Plugin,FormID,EffectSignature,ReviewAction");

duplicateGroups.forEach(group => {
  group.forEach(ing => {
    const signature = ing.effects.map(e => e.name).join(" | ");

    dupeOutput.push([
      `"${ing.name}"`,
      `"${ing.plugin}"`,
      `"${ing.fixedFormId}"`,
      `"${signature}"`,
      ""
    ].join(","));
  });
});

fs.writeFileSync(OUTPUT_DUPES, dupeOutput.join("\n"), "utf-8");

// ====== EXPORT INGREDIENTS JSON ======
fs.writeFileSync(
  OUTPUT_INGREDIENTS,
  JSON.stringify(ingredients, null, 2),
  "utf-8"
);

console.log("✅ Build complete");
console.log(`Ingredients: ${ingredients.length}`);
console.log(`Duplicate groups: ${duplicateGroups.length}`);