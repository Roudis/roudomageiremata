/**
 * The recipe editor page. Plain JavaScript without a build step: server.ts
 * serves this file as it is. The form lives in `app.form`; saving sends it to
 * the server, which checks it with the site's own rules and writes the files.
 * The checks here only catch the common mistakes early, in friendlier words.
 */
import { RECIPE_ID, slugify } from "./slug.js";

/** Photos are resized so their longer side is at most this many pixels, then saved as JPEG. */
const MAX_PHOTO_EDGE = 1600;
const PHOTO_QUALITY = 0.86;
/** The chapter a recipe without one is listed under, as CATEGORY_FALLBACK in lib/recipe-view.ts. */
const FALLBACK_CATEGORY = "Άλλο";
/** A story's recipe link, as in lib/story-text.ts. */
const MENTION = /\[\[([a-z0-9]+(?:-[a-z0-9]+)*)(?:\|([^[\]\n]*))?\]\]/g;

/** Which section of the form a validation message's field belongs to. */
const SECTION_OF_FIELD = {
  title: "basics",
  id: "basics",
  description: "basics",
  category: "basics",
  tags: "basics",
  prepTime: "basics",
  cookTime: "basics",
  servings: "basics",
  imageUrl: "photo",
  ingredients: "ingredients",
  steps: "steps",
  preparations: "preparations",
  memory: "story",
};

const ICONS = {
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  photo:
    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  story: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  alert:
    '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
};

// ── State ─────────────────────────────────────────────────────────────────

const app = {
  /** From GET /api/state: the recipes for the list and the choices for the form. */
  meta: undefined,
  /** "new" for a recipe not saved yet, "edit" for one on disk. */
  mode: "new",
  id: "",
  /** True once the id was typed by hand, so the title stops filling it in. */
  idEdited: false,
  /** The file's version on disk, so a save can tell whether it changed meanwhile. */
  version: undefined,
  /** The languages the recipe is translated into. */
  translations: [],
  updatedAt: undefined,
  savedHasStory: false,
  form: emptyForm(),
  /** { kind: "none" } | { kind: "busy" } | { kind: "saved", url } | { kind: "new", dataUrl, width, height, bytes, original } */
  photo: { kind: "none" },
  /** The photo on disk when the recipe was opened, to go back to. */
  savedPhoto: { kind: "none" },
  photoError: "",
  /** What was on disk when the recipe was opened, to tell whether anything changed. */
  snapshot: "",
  busy: false,
  /** Problems that stopped a save: [{ field, message }]. */
  problems: [],
  /** An error that isn't about a field, such as the file having changed on disk. */
  error: undefined,
  /** Remarks from the last save. */
  notes: [],
};

function emptyForm() {
  return {
    title: "",
    description: "",
    category: "",
    tags: [],
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [""],
    steps: [""],
    preparations: [],
    hasStory: false,
    memory: { title: "", story: "", date: "" },
  };
}

function formFromRecipe(recipe) {
  const list = (items) => (Array.isArray(items) && items.length > 0 ? [...items] : [""]);
  return {
    title: recipe.title ?? "",
    description: recipe.description ?? "",
    category: recipe.category ?? "",
    tags: Array.isArray(recipe.tags) ? [...recipe.tags] : [],
    prepTime: recipe.prepTime ?? "",
    cookTime: recipe.cookTime ?? "",
    servings: recipe.servings === undefined ? "" : String(recipe.servings),
    ingredients: list(recipe.ingredients),
    steps: list(recipe.steps),
    preparations: (recipe.preparations ?? []).map((preparation) => ({
      title: preparation.title ?? "",
      steps: list(preparation.steps),
    })),
    hasStory: recipe.memory !== undefined,
    memory: {
      title: recipe.memory?.title ?? "",
      story: recipe.memory?.story ?? "",
      date: recipe.memory?.date ?? "",
    },
  };
}

const oneLine = (text) => text.replace(/\s+/g, " ").trim();
const storyText = (text) =>
  text.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();

/** The form as it is sent to the server: tidied, without empty rows, the tags in the site's order. */
function payloadForm() {
  const form = app.form;
  const lines = (items) => items.map(oneLine).filter(Boolean);
  return {
    title: oneLine(form.title),
    description: oneLine(form.description),
    category: oneLine(form.category),
    tags: app.meta.tags.map((tag) => tag.id).filter((id) => form.tags.includes(id)),
    prepTime: oneLine(form.prepTime),
    cookTime: oneLine(form.cookTime),
    servings: oneLine(form.servings),
    ingredients: lines(form.ingredients),
    steps: lines(form.steps),
    preparations: form.preparations
      .map((preparation) => ({ title: oneLine(preparation.title), steps: lines(preparation.steps) }))
      .filter((preparation) => preparation.title || preparation.steps.length > 0),
    memory: form.hasStory
      ? { title: oneLine(form.memory.title), story: storyText(form.memory.story), date: oneLine(form.memory.date) }
      : null,
  };
}

function snapshot() {
  const photo = app.photo.kind === "new" ? `new:${app.photo.dataUrl.length}` : app.photo.kind;
  return JSON.stringify({ id: app.mode === "new" ? app.id : undefined, form: payloadForm(), photo });
}

/** True when the form differs from what was opened; false before anything is open. */
const isDirty = () => app.snapshot !== "" && snapshot() !== app.snapshot;

// ── DOM helpers ───────────────────────────────────────────────────────────

const $ = (selector) => document.querySelector(selector);

/** The children to render, so `condition && element` can leave something out. */
const present = (children) => children.flat(Infinity).filter((child) => child !== undefined && child !== null && child !== false);

/** An element with attributes, `on…` listeners, and children. `value` and `checked` are set as properties. */
function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2), value);
    else if (key === "class") element.className = value;
    else if (key === "value" || key === "checked") element[key] = value;
    else element.setAttribute(key, value === true ? "" : String(value));
  }
  element.append(...present(children));
  return element;
}

/** Replaces the element's children, leaving out the ones `present` drops. */
function fill(element, ...children) {
  element.replaceChildren(...present(children));
}

