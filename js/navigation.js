// =========================
// SPREAD RENDERING
// =========================
function renderSpread() {
  const spread = spreads[currentSpread];

  leftPageContent.innerHTML = spread.left;
  rightPageContent.innerHTML = spread.right;

  renderSpecialPages();
  bindTableOfContents();
  updateNavigationButtons();
}


// =========================
// SPECIAL PAGE RENDERING
// =========================
function renderSpecialPages() {
  if (currentSpread === 1) {
    renderPotionBuilderPage();
    renderPotionDatabasePage();
  } else if (currentSpread === 2) {
    renderIngredientLookupPage();
    renderEffectLookupPage();
  } else if (currentSpread === 3) {
    renderWitcherConsumablesPage();
  }
}


// =========================
// TABLE OF CONTENTS
// =========================
function bindTableOfContents() {
  document.querySelectorAll(".toc-entry").forEach(button => {
    button.addEventListener("click", () => {
      currentSpread = Number(button.dataset.spread);
      renderSpread();
    });
  });
}


// =========================
// NAV BUTTON STATES
// =========================
function updateNavigationButtons() {
  prevPageButton.querySelector("span").textContent =
    currentSpread === 0 ? "⤺" : "‹";

  nextPageButton.disabled =
    currentSpread === spreads.length - 1;
}


// =========================
// BOOK OPEN / CLOSE
// =========================
async function openBook() {
  book.classList.remove("closed");
  book.classList.add("open");

  await loadAlchemyData();

  currentSpread = 0;
  renderSpread();
}

function closeBook() {
  book.classList.remove("open");
  book.classList.add("closed");

  currentSpread = 0;
  isTurningPage = false;
}


// =========================
// PAGE TURNING
// =========================
function nextSpread() {
  if (isTurningPage || currentSpread >= spreads.length - 1) return;

  isTurningPage = true;

  flipOverlay.classList.remove("flip-prev");
  flipOverlay.classList.add("flip-next");

  setTimeout(() => {
    currentSpread++;
    renderSpread();
  }, 350);

  setTimeout(() => {
    flipOverlay.classList.remove("flip-next");
    isTurningPage = false;
  }, 700);
}

function previousSpread() {
  if (isTurningPage) return;

  if (currentSpread === 0) {
    closeBook();
    return;
  }

  isTurningPage = true;

  flipOverlay.classList.remove("flip-next");
  flipOverlay.classList.add("flip-prev");

  setTimeout(() => {
    currentSpread--;
    renderSpread();
  }, 350);

  setTimeout(() => {
    flipOverlay.classList.remove("flip-prev");
    isTurningPage = false;
  }, 700);
}