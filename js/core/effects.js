// =========================
// SHARED EFFECT HELPERS
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