function icon(name) {
  const span = h("span", { class: "icon", "aria-hidden": "true" });
  span.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>`;
  return span;
}

function iconButton(name, label, onclick, { disabled = false, danger = false } = {}) {
  return h(
    "button",
    { type: "button", class: `icon-button${danger ? " is-danger" : ""}`, "aria-label": label, title: label, disabled, onclick },
    icon(name),
  );
}

/** A labelled form field. `control` gets the id the label points to. */
function field({ label, optional = false, hint, control, id }) {
  control.id = id;
  return h(
    "div",
    { class: "field" },
    h("label", { class: "field-label", for: id }, label, optional && h("span", { class: "optional" }, " (optional)")),
    control,
    hint,
  );
}

function autoGrow(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
}

function thumb(recipe) {
  return recipe.imageUrl
    ? h("img", { class: "thumb", src: `${recipe.imageUrl}?v=${recipe.version}`, alt: "", loading: "lazy" })
    : h("span", { class: "thumb", "aria-hidden": "true" }, recipe.title.trim().charAt(0) || "·");
}

const searchText = (text) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/ς/g, "σ");

const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const formatTime = (iso) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

let toastTimer;
function toast(message) {
  const element = $("#toast");
  fill(element, icon("check"), message);
  element.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("is-visible"), 3200);
}

async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error ?? `The editor answered ${response.status}.`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// ── Sidebar ───────────────────────────────────────────────────────────────

function renderList() {
  const query = searchText($("#search").value.trim());
  const recipes = app.meta.recipes.filter(
    (recipe) =>
      query === "" ||
      searchText([recipe.title, recipe.id, recipe.category ?? "", recipe.storyTitle ?? ""].join(" ")).includes(query),
  );

  fill($("#recipe-list"),
    ...recipes.map((recipe) => {
      const active = app.mode === "edit" && app.id === recipe.id;
      return h(
        "li",
        {},
        h(
          "button",
          {
            type: "button",
            class: `recipe-item${active ? " is-active" : ""}`,
            "aria-current": active ? "true" : undefined,
            onclick: () => openRecipe(recipe.id),
          },
          thumb(recipe),
          h(
            "span",
            { class: "item-text" },
            h("span", { class: "item-title", lang: "el" }, recipe.title),
            h("span", { class: "item-meta", lang: "el" }, recipe.category ?? FALLBACK_CATEGORY),
          ),
          h(
            "span",
            { class: "item-badges" },
            recipe.hasStory && h("span", { title: `Story: ${recipe.storyTitle}` }, icon("story")),
            recipe.problems.length > 0 &&
              h("span", { class: "is-problem", title: `Needs fixing: ${recipe.problems.join("; ")}` }, icon("alert")),
          ),
        ),
      );
    }),
  );

  const total = app.meta.recipes.length;
  const stories = app.meta.recipes.filter((recipe) => recipe.hasStory).length;
  $("#recipe-count").textContent =
    recipes.length === total
      ? `${total} recipes · ${stories} with a story`
      : `${recipes.length} of ${total} recipes`;
}

// ── Editor ────────────────────────────────────────────────────────────────

/** Re-render functions of the parts of the form that change shape, set as each part is built. */
const refresh = {};

function renderEditor() {
  const scroll = window.scrollY;
  fill($("#editor"),
    h(
      "div",
      { class: "editor-inner" },
      editorHeader(),
      h("div", { id: "notices" }),
      basicsSection(),
      photoSection(),
      listSection({
        key: "ingredients",
        title: "Ingredients",
        intro: "One per row. Press Enter for the next one; paste a whole list into an empty row to split it into rows.",
        items: app.form.ingredients,
        label: "Ingredient",
        addLabel: "Add an ingredient",
        placeholder: "π.χ. 1 κιλό μελιτζάνες",
        bullets: true,
      }),
      listSection({
        key: "steps",
        title: "Steps",
        intro: "One step per row, in order. Press Enter for the next step.",
        items: app.form.steps,
        label: "Step",
        addLabel: "Add a step",
        placeholder: "π.χ. Ψήνουμε τις πατάτες με λίγο λάδι και αλάτι.",
        multiline: true,
      }),
      preparationsSection(),
      storySection(),
      saveBar(),
    ),
  );
  refresh.notices();
  for (const textarea of document.querySelectorAll("#editor textarea")) autoGrow(textarea);
  window.scrollTo(0, scroll);
}

function siteLink(path, label) {
  return h(
    "a",
    { href: `${app.meta.siteUrl}${path}`, target: "_blank", rel: "noreferrer", title: "Opens the site from npm run dev" },
    label,
    icon("external"),
  );
}

function editorHeader() {
  const heading = h("h1", { class: "editor-title", lang: "el" });
  refresh.heading = () => {
    const title = oneLine(app.form.title);
    heading.textContent = title || (app.mode === "new" ? "New recipe" : "Untitled recipe");
    heading.classList.toggle("is-placeholder", title === "");
  };
  refresh.heading();

  const languages = app.translations.map((locale) => app.meta.languages[locale] ?? locale);
  return h(
    "header",
    { class: "editor-header" },
    h("p", { class: "eyebrow" }, app.mode === "new" ? "New recipe" : "Editing a recipe"),
    heading,
    app.mode === "edit" &&
      h(
        "div",
        { class: "editor-meta" },
        h("code", {}, `data/recipes/${app.id}.json`),
        app.updatedAt && h("span", {}, `Updated ${formatTime(app.updatedAt)}`),
        siteLink(`/recipes/${app.id}`, "View recipe"),
        app.savedHasStory && siteLink(`/stories/${app.id}`, "View story"),
      ),
    app.mode === "edit" &&
      h(
        "p",
        { class: "notice notice-plain" },
        languages.length > 0
          ? `Translated into ${languages.join(", ")}. The editor changes only the Greek and keeps these as they are, so after changing the meaning of the Greek, update them too.`
          : "Not translated yet: the other languages show the Greek text with a short notice.",
      ),
  );
}

function sectionCard(key, { title, intro, action, className = "" }, ...children) {
  return h(
    "section",
    { class: `card ${className}`, id: `section-${key}`, "aria-labelledby": `section-${key}-title` },
    h(
      "div",
      { class: "card-header" },
      h("div", {}, h("h2", { id: `section-${key}-title` }, title), intro && h("p", {}, intro)),
      action,
    ),
    ...children,
  );
}

/** Calls `update` and marks the form as changed. */
function onInput(update) {
  return (event) => {
    update(event.target.value, event.target);
    changed();
  };
}

function changed() {
  refresh.heading?.();
  refresh.saveBar?.();
}

function basicsSection() {
  const form = app.form;
  const existingIds = new Set(app.meta.recipes.map((recipe) => recipe.id));

  const idHint = h("p", { class: "hint" });
  const idInput = h("input", {
    type: "text",
    class: "input mono",
    value: app.id,
    readonly: app.mode === "edit",
    spellcheck: "false",
    autocomplete: "off",
    "data-field": "id",
    oninput: onInput((value) => {
      app.id = value.trim();
      app.idEdited = app.id !== slugify(form.title);
      refreshIdHint();
    }),
  });
  function refreshIdHint() {
    idHint.className = "hint";
    if (app.mode === "edit") {
      idHint.textContent = "The id can't change once the recipe exists: other stories link to it.";
    } else if (app.id === "") {
      idHint.textContent = "Filled in from the title. It becomes the address and the file name.";
    } else if (!RECIPE_ID.test(app.id)) {
      idHint.className = "hint is-error";
      idHint.textContent = "Use only lowercase Latin letters, digits, and single hyphens between words.";
    } else if (existingIds.has(app.id)) {
      idHint.className = "hint is-error";
      idHint.textContent = `There is already a recipe called “${app.id}”. Change a word in the id.`;
    } else {
      fill(idHint, "Address ", h("code", {}, `/recipes/${app.id}`), ", file ", h("code", {}, `data/recipes/${app.id}.json`));
    }
  }
  refreshIdHint();

  const titleInput = h("input", {
    type: "text",
    class: "input input-title",
    lang: "el",
    value: form.title,
    placeholder: "π.χ. Η φασολάδα της γιαγιάς",
    autocomplete: "off",
    "data-field": "title",
    oninput: onInput((value) => {
      form.title = value;
      if (app.mode === "new" && !app.idEdited) {
        app.id = slugify(value);
        idInput.value = app.id;
        refreshIdHint();
      }
    }),
  });

  const categoryHint = h("p", { class: "hint" });
  function refreshCategoryHint() {
    const category = oneLine(form.category);
    categoryHint.className = "hint";
    if (category === "") {
      categoryHint.textContent = `Pick one of the family's chapters, or type a new one. Without one, the recipe is listed under “${FALLBACK_CATEGORY}”.`;
    } else if (!app.meta.categories.includes(category)) {
      categoryHint.className = "hint is-new";
      categoryHint.textContent = "A new chapter. The other languages show its Greek name until it is added to data/categories.json.";
    } else {
      categoryHint.textContent = "Pick one of the family's chapters, or type a new one.";
    }
  }
  refreshCategoryHint();

  return sectionCard(
    "basics",
    { title: "The recipe", intro: "Everything is in Greek, as on the site." },
    field({ id: "title", label: "Title", control: titleInput }),
    field({ id: "recipe-id", label: "Id", control: idInput, hint: idHint }),
    field({
      id: "description",
      label: "Description",
      hint: h("p", { class: "hint" }, "One or two sentences, shown on the recipe's card and under its title."),
      control: h("textarea", {
        class: "input",
        lang: "el",
        rows: 2,
        value: form.description,
        placeholder: "π.χ. Η ζεστή φασολάδα που μαγειρεύει η γιαγιά κάθε χειμώνα.",
        "data-field": "description",
        oninput: onInput((value, element) => {
          form.description = value;
          autoGrow(element);
        }),
      }),
    }),
    field({
      id: "category",
      label: "Chapter",
      optional: true,
      hint: categoryHint,
      control: h("input", {
        type: "text",
        class: "input",
        lang: "el",
        list: "categories",
        value: form.category,
        autocomplete: "off",
        "data-field": "category",
        oninput: onInput((value) => {
          form.category = value;
          refreshCategoryHint();
        }),
      }),
    }),
    h("datalist", { id: "categories" }, app.meta.categories.map((category) => h("option", { value: category }))),
    tagsField(),
    h(
      "div",
      { class: "grid-3" },
      field({
        id: "prep-time",
        label: "Preparation",
        optional: true,
        control: h("input", {
          type: "text",
          class: "input",
          lang: "el",
          value: form.prepTime,
          placeholder: "π.χ. 20 λεπτά",
          "data-field": "prepTime",
          oninput: onInput((value) => (form.prepTime = value)),
        }),
      }),
      field({
        id: "cook-time",
        label: "Cooking",
        optional: true,
        control: h("input", {
          type: "text",
          class: "input",
          lang: "el",
          value: form.cookTime,
          placeholder: "π.χ. 45 λεπτά",
          "data-field": "cookTime",
          oninput: onInput((value) => (form.cookTime = value)),
        }),
      }),
      field({
        id: "servings",
        label: "Servings",
        optional: true,
        control: h("input", {
          type: "number",
          class: "input",
          min: 1,
          step: 1,
          inputmode: "numeric",
          value: form.servings,
          placeholder: "π.χ. 4",
          "data-field": "servings",
          oninput: onInput((value) => (form.servings = value)),
        }),
      }),
    ),
  );
}

