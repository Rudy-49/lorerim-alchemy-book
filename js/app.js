// =========================
// DOM REFERENCES
// =========================
const book = document.getElementById("book");
const coverButton = document.getElementById("coverButton");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const flipOverlay = document.getElementById("pageFlipOverlay");

const leftPageContent = document.getElementById("leftPageContent");
const rightPageContent = document.getElementById("rightPageContent");


// =========================
// GLOBAL STATE
// =========================
let currentSpread = 0;
let isTurningPage = false;


// =========================
// BOOK SPREADS
// =========================
const spreads = [
  {
    left: `
      <div class="toc-page">
        <h2>Table of Contents</h2>

        <button type="button" class="toc-entry" data-spread="1">
          <span class="toc-title">Potion Builder</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">3</span>
        </button>

        <button type="button" class="toc-entry" data-spread="1">
          <span class="toc-title">Potion Database</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">4</span>
        </button>

        <button type="button" class="toc-entry" data-spread="2">
          <span class="toc-title">Ingredient Lookup</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">5</span>
        </button>

        <button type="button" class="toc-entry" data-spread="2">
          <span class="toc-title">Effect Lookup</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">6</span>
        </button>

        <button type="button" class="toc-entry" data-spread="3">
          <span class="toc-title">Witcher's Consumables</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">7</span>
        </button>

        <button type="button" class="toc-entry" data-spread="3">
          <span class="toc-title">Extra Tips</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">8</span>
        </button>

        <div class="toc-version">
          Built for <strong>LoreRim 4.5.3</strong>
        </div>
        
      </div>
    `,
    right: `
    <div class="acknowledgements-page">

      <h2>Acknowledgements</h2>

      <div class="acknowledgements-card">

        <div class="acknowledgement-title">
          ✦ Special Thanks ✦
        </div>

        <p>
          A huge thank you to <strong>Biggie</strong> and the entire team
          for creating this incredible modlist and for everything
          you’ve done for the community.
        </p>

        <p>
          To <strong>Minstrel</strong>, whose original Alchemy Guidebook
          on Discord sparked my interest in this project.
        </p>

        <p>
          To <strong>Simon</strong>, for helping me get started over
          a year ago. I’d probably still be manually filtering
          ingredients without your help.
        </p>

        <p>
          To <strong>Entaro</strong>, for the Witcher Trait explanation —
          genuinely one of the most goated traits and an insane find.
        </p>

        <p>
          And to <strong>Stokes</strong> and
          <strong>GotSomeTuna</strong>, whose builds gave me ideas,
          inspiration, and far too many hours experimenting.
        </p>

        <div class="ack-divider"></div>

        <p class="ack-footer">
          Appreciate everyone who shared builds, ideas,
          and way too much alchemy knowledge.
        </p>

      </div>
    </div>
    `
  },
  { left: ``, right: `` },
  { left: ``, right: `` },
  {
    left: `<div id="witcherConsumablesPage"></div>`,
    right: `
      <h2>Extra Tips</h2>

      <p>
        This section will continue to grow alongside
        <strong>LoreRim 5.0</strong> as new discoveries,
        mechanics, and useful notes are tested.
      </p>

      <p>
        Expect updates for notable player homes,
        static alchemy boosting gear, potion potency
        multipliers, and hidden interactions worth knowing.
      </p>

      <p>
        Other pages may include trait combinations, and
        anything else discovered through far too much experimentation.
      </p>

      <p style="margin-top:1.5rem; font-style:italic; opacity:.8;">
        More pages will be added as the community discovers them.
      </p>
    `
  }
];


// =========================
// ALCHEMY DATA
// =========================
let ingredients = [];
let effects = [];

async function loadAlchemyData() {
  const response = await fetch("data/processed/ingredients_clean.json");

  if (!response.ok) {
    throw new Error("Could not load ingredients_clean.json");
  }

  ingredients = await response.json();

  effects = [...new Set(
    ingredients.flatMap(ingredient => ingredient.effects.map(effect => effect.name))
  )].sort();

  console.log("Ingredients loaded:", ingredients.length);
  console.log("Effects loaded:", effects.length);
}


// =========================
// EVENTS
// =========================
coverButton.addEventListener("click", openBook);
nextPageButton.addEventListener("click", nextSpread);
prevPageButton.addEventListener("click", previousSpread);