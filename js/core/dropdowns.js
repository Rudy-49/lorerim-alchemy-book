// =========================
// SHARED SEARCH DROPDOWN
// =========================

function createSearchDropdown({
  input,
  dropdown,
  items,
  getLabel,
  onSelect,
  onEmpty,
  scrollTargetSelector = null
}) {
  if (!input || !dropdown) return;

  function showDropdown(filterText = "") {
    const search = filterText.toLowerCase();

    dropdown.innerHTML = items
      .filter(item =>
        getLabel(item).toLowerCase().includes(search)
      )
      .map(item => `
        <button
          class="dropdown-option"
          type="button"
          data-name="${escapeHTML(getLabel(item))}">
          ${escapeHTML(getLabel(item))}
        </button>
      `)
      .join("");

    dropdown.classList.add("show");
  }

  function hideDropdown() {
    dropdown.classList.remove("show");
    document.body.classList.remove("keyboard-open");
  }

  function scrollIntoViewSafe() {
    if (!scrollTargetSelector) return;

    setTimeout(() => {
      input.closest(scrollTargetSelector)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 350);
  }

  // =========================
  // INPUT EVENTS
  // =========================

  input.addEventListener("focus", () => {
    scrollIntoViewSafe();
    input.select();
    showDropdown("");
  });

  input.addEventListener("click", () => {
    input.select();
    showDropdown(input.value);
  });

  input.addEventListener("input", () => {
    const value = input.value.trim();

    showDropdown(value);

    if (value === "") {
      onEmpty?.();
      return;
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(hideDropdown, 200);
  });

  // =========================
  // MOBILE SAFE POINTER EVENTS
  // =========================

  let pointerStartY = 0;
  let pointerStartX = 0;

  dropdown.addEventListener("pointerdown", event => {
    pointerStartY = event.clientY;
    pointerStartX = event.clientX;
  });

  dropdown.addEventListener("pointerup", event => {
    const option = event.target.closest(".dropdown-option");

    if (!option) return;

    const movedY = Math.abs(event.clientY - pointerStartY);
    const movedX = Math.abs(event.clientX - pointerStartX);

    // allow scrolling without selecting
    if (movedY > 10 || movedX > 10) return;

    event.preventDefault();

    input.value = option.dataset.name;

    hideDropdown();

    setTimeout(() => {
      if (scrollTargetSelector) {
        input.closest(scrollTargetSelector)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 100);

    onSelect(option.dataset.name);
  });

  // =========================
  // OUTSIDE CLICK
  // =========================

  document.addEventListener("click", event => {
    if (!event.target.closest(".custom-dropdown")) {
      hideDropdown();
    }
  });

  return {
    showDropdown,
    hideDropdown
  };
}