function tagsField() {
  const form = app.form;
  const chips = h("div", { class: "chips", role: "group", "aria-labelledby": "tags-label" });
  const hint = h("p", { class: "hint" });

  function render() {
    const selected = new Set(form.tags);
    const impliedBy = new Map();
    for (const tag of app.meta.tags) {
      if (selected.has(tag.id)) for (const implied of tag.implies) impliedBy.set(implied, tag.name);
    }

    fill(chips,
      ...app.meta.tags.map((tag) => {
        const implied = impliedBy.get(tag.id);
        return h(
          "label",
          { class: "chip", lang: "el", title: implied ? `Included with “${implied}”` : undefined },
          h("input", {
            type: "checkbox",
            checked: selected.has(tag.id) || implied !== undefined,
            disabled: implied !== undefined,
            onchange: (event) => toggle(tag, event.target.checked),
          }),
          tag.name,
        );
      }),
    );

    const names = new Map(app.meta.tags.map((tag) => [tag.id, tag.name]));
    const expanded = new Set([...selected, ...impliedBy.keys()]);
    const conflicts = app.meta.notVegetarian.filter((tag) => expanded.has(tag));
    if (expanded.has("vegetarian") && conflicts.length > 0) {
      hint.className = "hint is-error";
      hint.textContent = `A vegetarian recipe can't also be tagged ${conflicts.map((tag) => `“${names.get(tag)}”`).join(" or ")}.`;
    } else {
      hint.className = "hint";
      hint.textContent = "Choose the most specific ones: “Βίγκαν” already counts as vegetarian, and “Μοσχάρι” as meat.";
    }
  }

  function toggle(tag, on) {
    form.tags = on ? [...form.tags.filter((id) => !tag.implies.includes(id)), tag.id] : form.tags.filter((id) => id !== tag.id);
    render();
    changed();
  }

  render();
  return h(
    "div",
    { class: "field", "data-field": "tags" },
    h("span", { class: "field-label", id: "tags-label" }, "Tags", h("span", { class: "optional" }, " (optional)")),
    chips,
    hint,
  );
}

