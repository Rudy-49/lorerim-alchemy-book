let currentMobileSide = "left";

// =========================
// MOBILE CHECK
// =========================
function isMobileView() {
  return window.innerWidth <= 600;
}


// =========================
// PAGE / SPREAD RENDERING
// =========================
function renderSpread() {
  const spread = spreads[currentSpread];

  if (isMobileView()) {
    leftPageContent.innerHTML = currentMobileSide === "right"
      ? spread.right
      : spread.left;

    rightPageContent.innerHTML = "";
  } else {
    leftPageContent.innerHTML = spread.left;
    rightPageContent.innerHTML = spread.right;
  }

  renderSpecialPages();
  bindTableOfContents();
  updateNavigationButtons();
}


// =========================
// SPECIAL PAGE RENDERING
// =========================
function renderSpecialPages() {
  if (isMobileView()) {
    if (currentSpread === 1 && currentMobileSide === "left") {
      renderPotionBuilderPage();
    } else if (currentSpread === 1 && currentMobileSide === "right") {
      renderPotionDatabasePage();
    } else if (currentSpread === 2 && currentMobileSide === "left") {
      renderIngredientLookupPage();
    } else if (currentSpread === 2 && currentMobileSide === "right") {
      renderEffectLookupPage();
    } else if (currentSpread === 3 && currentMobileSide === "left") {
      renderWitcherConsumablesPage();
    }

    return;
  }

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

      if (isMobileView()) {
        currentMobileSide = button.dataset.side || "left";
      } else {
        currentMobileSide = "left";
      }

      renderSpread();
    });
  });
}

// =========================
// NAV BUTTON STATES
// =========================
function updateNavigationButtons() {
  prevPageButton.querySelector("span").textContent =
    currentSpread === 0 && currentMobileSide === "left" ? "⤺" : "‹";

  nextPageButton.disabled =
    currentSpread === spreads.length - 1 && currentMobileSide === "right";
}


// =========================
// BOOK OPEN / CLOSE
// =========================
async function openBook() {
  book.classList.remove("closed");
  book.classList.add("open");

  await loadAlchemyData();

  currentSpread = 0;
  currentMobileSide = "left";
  renderSpread();
}

function closeBook() {
  book.classList.remove("open");
  book.classList.add("closed");

  currentSpread = 0;
  currentMobileSide = "left";
  isTurningPage = false;
}


// =========================
// PAGE TURNING
// =========================
function nextSpread() {
  if (isTurningPage) return;

  if (isMobileView()) {
    if (currentMobileSide === "left") {
      currentMobileSide = "right";
      renderSpread();
      return;
    }

    if (currentSpread >= spreads.length - 1) return;

    currentSpread++;
    currentMobileSide = "left";
    renderSpread();
    return;
  }

  if (currentSpread >= spreads.length - 1) return;

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

  if (isMobileView()) {
    if (currentSpread === 0 && currentMobileSide === "left") {
      closeBook();
      return;
    }

    if (currentMobileSide === "right") {
      currentMobileSide = "left";
      renderSpread();
      return;
    }

    currentSpread--;
    currentMobileSide = "right";
    renderSpread();
    return;
  }

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