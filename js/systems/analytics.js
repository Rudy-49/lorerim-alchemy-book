// =========================
// ANALYTICS
// GoatCounter feature/event tracking
// =========================

function getAnalyticsPath(label, category) {
  return `/${category}/${String(label)
    .trim()
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("'", "")}`;
}

function trackFeatureOpen(featureName) {
  if (!featureName) return;

  if (!window.goatcounter || typeof window.goatcounter.count !== "function") {
    return;
  }

  window.goatcounter.count({
    path: getAnalyticsPath(featureName, "feature"),
    title: String(featureName).trim(),
    event: true
  });
}

function trackAction(actionName) {
  if (!actionName) return;

  if (!window.goatcounter || typeof window.goatcounter.count !== "function") {
    return;
  }

  window.goatcounter.count({
    path: getAnalyticsPath(actionName, "action"),
    title: String(actionName).trim(),
    event: true
  });
}