// ── Photo ─────────────────────────────────────────────────────────────────

function photoSection() {
  const body = h("div");
  const fileInput = h("input", {
    type: "file",
    accept: "image/*,.heic,.heif",
    class: "visually-hidden",
    tabindex: "-1",
    "aria-hidden": "true",
    onchange: (event) => {
      const [file] = event.target.files;
      event.target.value = "";
      if (file) acceptPhoto(file);
    },
  });
  const choose = () => fileInput.click();

  function render() {
    const photo = app.photo;
    const error = app.photoError && h("p", { class: "hint is-error", role: "alert" }, app.photoError);
    if (photo.kind === "busy") {
      fill(body, h("div", { class: "dropzone" }, h("strong", {}, "Preparing the photo…")));
      return;
    }
    if (photo.kind === "none") {
      fill(body,
        h(
          "button",
          { type: "button", class: "dropzone", onclick: choose, "data-field": "imageUrl" },
          icon("photo"),
          h("strong", {}, "Drop a photo here, or click to choose one"),
          h("span", { class: "hint" }, `JPEG, PNG, WebP, or HEIC (in Safari). Saved as a JPEG of at most ${MAX_PHOTO_EDGE} px.`),
        ),
        error,
        app.savedPhoto.kind === "saved" &&
          h(
            "p",
            { class: "hint" },
            "The saved photo is removed when you save. ",
            h("button", { type: "button", class: "link-button", onclick: () => setPhoto(app.savedPhoto) }, "Keep it"),
          ),
      );
      return;
    }

    const src = photo.kind === "new" ? photo.dataUrl : `${photo.url}?v=${app.version}`;
    const description =
      photo.kind === "new"
        ? `New photo, ${photo.width} × ${photo.height} px, ${formatBytes(photo.bytes)}` +
          (photo.original.width > photo.width ? ` (resized from ${photo.original.width} × ${photo.original.height})` : "") +
          ". Saved when you save the recipe."
        : `public${photo.url}`;
    fill(body,
      h(
        "div",
        { class: "photo" },
        h("img", { src, alt: "The recipe's photo" }),
        h(
          "div",
          { class: "photo-footer" },
          h("p", { class: "hint" }, description),
          h(
            "div",
            { class: "photo-actions" },
            photo.kind === "new" &&
              app.savedPhoto.kind === "saved" &&
              h("button", { type: "button", class: "button button-ghost button-small", onclick: () => setPhoto(app.savedPhoto) }, "Keep the saved photo"),
            h("button", { type: "button", class: "button button-outline button-small", onclick: choose }, "Replace"),
            h(
              "button",
              { type: "button", class: "button button-ghost button-small", onclick: () => setPhoto({ kind: "none" }) },
              icon("trash"),
              "Remove",
            ),
          ),
        ),
        error,
      ),
    );
  }

  function setPhoto(photo) {
    app.photo = photo;
    app.photoError = "";
    render();
    changed();
  }

  async function acceptPhoto(file) {
    const previous = app.photo;
    app.photo = { kind: "busy" };
    render();
    try {
      setPhoto({ kind: "new", ...(await preparePhoto(file)) });
    } catch (error) {
      app.photo = previous;
      app.photoError = error.message;
      render();
    }
  }

  refresh.photo = render;
  render();

  const card = sectionCard("photo", { title: "Photo", intro: "Optional, but every recipe looks better with one." }, body, fileInput);
  let depth = 0;
  const isFileDrag = (event) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
  card.addEventListener("dragenter", (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    depth++;
    card.classList.add("is-dragging");
  });
  card.addEventListener("dragover", (event) => {
    if (isFileDrag(event)) event.preventDefault();
  });
  card.addEventListener("dragleave", () => {
    depth = Math.max(0, depth - 1);
    if (depth === 0) card.classList.remove("is-dragging");
  });
  card.addEventListener("drop", (event) => {
    event.preventDefault();
    depth = 0;
    card.classList.remove("is-dragging");
    const file = Array.from(event.dataTransfer?.files ?? [])[0];
    if (file) acceptPhoto(file);
  });
  return card;
}

