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

        <button type="button" class="toc-entry" data-spread="1" data-side="left">
          <span class="toc-title">Potion Builder</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">3</span>
        </button>

        <button type="button" class="toc-entry" data-spread="1" data-side="right">
          <span class="toc-title">Potion Database</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">4</span>
        </button>

        <button type="button" class="toc-entry" data-spread="2" data-side="left">
          <span class="toc-title">Ingredient Lookup</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">5</span>
        </button>

        <button type="button" class="toc-entry" data-spread="2" data-side="right">
          <span class="toc-title">Effect Lookup</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">6</span>
        </button>

        <button type="button" class="toc-entry" data-spread="3" data-side="left">
          <span class="toc-title">Witcher's Consumables</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">7</span>
        </button>

        <button type="button" class="toc-entry" data-spread="3" data-side="right">
          <span class="toc-title">Ingredients to Collect</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">8</span>
        </button>

        <button type="button" class="toc-entry" data-spread="4" data-side="left">
          <span class="toc-title">Extra Tips</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">9</span>
        </button>

        <button type="button" class="toc-entry" data-spread="4" data-side="right">
          <span class="toc-title">Changelog</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">10</span>
        </button>

        <p class="toc-footer-note">Tap an entry to navigate</p>

        <div class="toc-version">
          Built for <strong>LoreRim 4.5.3</strong>
        </div>
      </div>
    `,

    right: `
      <div class="acknowledgements-page">
        <h2>Acknowledgements</h2>
        <div class="acknowledgements-card">
          <div class="acknowledgement-title">✦ Special Thanks ✦</div>
          <p>A huge thank you to <strong>Biggie</strong> and the entire team for creating this incredible modlist and for everything you’ve done for the community.</p>
          <p>To <strong>Minstrel</strong>, whose original Alchemy Guidebook on Discord sparked my interest in this project.</p>
          <p>To <strong>Simon</strong>, for helping me get started over a year ago.</p>
          <p>To <strong>Entaro</strong>, for the Witcher Trait explanation.</p>
          <p>And to <strong>Stokes</strong> and <strong>GotSomeTuna</strong>, whose builds gave me ideas and inspiration.</p>
          <div class="ack-divider"></div>
          <p class="ack-footer">Appreciate everyone who shared builds, ideas, and way too much alchemy knowledge.</p>
        </div>
      </div>
    `
  },

  { left: ``, right: `` },

  { left: ``, right: `` },

  {
    left: `<div id="witcherConsumablesPage"></div>`,
    right: `<div id="ingredientCollectionPage"></div>`
  },

  {
    left: `
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
    `,

    right: `
      <section class="changelog-page">
        <h2>Changelog</h2>

        <div class="changelog-list">

          <div class="changelog-entry changelog-version">
            <h3>LoreRim 4.5.3</h3>
          </div>

          <div class="changelog-entry">
            <h4>Current Build</h4>
            <ul>
              <li>Potion Builder</li>
              <li>Potion Database</li>
              <li>Ingredient Lookup</li>
              <li>Effect Lookup</li>
              <li>Witcher Consumables</li>
              <li>Ingredients to Collect</li>
            </ul>
          </div>

          <div class="changelog-entry">
            <h4>Recent UI Work</h4>
            <ul>
              <li>Rebuilt page 8 as a collection list</li>
              <li>Added Witcher ingredient tracking</li>
              <li>Added Potion/Witcher filters</li>
              <li>Improved mobile and scroll behavior</li>
            </ul>
          </div>

          <div class="changelog-entry">
            <h4>Coming Next</h4>
            <ul>
              <li>LoreRim 5.0 data migration</li>
              <li>Version tracking for saved potions</li>
              <li>More trait and optimization notes</li>
            </ul>
          </div>

        </div>
      </section>
      `,
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