/** The photo resized to MAX_PHOTO_EDGE and encoded as JPEG, as a data URL for the save request. */
async function preparePhoto(file) {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error(`“${file.name}” isn't a photo.`);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error(`This browser can't open “${file.name}”. Save it as a JPEG or PNG first, or open the editor in Safari for HEIC photos.`);
    }
    const original = { width: image.naturalWidth, height: image.naturalHeight };
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(original.width, original.height));
    const width = Math.round(original.width * scale);
    const height = Math.round(original.height * scale);

    const canvas = h("canvas", { width, height });
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff"; // JPEG has no transparency
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", PHOTO_QUALITY));
    if (!blob) throw new Error("The photo couldn't be converted. Try another file.");

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("The photo couldn't be read."));
      reader.readAsDataURL(blob);
    });
    return { dataUrl, width, height, bytes: blob.size, original };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ── Lists ─────────────────────────────────────────────────────────────────

/** Splits pasted text into rows: by blank lines when it has them and rows hold paragraphs, else by line. Drops list markers. */
function splitPasted(text, multiline) {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  const parts = multiline && /\n[ \t]*\n/.test(normalized) ? normalized.split(/\n[ \t]*\n/) : normalized.split("\n");
  return parts.map((part) => oneLine(part).replace(/^(?:[-–—•*·]|\d+[.)])\s+/, "")).filter(Boolean);
}

/**
 * An editable list of texts that changes `items` in place: rows can be added,
 * removed, and moved. Enter adds a row after the current one, Backspace in an
 * empty row removes it, and pasting several lines into an empty row splits them.
 */
function listEditor({ items, label, addLabel, placeholder, multiline = false, bullets = false }) {
  const list = h("ol", { class: `rows${bullets ? " rows-bullets" : ""}` });

  function focusRow(index, atEnd = true) {
    const control = list.children[index]?.querySelector("input, textarea");
    if (!control) return;
    control.focus();
    if (atEnd) control.setSelectionRange(control.value.length, control.value.length);
  }

  function update(focusIndex) {
    render();
    changed();
    if (focusIndex !== undefined) focusRow(focusIndex);
  }

  function row(value, index) {
    const control = h(multiline ? "textarea" : "input", {
      type: multiline ? undefined : "text",
      class: "input",
      lang: "el",
      rows: multiline ? 1 : undefined,
      value,
      placeholder: index === 0 ? placeholder : undefined,
      "aria-label": `${label} ${index + 1}`,
      oninput: (event) => {
        items[index] = event.target.value;
        if (multiline) autoGrow(event.target);
        changed();
      },
      onkeydown: (event) => {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          items.splice(index + 1, 0, "");
          update(index + 1);
        } else if (event.key === "Backspace" && event.target.value === "" && items.length > 1) {
          event.preventDefault();
          items.splice(index, 1);
          update(Math.max(0, index - 1));
        }
      },
      onpaste: (event) => {
        const parts = splitPasted(event.clipboardData?.getData("text") ?? "", multiline);
        if (event.target.value.trim() !== "" || parts.length < 2) return;
        event.preventDefault();
        items.splice(index, 1, ...parts);
        update(index + parts.length - 1);
      },
    });

    const move = (offset) => {
      [items[index], items[index + offset]] = [items[index + offset], items[index]];
      update(index + offset);
    };
    return h(
      "li",
      { class: "row" },
      h("span", { class: "row-number", "aria-hidden": "true" }, bullets ? "" : String(index + 1)),
      control,
      h(
        "div",
        { class: "row-actions" },
        iconButton("up", `Move ${label.toLowerCase()} ${index + 1} up`, () => move(-1), { disabled: index === 0 }),
        iconButton("down", `Move ${label.toLowerCase()} ${index + 1} down`, () => move(1), { disabled: index === items.length - 1 }),
        iconButton(
          "x",
          `Remove ${label.toLowerCase()} ${index + 1}`,
          () => {
            items.splice(index, 1);
            if (items.length === 0) items.push("");
            update(Math.min(index, items.length - 1));
          },
          { danger: true },
        ),
      ),
    );
  }

  function render() {
    fill(list, ...items.map(row));
    if (multiline) requestAnimationFrame(() => list.querySelectorAll("textarea").forEach(autoGrow));
  }

  render();
  return h(
    "div",
    {},
    list,
    h(
      "button",
      {
        type: "button",
        class: "button button-ghost button-small",
        onclick: () => {
          items.push("");
          update(items.length - 1);
        },
      },
      icon("plus"),
      addLabel,
    ),
  );
}

function listSection({ key, title, intro, ...options }) {
  return sectionCard(key, { title, intro }, h("div", { "data-field": key }, listEditor(options)));
}

function preparationsSection() {
  const preparations = app.form.preparations;
  const body = h("div");

  function render() {
    fill(body,
      ...preparations.map((preparation, index) =>
        h(
          "div",
          { class: "preparation" },
          h(
            "div",
            { class: "preparation-header" },
            field({
              id: `preparation-${index}`,
              label: `Part ${index + 1}`,
              control: h("input", {
                type: "text",
                class: "input",
                lang: "el",
                value: preparation.title,
                placeholder: "π.χ. Μπεσαμέλ",
                oninput: onInput((value) => (preparation.title = value)),
              }),
            }),
            iconButton(
              "trash",
              `Remove part ${index + 1}`,
              () => {
                preparations.splice(index, 1);
                render();
                changed();
              },
              { danger: true },
            ),
          ),
          listEditor({
            items: preparation.steps,
            label: "Step",
            addLabel: "Add a step",
            placeholder: "π.χ. Λιώνουμε το βούτυρο και ρίχνουμε το αλεύρι.",
            multiline: true,
          }),
        ),
      ),
      h(
        "button",
        {
          type: "button",
          class: "button button-outline button-small",
          onclick: () => {
            preparations.push({ title: "", steps: [""] });
            render();
            changed();
            body.querySelector(`#preparation-${preparations.length - 1}`)?.focus();
          },
        },
        icon("plus"),
        "Add a part made first",
      ),
    );
  }

  render();
  return sectionCard(
    "preparations",
    {
      title: "Made first",
      intro: "Optional. Parts made separately before the main steps, such as the béchamel for a moussaka. They are shown above the steps.",
    },
    h("div", { "data-field": "preparations" }, body),
  );
}

// ── Story ─────────────────────────────────────────────────────────────────

/** What the story's text holds: its paragraphs and recipe links, and links that won't work. */
function storyInfo(story) {
  const titles = new Map(app.meta.recipes.map((recipe) => [recipe.id, recipe.title]));
  const paragraphs = story.split(/\n[ \t]*\n/).filter((paragraph) => paragraph.trim() !== "").length;
  const linked = [];
  const unknown = [];
  for (const match of story.matchAll(MENTION)) {
    const id = match[1];
    if (id === app.id) linked.push(oneLine(app.form.title) || id);
    else if (titles.has(id)) linked.push(titles.get(id));
    else unknown.push(id);
  }
  const rest = story.replace(MENTION, "");
  return { paragraphs, linked: Array.from(new Set(linked)), unknown, malformed: rest.includes("[[") || rest.includes("]]") };
}

function storySection() {
  const form = app.form;
  const body = h("div");

  const toggle = h("input", {
    type: "checkbox",
    role: "switch",
    checked: form.hasStory,
    onchange: (event) => {
      form.hasStory = event.target.checked;
      render();
      changed();
      if (form.hasStory) $("#story-title")?.focus();
    },
  });

  function render() {
    if (!form.hasStory) {
      fill(body,
        h(
          "p",
          { class: "hint" },
          app.savedHasStory
            ? "The story is removed when you save. Switch it back on to keep it."
            : "Switch this on to tell the story behind the recipe. It appears in the journal and on the recipe's page.",
        ),
      );
      return;
    }

    const info = h("p", { class: "hint story-info" });
    const textarea = h("textarea", {
      class: "input input-story",
      lang: "el",
      rows: 8,
      value: form.memory.story,
      placeholder: "Γράψε την ιστορία εδώ. Άφησε μια κενή γραμμή ανάμεσα στις παραγράφους.",
      "data-field": "memory",
      oninput: onInput((value, element) => {
        form.memory.story = value;
        autoGrow(element);
        refreshInfo();
      }),
    });

    function refreshInfo() {
      const { paragraphs, linked, unknown, malformed } = storyInfo(form.memory.story);
      fill(info,
        h("span", {}, paragraphs === 1 ? "1 paragraph" : `${paragraphs} paragraphs`),
        linked.length > 0 && h("span", { lang: "el" }, `Links to ${linked.join(", ")}`),
        unknown.length > 0 && h("span", { class: "is-error" }, `No recipe has the id ${unknown.map((id) => `“${id}”`).join(", ")}`),
        malformed && h("span", { class: "is-error" }, "A link is written wrong: use [[recipe-id]] or [[recipe-id|words]]"),
      );
    }
    refreshInfo();

    const linkPicker = h(
      "select",
      {
        class: "input",
        "aria-label": "Link a recipe",
        onchange: (event) => {
          const id = event.target.value;
          event.target.value = "";
          if (id) insertMention(textarea, id);
        },
      },
      h("option", { value: "" }, "Link a recipe…"),
      [...app.meta.recipes]
        .sort((a, b) => a.title.localeCompare(b.title, "el"))
        .map((recipe) => h("option", { value: recipe.id, lang: "el" }, recipe.title)),
    );

    fill(body,
      field({
        id: "story-title",
        label: "Story title",
        control: h("input", {
          type: "text",
          class: "input input-title",
          lang: "el",
          value: form.memory.title,
          placeholder: "π.χ. Κυριακάτικο τραπέζι",
          "data-field": "memory.title",
          oninput: onInput((value) => (form.memory.title = value)),
        }),
      }),
      field({
        id: "story-date",
        label: "When",
        optional: true,
        hint: h("p", { class: "hint" }, "Year and month as 2023-11 show as “Νοέμβριος 2023”; anything else, such as “Πάσχα 1998”, shows as written."),
        control: h("input", {
          type: "text",
          class: "input",
          lang: "el",
          value: form.memory.date,
          placeholder: "π.χ. 2023-11",
          "data-field": "memory.date",
          oninput: onInput((value) => (form.memory.date = value)),
        }),
      }),
      h(
        "div",
        { class: "field" },
        h(
          "div",
          { class: "story-toolbar" },
          h("label", { class: "field-label", for: "story-text" }, "The story"),
          linkPicker,
        ),
        Object.assign(textarea, { id: "story-text" }),
        h(
          "p",
          { class: "hint" },
          "Leave a blank line between paragraphs. To link another recipe, pick it above; select some words first to make them the link.",
        ),
        info,
      ),
    );
    requestAnimationFrame(() => autoGrow(textarea));
  }

  render();
  return sectionCard(
    "story",
    {
      title: "Family story",
      intro: "The memory that goes with the recipe.",
      action: h("label", { class: "switch" }, toggle, "Has a story"),
      className: "card-story",
    },
    body,
  );
}

/** Puts a link to recipe `id` at the cursor, or around the selected words. */
function insertMention(textarea, id) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = oneLine(value.slice(start, end));
  const link = selected && !/[[\]|]/.test(selected) ? `[[${id}|${selected}]]` : `[[${id}]]`;
  textarea.focus();
  textarea.setRangeText(link, start, end, "end");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

// ── Saving ────────────────────────────────────────────────────────────────

function saveBar() {
  const status = h("p", { class: "save-status", role: "status" });
  const button = h(
    "button",
    { type: "button", class: "button button-primary", onclick: () => save() },
    h("span", { class: "save-label" }),
    h("kbd", {}, navigator.platform.startsWith("Mac") ? "⌘S" : "Ctrl S"),
  );

  refresh.saveBar = () => {
    const dirty = isDirty();
    status.className = `save-status${dirty ? " is-dirty" : app.mode === "new" ? " is-new" : ""}`;
    status.textContent = app.busy
      ? "Saving…"
      : app.mode === "new"
        ? dirty
          ? "Not saved yet"
          : "Start with the title"
        : dirty
          ? "Unsaved changes"
          : "All changes saved";
    button.querySelector(".save-label").textContent = app.mode === "new" ? "Create recipe" : "Save changes";
    button.disabled = app.busy || (app.mode === "edit" && !dirty);
  };
  refresh.saveBar();
  return h("div", { class: "save-bar" }, status, h("div", { class: "save-actions" }, button));
}

/** The common mistakes, found before asking the server, in plain words. */
function formProblems() {
  const form = payloadForm();
  const problems = [];
  const add = (field, message) => problems.push({ field, message });

  if (!form.title) add("title", "Give the recipe a title.");
  if (app.mode === "new") {
    if (!app.id) add("id", "The recipe needs an id; it is filled in from the title.");
    else if (!RECIPE_ID.test(app.id)) add("id", "The id can only have lowercase Latin letters, digits, and single hyphens between words.");
    else if (app.meta.recipes.some((recipe) => recipe.id === app.id)) add("id", `There is already a recipe with the id “${app.id}”.`);
  }
  if (!form.description) add("description", "Write a short description.");
  if (form.servings && !(/^\d+$/.test(form.servings) && Number(form.servings) > 0)) {
    add("servings", "Servings must be a whole number, such as 4.");
  }
  if (form.ingredients.length === 0) add("ingredients", "Add at least one ingredient.");
  if (form.steps.length === 0) add("steps", "Add at least one step.");
  form.preparations.forEach((preparation, index) => {
    if (!preparation.title) add("preparations", `Give part ${index + 1} of “Made first” a title, such as “Μπεσαμέλ”.`);
    if (preparation.steps.length === 0) add("preparations", `Add the steps of “${preparation.title || `part ${index + 1}`}”.`);
  });
  if (form.memory) {
    if (!form.memory.title) add("memory.title", "Give the story a title.");
    if (!form.memory.story) add("memory", "Write the story, or switch “Has a story” off.");
  }
  return problems;
}

const sectionOf = (field) => SECTION_OF_FIELD[field.split(".")[0]];

function goTo(field) {
  const target =
    document.querySelector(`[data-field="${field}"]`) ??
    document.querySelector(`[data-field="${field.split(".")[0]}"]`) ??
    document.getElementById(`section-${sectionOf(field)}`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const control = target.matches("input, textarea, select, button") ? target : target.querySelector("input, textarea, select, button");
  control?.focus({ preventScroll: true });
}

function noticesBox() {
  const box = $("#notices");
  const languages = app.meta.languages;

  for (const card of document.querySelectorAll(".card")) card.classList.remove("has-problem");
  for (const problem of app.problems) {
    document.getElementById(`section-${sectionOf(problem.field)}`)?.classList.add("has-problem");
  }

  const translationProblems = app.problems.filter((problem) => problem.field.startsWith("translations."));
  const otherProblems = app.problems.filter((problem) => !problem.field.startsWith("translations."));
  const broken = Array.from(new Set(translationProblems.map((problem) => problem.field.split(".")[1])));

  fill(box,
    app.error &&
      h(
        "div",
        { class: "notice notice-error", role: "alert" },
        h("p", { class: "notice-title" }, icon("alert"), "Not saved"),
        h("p", {}, app.error.message),
        app.error.conflict &&
          h(
            "div",
            { class: "notice-actions" },
            h(
              "button",
              { type: "button", class: "button button-outline button-small", onclick: () => openRecipe(app.id, { force: true }) },
              "Reload it from disk (discards your changes here)",
            ),
          ),
      ),
    app.problems.length > 0 &&
      h(
        "div",
        { class: "notice notice-error", role: "alert" },
        h("p", { class: "notice-title" }, icon("alert"), "Not saved yet. Please fix:"),
        otherProblems.length > 0 &&
          h(
            "ul",
            {},
            otherProblems.map((problem) =>
              h(
                "li",
                {},
                problem.message,
                " ",
                sectionOf(problem.field) &&
                  h("button", { type: "button", class: "link-button", onclick: () => goTo(problem.field) }, "Show me"),
              ),
            ),
          ),
        broken.length > 0 &&
          h(
            "div",
            {},
            h(
              "p",
              {},
              `The translations in ${broken.map((locale) => languages[locale] ?? locale).join(", ")} no longer match the Greek. ` +
                "Each translation needs the same number of ingredients, steps, and parts made first, and a story, preparation time, or cooking time exactly when the Greek has one.",
            ),
            h(
              "div",
              { class: "notice-actions" },
              h(
                "button",
                { type: "button", class: "button button-danger button-small", onclick: () => save({ dropBrokenTranslations: true }) },
                "Remove those translations and save",
              ),
            ),
            h(
              "p",
              { class: "hint" },
              "Those languages then show the Greek text with a notice until the recipe is translated again. Or undo the change that caused it.",
            ),
          ),
      ),
    app.notes.length > 0 &&
      h(
        "div",
        { class: "notice notice-info", role: "status" },
        h("p", { class: "notice-title" }, icon("check"), "Saved"),
        h("ul", {}, app.notes.map((note) => h("li", {}, note))),
      ),
  );
}
refresh.notices = () => noticesBox();

async function save({ dropBrokenTranslations = false } = {}) {
  if (app.busy || app.photo.kind === "busy") return;
  app.error = undefined;
  app.notes = [];
  app.problems = formProblems();
  if (app.problems.length > 0) {
    refresh.notices();
    $("#notices").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  app.busy = true;
  refresh.saveBar();
  const creating = app.mode === "new";
  const body = {
    form: payloadForm(),
    version: app.version,
    image: app.photo.kind === "new" ? app.photo.dataUrl : undefined,
    removeImage: app.photo.kind === "none" && app.savedPhoto.kind === "saved",
    dropBrokenTranslations,
    ...(creating && { id: app.id }),
  };

  try {
    const saved = await api(creating ? "/api/recipes" : `/api/recipes/${encodeURIComponent(app.id)}`, {
      method: creating ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    app.busy = false;
    await loadState();
    await openRecipe(saved.id, { force: true, keepScroll: true });
    app.notes = saved.warnings;
    refresh.notices();
    if (app.notes.length > 0) $("#notices").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(creating ? `Created data/recipes/${saved.id}.json` : `Saved data/recipes/${saved.id}.json`);
  } catch (error) {
    if (error.status === 422 && Array.isArray(error.data?.issues)) {
      app.problems = error.data.issues;
    } else {
      app.error = {
        message: error.status ? error.message : "Couldn't reach the editor. Is npm run editor still running in the terminal?",
        conflict: error.data?.conflict === true,
      };
    }
    refresh.notices();
    $("#notices").scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    app.busy = false;
    refresh.saveBar?.();
  }
}

// ── Opening recipes ───────────────────────────────────────────────────────

function confirmDiscard() {
  return !isDirty() || window.confirm("You have unsaved changes. Discard them?");
}

function startEditing() {
  app.problems = [];
  app.error = undefined;
  app.notes = [];
  app.photoError = "";
  renderEditor();
  app.snapshot = snapshot();
  refresh.saveBar();
  renderList();
}

function newRecipe({ story = false } = {}) {
  if (!confirmDiscard()) return;
  Object.assign(app, {
    mode: "new",
    id: "",
    idEdited: false,
    version: undefined,
    translations: [],
    updatedAt: undefined,
    savedHasStory: false,
    form: { ...emptyForm(), hasStory: story },
    photo: { kind: "none" },
    savedPhoto: { kind: "none" },
  });
  history.replaceState(null, "", location.pathname);
  window.scrollTo(0, 0);
  startEditing();
  $("#title")?.focus();
}

async function openRecipe(id, { story = false, force = false, keepScroll = false } = {}) {
  if (!force && !confirmDiscard()) return;
  let data;
  try {
    data = await api(`/api/recipes/${encodeURIComponent(id)}`);
  } catch (error) {
    app.error = { message: error.message };
    refresh.notices?.();
    return;
  }

  const { recipe } = data;
  const savedPhoto = recipe.imageUrl ? { kind: "saved", url: recipe.imageUrl } : { kind: "none" };
  Object.assign(app, {
    mode: "edit",
    id,
    idEdited: true,
    version: data.version,
    translations: data.translations,
    updatedAt: recipe.updatedAt,
    savedHasStory: recipe.memory !== undefined,
    form: formFromRecipe(recipe),
    photo: savedPhoto,
    savedPhoto,
  });
  // The open recipe is kept in the address, so reloading the page reopens it.
  history.replaceState(null, "", `#${id}`);
  if (!keepScroll) window.scrollTo(0, 0);
  startEditing();

  if (story) {
    if (!app.form.hasStory) {
      app.form.hasStory = true;
      renderEditor();
      changed();
    }
    $("#section-story").scrollIntoView({ behavior: "smooth", block: "start" });
    (app.form.memory.title ? $("#story-text") : $("#story-title"))?.focus({ preventScroll: true });
  }
}

// ── New story dialog ──────────────────────────────────────────────────────

function openStoryDialog() {
  const dialog = $("#story-dialog");
  const choices = h("ul", { class: "choice-list" });
  const search = h("input", {
    type: "search",
    class: "input",
    placeholder: "Search recipes",
    "aria-label": "Search recipes",
    oninput: () => renderChoices(),
  });

  function renderChoices() {
    const query = searchText(search.value.trim());
    const recipes = app.meta.recipes
      .filter((recipe) => query === "" || searchText(`${recipe.title} ${recipe.id}`).includes(query))
      .sort((a, b) => Number(a.hasStory) - Number(b.hasStory));
    fill(choices,
      ...recipes.map((recipe) =>
        h(
          "li",
          {},
          h(
            "button",
            {
              type: "button",
              class: "choice",
              onclick: () => {
                dialog.close();
                openRecipe(recipe.id, { story: true });
              },
            },
            thumb(recipe),
            h(
              "span",
              { class: "item-text" },
              h("span", { class: "item-title", lang: "el" }, recipe.title),
              h(
                "span",
                { class: "item-meta" },
                recipe.hasStory ? h("span", {}, "Has a story: ", h("span", { lang: "el" }, `“${recipe.storyTitle}”`)) : "No story yet",
              ),
            ),
            h("span", { class: "item-badges" }, recipe.hasStory ? "Edit" : "Add"),
          ),
        ),
      ),
    );
  }

  fill(dialog,
    h(
      "div",
      { class: "dialog-body" },
      h("h2", { id: "story-dialog-title" }, "Which recipe is the story about?"),
      h("p", {}, "Every story belongs to a recipe. It is shown in the journal and on that recipe's page."),
      search,
    ),
    choices,
    h(
      "div",
      { class: "dialog-footer" },
      h("button", { type: "button", class: "button button-ghost", onclick: () => dialog.close() }, "Cancel"),
      h(
        "button",
        {
          type: "button",
          class: "button button-secondary",
          onclick: () => {
            dialog.close();
            newRecipe({ story: true });
          },
        },
        icon("plus"),
        "A new recipe",
      ),
    ),
  );
  renderChoices();
  dialog.showModal();
  search.focus();
}

// ── Start ─────────────────────────────────────────────────────────────────

async function loadState() {
  app.meta = await api("/api/state");
  renderList();
}

async function start() {
  $("#new-recipe").addEventListener("click", () => newRecipe());
  $("#new-story").addEventListener("click", () => openStoryDialog());
  $("#search").addEventListener("input", () => renderList());
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (app.meta && !$("#story-dialog").open) save();
    }
  });
  window.addEventListener("beforeunload", (event) => {
    if (isDirty()) event.preventDefault();
  });
  // Typing #<recipe-id> in the address opens that recipe.
  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id === (app.mode === "edit" ? app.id : "")) return;
    if (app.meta.recipes.some((recipe) => recipe.id === id)) openRecipe(id);
    else if (id === "") newRecipe();
    // Back to the recipe that is open, also when the change was declined.
    if (app.mode === "edit") history.replaceState(null, "", `#${app.id}`);
  });

  try {
    await loadState();
  } catch {
    fill(
      $("#editor"),
      h("p", { class: "loading" }, "Couldn't load the recipes. Is npm run editor still running in the terminal?"),
    );
    return;
  }
  const id = decodeURIComponent(location.hash.slice(1));
  if (app.meta.recipes.some((recipe) => recipe.id === id)) await openRecipe(id);
  else newRecipe();
}

start();
