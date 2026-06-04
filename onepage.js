// Single-page experience: home flow, gallery grid, and contact form.

function isFlowMobileLayout() {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}

/** Layout viewport width (stable when iOS / in-app browser chrome shows or hides on scroll). */
let flowLayoutViewportWidth = null;
let flowLayoutViewportLocked = false;

function getFlowLayoutViewportWidth() {
  const clientW = Math.max(
    1,
    Math.round(document.documentElement.clientWidth || window.innerWidth)
  );
  if (!isFlowMobileLayout()) return clientW;

  if (flowLayoutViewportLocked && flowLayoutViewportWidth !== null) {
    return flowLayoutViewportWidth;
  }

  if (flowLayoutViewportWidth === null) {
    flowLayoutViewportWidth = clientW;
    return clientW;
  }

  if (Math.abs(clientW - flowLayoutViewportWidth) >= 56) {
    flowLayoutViewportWidth = clientW;
  }
  return flowLayoutViewportWidth;
}

function lockFlowLayoutViewportWidth() {
  if (!isFlowMobileLayout()) return;
  flowLayoutViewportWidth = Math.max(
    1,
    Math.round(document.documentElement.clientWidth || window.innerWidth)
  );
  flowLayoutViewportLocked = true;
}

function unlockFlowLayoutViewportWidth() {
  flowLayoutViewportWidth = null;
  flowLayoutViewportLocked = false;
}

function getFlowItemWidth() {
  const w = getFlowLayoutViewportWidth();
  if (w <= 420) return Math.min(200, Math.round(w * 0.72));
  if (w <= 768) return Math.min(248, Math.round(w * 0.58));
  return 288;
}

function positiveModulo(value, modulus) {
  if (!(modulus > 0)) return 0;
  return ((value % modulus) + modulus) % modulus;
}

const FLOW_BASE_ITEMS = [
  "1_3730.webp",
  "13.webp",
  "2_1826.webp",
  "DSC_7318.webp",
  "4_5325.webp",
  "16.webp",
  "DSC_7326.webp",
  "17.webp",
  "2_2040.webp",
  "20.webp",
  "6.webp",
  "1_3746.webp",
  "5_2065.webp",
  "5_2094.webp",
  "5_3353.webp",
  "5_4391.webp",
  "4_5983 (1).webp",
  "4_7165.webp",
  "4_7270.webp",
];

/** Full-gallery-only: keyed paths (not `N_` filenames) get their own pinned section. */
/** Subset of Listening Room shots that appear in the home flow carousel. */
const FLOW_LISTENING_ROOM_ITEMS = [
  "6.1.webp",
  "18.webp",
];

const FLOW_STACKS_RATS_NEST_ITEMS = ["DSC_7296.webp"];

const FLOW_PINNED_INSERTS = [...FLOW_LISTENING_ROOM_ITEMS, ...FLOW_STACKS_RATS_NEST_ITEMS];

function getLeadingNumberGroup(src) {
  const filename = src.split("/").pop() || "";
  const match = filename.match(/^(\d+)_/);
  if (!match) return null;
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return null;
  return String(numeric);
}

/** Numbered show bucket removed from the site (was “Some Highlights”, `6_*` filenames). */
const EXCLUDED_NUMBERED_SHOW_GROUPS = new Set(["6"]);

function isExcludedNumberedShowAsset(path) {
  const group = getLeadingNumberGroup(path);
  return group !== null && EXCLUDED_NUMBERED_SHOW_GROUPS.has(group);
}

function isExcludedFromFlow(path) {
  return isExcludedNumberedShowAsset(path);
}

const FULL_GALLERY_LISTENING_ROOM = {
  id: "listening-room-longboat",
  order: -2,
  title: "Listening Room @ Longboat Hall",
  sources: [
    "13.webp",
    "16.webp",
    "17.webp",
    "18.webp",
    "33.webp",
    "6.1.webp",
    "11.1.webp",
    "14.1.webp",
    "25.1.webp",
    "26.webp",
    "35.webp",
    "37.webp",
    "4.1.webp",
    "40.webp",
    "41.webp",
    "42.webp",
    "43.webp",
    "47.webp",
    "7.1.webp",
    "8.1.webp",
  ],
};

const FULL_GALLERY_STACKS_RATS_NEST = {
  id: "stacks-rats-nest",
  order: -1.5,
  title: "Stacks @ Rats Nest",
  sources: [
    "DSC_7344.webp",
    "DSC_7296.webp",
    "DSC_7281.webp",
    "DSC_7337.webp",
    "DSC_7308.webp",
    "DSC_7318.webp",
    "DSC_7326.webp",
  ],
};

const FULL_GALLERY_PINNED_SHOW = {
  id: "swt-burdock",
  order: -1,
  title: "Sam William Thomas @ Burdock",
  sources: [
    "9.webp",
    "6.webp",
    "DSC_6790.webp",
    "7.webp",
    "20.webp",
    "22.webp",
    "19.webp",
    "DSC_6198.webp",
    "8.webp",
  ],
};

const FULL_GALLERY_PINNED_SHOWS = [
  FULL_GALLERY_LISTENING_ROOM,
  FULL_GALLERY_STACKS_RATS_NEST,
  FULL_GALLERY_PINNED_SHOW,
];

/** Pinned sections that use source-order hero rows (preview pair + lead block + orientation rest). */
const PINNED_SHOWS_WITH_LEAD_LAYOUT = new Set([FULL_GALLERY_LISTENING_ROOM.id]);

function getPinnedShowById(id) {
  return FULL_GALLERY_PINNED_SHOWS.find((show) => show.id === id);
}

function scatterItemsIntoFlow(baseItems, insertItems) {
  if (!insertItems.length) return [...baseItems];
  const result = [...baseItems];
  insertItems.forEach((item, i) => {
    if (result.includes(item)) return;
    const slot = Math.round(((i + 1) * result.length) / (insertItems.length + 1));
    result.splice(Math.min(slot, result.length), 0, item);
  });
  return result;
}

function dedupeFlowItems(items) {
  const seen = new Set();
  return items.filter((path) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

const fullGalleryCustomGroupByPath = new Map();
FULL_GALLERY_PINNED_SHOWS.forEach((show) => {
  show.sources.forEach((path) => {
    fullGalleryCustomGroupByPath.set(path, {
      label: show.id,
      order: show.order,
    });
  });
});

const fullGalleryNumberedItems = [
  ...FULL_GALLERY_LISTENING_ROOM.sources,
  ...FULL_GALLERY_STACKS_RATS_NEST.sources,
  ...FULL_GALLERY_PINNED_SHOW.sources,
  "1_3566 (1).webp",
  "1_3697 (1).webp",
  "1_3714.webp",
  "1_3719 (1).webp",
  "1_3730.webp",
  "1_3746.webp",
  "2_0829.webp",
  "2_1826.webp",
  "2_1932.webp",
  "2_1981.webp",
  "2_2040.webp",
  "3_8505.webp",
  "3_8632.webp",
  "3_8635.webp",
  "3_8640.webp",
  "3_9088.webp",
  "3_9098.webp",
  "4_5325.webp",
  "4_5573.webp",
  "4_5983 (1).webp",
  "4_7165.webp",
  "4_7270.webp",
  "5_2065.webp",
  "5_2094.webp",
  "5_2575.webp",
  "5_3353.webp",
  "5_4391.webp",
];

/** Used on full gallery page but not in the grid (e.g. page background). */
const FULL_GALLERY_PAGE_ONLY_PATHS = ["3.webp"];

const FULL_GALLERY_PATH_SET = new Set([
  ...fullGalleryNumberedItems,
  ...FULL_GALLERY_PAGE_ONLY_PATHS,
]);

function isInFullGallery(path) {
  return FULL_GALLERY_PATH_SET.has(path);
}

/** Contact section background — must be full-gallery images only. */
const CONTACT_BG_IMAGES = [
  "6.webp",
  "DSC_7344.webp",
  "13.webp",
  "DSC_7281.webp",
  "1_3730.webp",
  "DSC_6790.webp",
];

const mediaItems = dedupeFlowItems(
  scatterItemsIntoFlow(FLOW_BASE_ITEMS, FLOW_PINNED_INSERTS)
)
  .filter((path) => !isExcludedFromFlow(path))
  .filter(isInFullGallery);

let activeGalleryItems = mediaItems;
const fullGalleryExpandedGroups = new Set();
const fullGallerySectionTitles = {
  [FULL_GALLERY_LISTENING_ROOM.id]: FULL_GALLERY_LISTENING_ROOM.title,
  [FULL_GALLERY_STACKS_RATS_NEST.id]: FULL_GALLERY_STACKS_RATS_NEST.title,
  [FULL_GALLERY_PINNED_SHOW.id]: FULL_GALLERY_PINNED_SHOW.title,
  "1": "Boston Church Scandal @ The Drake",
  "2": "DAPHNE @ The Drake",
  "3": "Izzy Flores @ 986 Bathurst",
  "4": "Angelique @ The Ivy",
  "5": "Superstar Crush @ The Baby G",
};

const ROW_IDS = ["row-top", "row-bottom"];
const FLOW_BASE_SPEEDS = [24, 30];
let galleryRowsState = null;
let flowDirection = 1;
let flowMultiplier = 1;
let magneticCursorX = null;
let magneticCursorY = null;
let magneticCursorItem = null;
let lightbox;
let lightboxImage;
let lightboxVideo;
let lightboxCloseBtn;
let lightboxPrevBtn;
let lightboxNextBtn;
let lightboxCurrentIndex = null;
let scrollRevealObserver = null;

const MAX_HOVER_SCALE = 1.18;
const MAX_NEIGHBOR_SCALE = 1.16;
const MAGNETIC_RADIUS_PX = 320;

function getShouldReduceMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function observeRevealElement(el, delayMs = 0, variant = null) {
  if (!el) return;
  el.classList.add("reveal-on-scroll");
  if (variant) {
    el.classList.add(`reveal-on-scroll--${variant}`);
  }
  if (delayMs > 0) {
    el.style.setProperty("--reveal-delay", `${delayMs}ms`);
  }
  if (getShouldReduceMotion()) {
    el.classList.add("is-visible");
    return;
  }
  if (!scrollRevealObserver) {
    scrollRevealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "14% 0px -8% 0px" }
    );
  }
  scrollRevealObserver.observe(el);
}

const SCROLL_FADE_DESKTOP_MQ = "(min-width: 769px)";
const scrollFadeObserverByKey = new Map();

function isScrollFadeDesktop() {
  return window.matchMedia(SCROLL_FADE_DESKTOP_MQ).matches;
}

/** Keep target fully visible on first paint; fade only after layout + scroll observer attaches. */
function initScrollFade(el) {
  if (!el || el.classList.contains("flow-scroll-fade")) return;
  el.classList.add("flow-scroll-fade");
  el.style.setProperty("--flow-scroll-opacity", "1");
}

function teardownScrollFade(el, key) {
  const observer = scrollFadeObserverByKey.get(key);
  if (observer) {
    observer.disconnect();
    scrollFadeObserverByKey.delete(key);
  }
  if (!el) return;
  el.classList.remove("flow-scroll-fade", "flow-scroll-fade--ready");
  el.style.removeProperty("--flow-scroll-opacity");
  el.style.pointerEvents = "";
}

function attachScrollFadeObserver(el, key) {
  if (!el || scrollFadeObserverByKey.has(key)) return;

  el.style.setProperty("--flow-scroll-opacity", "1");

  if (getShouldReduceMotion()) {
    el.classList.add("flow-scroll-fade--ready");
    return;
  }

  const thresholds = Array.from({ length: 11 }, (_, i) => i / 10);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          el.style.setProperty("--flow-scroll-opacity", "0");
          el.style.pointerEvents = "none";
          return;
        }
        const ratio = entry.intersectionRatio;
        const opacity = ratio >= 0.5 ? 1 : Math.min(1, ratio / 0.5);
        el.style.setProperty("--flow-scroll-opacity", String(opacity));
        el.style.pointerEvents = opacity < 0.12 ? "none" : "";
      });
    },
    { threshold: thresholds, rootMargin: "0px" }
  );

  observer.observe(el);
  scrollFadeObserverByKey.set(key, observer);
  el.classList.add("flow-scroll-fade--ready");
}

function initFlowScrollFade() {
  initScrollFade(document.querySelector(".onepage-section--home .gallery"));
}

function attachFlowScrollFadeObserver() {
  attachScrollFadeObserver(document.querySelector(".onepage-section--home .gallery"), "flow");
}

function initContactScrollFade() {
  if (!isScrollFadeDesktop()) return;
  initScrollFade(document.querySelector(".page--onepage .onepage-section--contact"));
}

function attachContactScrollFadeObserver() {
  const contact = document.querySelector(".page--onepage .onepage-section--contact");
  if (!isScrollFadeDesktop()) {
    teardownScrollFade(contact, "contact");
    return;
  }
  attachScrollFadeObserver(contact, "contact");
}

function setupContactScrollFadeOnResize() {
  const contact = document.querySelector(".page--onepage .onepage-section--contact");
  if (!contact) return;
  if (!isScrollFadeDesktop()) {
    teardownScrollFade(contact, "contact");
    return;
  }
  if (!contact.classList.contains("flow-scroll-fade")) initScrollFade(contact);
  if (!scrollFadeObserverByKey.has("contact")) attachScrollFadeObserver(contact, "contact");
}

function setupScrollReveal() {
  const isFullGalleryPage = document.body.classList.contains("page-full-gallery");
  if (isFullGalleryPage) return;

  const revealSequence = [];

  revealSequence.forEach((step) => {
    const el = document.querySelector(step.selector);
    if (!el) return;
    observeRevealElement(el, step.delay, step.variant);
  });
}

function triggerFlowShockwave(epicenter) {
  // Shockwave reveal intentionally disabled.
}

function openLightboxFromIndex(index) {
  if (!lightbox) return;
  const item = activeGalleryItems[index];
  if (!item) return;

  document.querySelectorAll("#gallery-grid video").forEach((v) => {
    try {
      v.pause();
    } catch (_e) {}
  });

  lightboxCurrentIndex = index;
  lightbox.setAttribute("data-state", "open");
  document.documentElement.style.overflow = "hidden";

  if (typeof item === "string") {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.removeAttribute("data-active");
    lightboxImage.src = item;
    lightboxImage.setAttribute("data-active", "true");
  } else {
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("data-active");
    lightboxVideo.src = item.src;
    lightboxVideo.loop = true;
    lightboxVideo.setAttribute("data-active", "true");
    lightboxVideo.play().catch(() => {});
  }
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.setAttribute("data-state", "closed");
  document.documentElement.style.overflow = "";
  lightboxCurrentIndex = null;

  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.removeAttribute("data-active");
  }
  if (lightboxImage) {
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("data-active");
  }
}

function changeLightboxBy(delta) {
  if (lightboxCurrentIndex === null) return;
  const total = activeGalleryItems.length;
  openLightboxFromIndex((lightboxCurrentIndex + delta + total) % total);
}

function applyMagneticScale() {
  // Magnetic hover scaling intentionally disabled.
}

function attachHoverAndClickBehavior(wrapper, mediaIndex) {
  let lastActivateAt = 0;

  function activateTile(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = Date.now();
    if (now - lastActivateAt < 350) return;
    if (typeof mediaIndex !== "number") return;
    const item = activeGalleryItems[mediaIndex];
    if (!item) return;
    lastActivateAt = now;
    openLightboxFromIndex(mediaIndex);
  }

  wrapper.setAttribute("role", "button");
  wrapper.setAttribute("tabindex", "0");
  wrapper.setAttribute("aria-label", "Open image in lightbox");

  wrapper.addEventListener("click", activateTile);
  wrapper.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse") return;
    if (!e.isPrimary) return;
    activateTile(e);
  });
  wrapper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateTile(e);
    }
  });
}

/** Cap flow segment length (multiplier of viewport width) to limit DOM/decodes. */
const FLOW_SEGMENT_MAX_VIEWPORT_MULTIPLIER = 2;

function getFlowViewportWidth() {
  return getFlowLayoutViewportWidth();
}

function flowItemPath(item) {
  return typeof item === "string" ? item : item.src;
}

function flowTilePath(tileEl) {
  const mediaIndex = Number(tileEl.dataset.mediaIndex);
  if (!Number.isFinite(mediaIndex) || mediaIndex < 0) return "";
  const item = mediaItems[mediaIndex];
  return item ? flowItemPath(item) : "";
}

function getFlowVisibleTileSlots(viewportWidth, itemW, spacing) {
  return Math.max(2, Math.ceil((viewportWidth + spacing) / (itemW + spacing)) + 1);
}

/** True if `path` appears among the last `minDistance` tiles (prevents on-screen duplicates). */
function isPathBlockedByRecentTiles(tilesA, path, minDistance) {
  if (!path || minDistance <= 0) return false;
  const start = Math.max(0, tilesA.length - minDistance);
  for (let i = start; i < tilesA.length; i += 1) {
    if (flowTilePath(tilesA[i]) === path) return true;
  }
  return false;
}

function pickNextFlowEntry(itemsForRow, tilesA, minDistance, cursor, { allowReuse = false } = {}) {
  const n = itemsForRow.length;
  if (!n) return null;
  const gap = allowReuse ? minDistance : Math.max(minDistance, tilesA.length + 1);

  for (let offset = 0; offset < n; offset += 1) {
    const idx = (cursor + offset) % n;
    const entry = itemsForRow[idx];
    const path = flowItemPath(entry.item);
    if (!isPathBlockedByRecentTiles(tilesA, path, gap)) {
      return { entry, nextCursor: (idx + 1) % n };
    }
  }

  return null;
}

function cloneFlowMediaTile(original) {
  const clone = original.cloneNode(true);
  attachHoverAndClickBehavior(clone, Number(original.dataset.mediaIndex));
  return clone;
}

/** Order each row's images once with no adjacent duplicate paths. */
function orderRowItemsWithoutAdjacentDupes(itemsForRow) {
  const remaining = [...itemsForRow];
  const ordered = [];
  let prevPath = null;

  while (remaining.length) {
    let pickIdx = remaining.findIndex((entry) => flowItemPath(entry.item) !== prevPath);
    if (pickIdx === -1) pickIdx = 0;
    const entry = remaining.splice(pickIdx, 1)[0];
    ordered.push(entry);
    prevPath = flowItemPath(entry.item);
  }

  return ordered;
}

function computeFlowSegmentTargetWidth(viewportWidth, itemW, spacing, itemsForRowLength) {
  const tileStep = itemW + spacing;
  const minTiles = Math.max(2, Math.ceil((viewportWidth + tileStep) / tileStep));
  const minWidth = Math.max(
    minTiles * itemW + (minTiles - 1) * spacing,
    viewportWidth + tileStep * 2
  );

  const uncapped = viewportWidth + itemsForRowLength * tileStep;
  const capped = Math.min(uncapped, viewportWidth * FLOW_SEGMENT_MAX_VIEWPORT_MULTIPLIER);
  return { targetWidth: Math.max(minWidth, capped), maxTiles: Math.ceil(capped / tileStep) + itemsForRowLength };
}

function buildFlowSegmentTiles(itemsForRow, targetWidth, maxTiles, itemW, spacing, track, viewportWidth) {
  const tileStep = itemW + spacing;
  const visibleSlots = getFlowVisibleTileSlots(viewportWidth, itemW, spacing);
  /** Same image must not reappear within this many tiles (covers full viewport). */
  const minPathGap = Math.max(visibleSlots + 1, 3);
  const tilesA = [];
  let segmentWidthPx = 0;

  orderRowItemsWithoutAdjacentDupes(itemsForRow).forEach(({ item, mediaIndex }) => {
    const el = createFlowMediaElement(item, mediaIndex);
    track.appendChild(el);
    tilesA.push(el);
  });
  segmentWidthPx =
    tilesA.length > 0 ? tilesA.length * itemW + (tilesA.length - 1) * spacing : 0;

  const minFillWidth = viewportWidth + tileStep;
  let cursor = 0;
  while (segmentWidthPx < Math.max(targetWidth, minFillWidth) && tilesA.length < maxTiles) {
    const picked = pickNextFlowEntry(itemsForRow, tilesA, minPathGap, cursor, { allowReuse: false });
    if (!picked) break;

    const { entry, nextCursor } = picked;
    const el = createFlowMediaElement(entry.item, entry.mediaIndex);
    track.appendChild(el);
    tilesA.push(el);
    cursor = nextCursor;
    segmentWidthPx = tilesA.length * itemW + (tilesA.length - 1) * spacing;
  }

  if (tilesA.length > 1 && itemsForRow.length > 1) {
    const firstPath = flowTilePath(tilesA[0]);
    let lastPath = flowTilePath(tilesA[tilesA.length - 1]);
    let guard = 0;
    while (lastPath === firstPath && tilesA.length > 2 && guard < itemsForRow.length + 2) {
      guard += 1;
      const removed = tilesA.pop();
      track.removeChild(removed);
      segmentWidthPx =
        tilesA.length > 0 ? tilesA.length * itemW + (tilesA.length - 1) * spacing : 0;
      const repick = pickNextFlowEntry(itemsForRow, tilesA, minPathGap, cursor, { allowReuse: false });
      if (!repick) break;
      const { entry, nextCursor } = repick;
      const el = createFlowMediaElement(entry.item, entry.mediaIndex);
      track.appendChild(el);
      tilesA.push(el);
      cursor = nextCursor;
      lastPath = flowItemPath(entry.item);
      segmentWidthPx = tilesA.length * itemW + (tilesA.length - 1) * spacing;
    }
  }

  return { segmentWidthPx, tilesA };
}

function createFlowMediaElement(item, mediaIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "media-item";
  wrapper.dataset.mediaIndex = String(mediaIndex);

  if (typeof item === "string") {
    const img = document.createElement("img");
    img.src = item;
    img.alt = "";
    wrapper.appendChild(img);
  } else {
    const video = document.createElement("video");
    video.src = item.src;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    if (item.src.includes("GIF")) wrapper.classList.add("media-item--gif");
    wrapper.appendChild(video);
  }

  attachHoverAndClickBehavior(wrapper, mediaIndex);
  return wrapper;
}

function setupRows() {
  const rowsState = [];
  ROW_IDS.forEach((id) => {
    const rowElement = document.getElementById(id);
    if (!rowElement) return;
    rowElement.replaceChildren();
    const trackElement = document.createElement("div");
    trackElement.className = "gallery-flow-track";
    rowElement.appendChild(trackElement);
    rowsState.push({
      rowElement,
      trackElement,
      segmentWidthPx: 0,
      segmentTileCount: 0,
      /** Scroll accumulator; transform uses -positiveModulo(this, W) so the row stays filled. */
      trackScroll: 0,
      mediaElements: [],
    });
  });
  return rowsState;
}

function updateFlowLayoutWidths(rowsState) {
  const spacing = 10;
  const itemW = getFlowItemWidth();
  document.documentElement.style.setProperty("--flow-item-width", `${itemW}px`);

  rowsState.forEach((rowState, rowIndex) => {
    const tileCount = rowState.segmentTileCount || 0;
    if (!rowState.trackElement || tileCount <= 0) return;
    rowState.segmentWidthPx = tileCount * itemW + (tileCount - 1) * spacing;
    applyFlowTrackMotion(rowState, rowIndex);
  });
}

function measureAndPosition(rowsState, { forceRebuild = false } = {}) {
  const viewportWidth = getFlowViewportWidth();
  const spacing = 10;
  const itemW = getFlowItemWidth();
  document.documentElement.style.setProperty("--flow-item-width", `${itemW}px`);

  const canUpdateWidthsOnly =
    !forceRebuild &&
    rowsState.every(
      (row) =>
        (row.segmentTileCount || 0) > 0 &&
        row.trackElement &&
        row.trackElement.querySelector(".media-item")
    );
  if (canUpdateWidthsOnly) {
    updateFlowLayoutWidths(rowsState);
    return;
  }

  rowsState.forEach((rowState, rowIndex) => {
    if (!rowState?.trackElement) return;
    const track = rowState.trackElement;
    track.replaceChildren();

    const itemsForRow = mediaItems
      .map((item, mediaIndex) => ({ item, mediaIndex }))
      .filter(({ mediaIndex }) => (rowIndex === 0 ? mediaIndex % 2 === 0 : mediaIndex % 2 === 1));

    if (!itemsForRow.length) {
      rowState.segmentWidthPx = 0;
      rowState.segmentTileCount = 0;
      rowState.mediaElements = [];
      track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const { targetWidth, maxTiles } = computeFlowSegmentTargetWidth(
      viewportWidth,
      itemW,
      spacing,
      itemsForRow.length
    );
    const { segmentWidthPx, tilesA } = buildFlowSegmentTiles(
      itemsForRow,
      targetWidth,
      maxTiles,
      itemW,
      spacing,
      track,
      viewportWidth
    );

    tilesA.forEach((el) => {
      track.appendChild(cloneFlowMediaTile(el));
    });

    rowState.segmentWidthPx = segmentWidthPx;
    rowState.segmentTileCount = tilesA.length;
    rowState.mediaElements = Array.from(track.querySelectorAll(".media-item"));
    rowState.trackScroll = 0;
    applyFlowTrackMotion(rowState, rowIndex);
  });
}

/** CSS marquee on the compositor thread (stable in Safari while the page scrolls). */
function applyFlowTrackMotion(rowState, rowIndex) {
  const track = rowState.trackElement;
  const W = rowState.segmentWidthPx;
  if (!track || !(W > 0)) return;

  track.style.setProperty("--flow-segment-width", `${W}px`);
  track.classList.add("flow-marquee-active");

  if (getShouldReduceMotion()) {
    track.style.animation = "none";
    track.style.transform = "translate3d(0, 0, 0)";
    return;
  }

  const speed = (FLOW_BASE_SPEEDS[rowIndex] || FLOW_BASE_SPEEDS[0]) * flowMultiplier;
  const durationSec = W / speed;
  track.style.setProperty("--flow-marquee-duration", `${durationSec}s`);
  track.style.setProperty("--flow-marquee-direction", flowDirection < 0 ? "reverse" : "normal");
}

function refreshFlowTrackAnimations() {
  if (!galleryRowsState?.length) return;
  galleryRowsState.forEach((rowState, rowIndex) => {
    applyFlowTrackMotion(rowState, rowIndex);
  });
}

function startFlowAnimation(rowsState) {
  galleryRowsState = rowsState;
  refreshFlowTrackAnimations();
}

function createGridTile(item, mediaIndex) {
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "media-item portfolio-tile";
  tile.dataset.mediaIndex = String(mediaIndex);
  tile.dataset.kind = typeof item === "string" ? "stills" : "video";

  // Attach grouping metadata for full-gallery name-prefix sections.
  const src = typeof item === "string" ? item : item.src;
  const customGroup = fullGalleryCustomGroupByPath.get(src);
  if (customGroup) {
    tile.dataset.groupLabel = customGroup.label;
    tile.dataset.groupOrder = String(customGroup.order);
  } else {
    const numberGroup = getLeadingNumberGroup(src);
    if (numberGroup !== null) {
      tile.dataset.groupLabel = numberGroup;
      tile.dataset.groupOrder = numberGroup;
    } else {
      tile.dataset.groupLabel = "other";
      tile.dataset.groupOrder = "9999";
    }
  }

  if (typeof item === "string") {
    const img = document.createElement("img");
    img.src = item;
    img.alt = "";
    /* Eager: justified layout re-parents tiles on each pass; lazy + detach reloads and “pops”. */
    img.loading = "eager";
    img.decoding = "async";
    tile.appendChild(img);
  } else {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.dataset.src = item.src;
    tile.appendChild(video);
  }

  tile.addEventListener("click", () => {
    openLightboxFromIndex(mediaIndex);
  });
  return tile;
}

function readTileNaturalSize(tile) {
  const img = tile.querySelector("img");
  const video = tile.querySelector("video");
  if (img?.naturalWidth && img.naturalHeight) {
    return { nw: img.naturalWidth, nh: img.naturalHeight };
  }
  if (video?.videoWidth && video.videoHeight) {
    return { nw: video.videoWidth, nh: video.videoHeight };
  }
  const nw = parseFloat(tile.dataset.nw || "0");
  const nh = parseFloat(tile.dataset.nh || "0");
  if (nw > 0 && nh > 0) return { nw, nh };
  return { nw: 4, nh: 5 };
}

function waitForTileDimensions(tile) {
  return new Promise((resolve) => {
    const img = tile.querySelector("img");
    const video = tile.querySelector("video");
    const finish = (nw, nh) => {
      tile.dataset.nw = String(nw);
      tile.dataset.nh = String(nh);
      resolve(tile);
    };

    if (img) {
      if (img.complete && img.naturalWidth) {
        finish(img.naturalWidth, img.naturalHeight);
        return;
      }
      img.addEventListener(
        "load",
        () => finish(img.naturalWidth || 1, img.naturalHeight || 1),
        { once: true }
      );
      img.addEventListener("error", () => finish(4, 5), { once: true });
      return;
    }

    if (video) {
      if (video.dataset.src && !video.src) {
        video.src = video.dataset.src;
        video.load();
      }
      const fromVideo = () => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (vw && vh) finish(vw, vh);
        else finish(16, 9);
      };
      if (video.readyState >= 1 && video.videoWidth) {
        fromVideo();
        return;
      }
      video.addEventListener("loadedmetadata", fromVideo, { once: true });
      video.addEventListener("error", () => finish(16, 9), { once: true });
    } else {
      finish(4, 5);
    }
  });
}

/** Pack items into rows so each row spans the container width (Flickr-style). */
function packJustifiedRows(items, rowWidth, gap, minRowHeight, maxRowHeight) {
  const rows = [];
  let i = 0;
  while (i < items.length) {
    const row = [];
    while (i < items.length) {
      row.push(items[i]);
      i += 1;
      const sumA = row.reduce((s, t) => s + parseFloat(t.dataset.aspect || 1), 0);
      const n = row.length;
      const h = (rowWidth - (n - 1) * gap) / sumA;
      if (h < minRowHeight && row.length > 1) {
        i -= 1;
        row.pop();
        break;
      }
      if (h <= maxRowHeight) {
        break;
      }
    }
    if (row.length) rows.push(row);
  }
  return rows;
}

function getPortfolioGridContentWidth(grid) {
  const rect = grid.getBoundingClientRect();
  const styles = window.getComputedStyle(grid);
  const pl = parseFloat(styles.paddingLeft) || 0;
  const pr = parseFloat(styles.paddingRight) || 0;
  return Math.max(200, rect.width - pl - pr);
}

function renderJustifiedPortfolio(grid, tiles) {
  const visible = tiles.filter((t) => !t.classList.contains("is-hidden"));
  const isNarrowPhone = window.innerWidth <= 414;
  const gap = isNarrowPhone ? 10 : 16;
  const maxRowH = isNarrowPhone ? 240 : 320;
  const minRowH = isNarrowPhone ? 84 : 72;
  const W = getPortfolioGridContentWidth(grid);

  grid.textContent = "";
  if (!visible.length) return;

  const rows = packJustifiedRows(visible, W, gap, minRowH, maxRowH);

  rows.forEach((rowTiles) => {
    const rowEl = document.createElement("div");
    rowEl.className = "portfolio-row";
    rowEl.style.gap = `${gap}px`;
    const sumA = rowTiles.reduce((s, t) => s + parseFloat(t.dataset.aspect || 1), 0);
    const n = rowTiles.length;
    let h = (W - (n - 1) * gap) / sumA;
    if (h > maxRowH) h = maxRowH;

    rowTiles.forEach((tile) => {
      const a = parseFloat(tile.dataset.aspect || 1);
      const w = h * a;
      // Floor values to prevent 1px cumulative overflow on narrow screens.
      tile.style.width = `${Math.floor(w)}px`;
      tile.style.height = `${Math.floor(h)}px`;
      tile.style.flexShrink = "0";
      rowEl.appendChild(tile);
    });

    const usedW = rowTiles.reduce((s, t) => {
      const a = parseFloat(t.dataset.aspect || 1);
      return s + h * a;
    }, 0) + (n - 1) * gap;
    if (usedW < W - 2) {
      rowEl.classList.add("portfolio-row--short");
    }
    grid.appendChild(rowEl);
  });
}

function getTileAspect(tile) {
  const { nw, nh } = readTileNaturalSize(tile);
  const aspect = nw / nh;
  if (Number.isFinite(aspect) && aspect > 0) {
    tile.dataset.aspect = String(aspect);
    tile.dataset.nw = String(nw);
    tile.dataset.nh = String(nh);
    return aspect;
  }
  return parseFloat(tile.dataset.aspect || "1");
}

function prepareFullGalleryTile(tile) {
  tile.classList.add("full-gallery-tile");
  tile.classList.remove("full-gallery-tile--fullwidth");
  tile.style.width = "";
  tile.style.height = "";
  tile.style.flexShrink = "";
}

function appendTilesToFullGalleryGrid(gridEl, tileList) {
  tileList.forEach((tile) => {
    prepareFullGalleryTile(tile);
    gridEl.appendChild(tile);
  });
  // If odd count, let final image fill full row width to avoid empty half-gap.
  if (tileList.length % 2 === 1) {
    const lastTile = tileList[tileList.length - 1];
    lastTile?.classList.add("full-gallery-tile--fullwidth");
  }
}

function splitTilesByOrientation(tiles) {
  const landscapes = [];
  const portraits = [];
  tiles.forEach((tile) => {
    const aspect = getTileAspect(tile);
    if (aspect >= 1) landscapes.push(tile);
    else portraits.push(tile);
  });
  return { landscapes, portraits };
}

const PINNED_SHOW_LEAD_COUNT = 6;

function getTileAssetPath(tile) {
  const idx = Number(tile.dataset.mediaIndex);
  if (Number.isFinite(idx) && activeGalleryItems[idx]) {
    const item = activeGalleryItems[idx];
    return typeof item === "string" ? item : item.src;
  }
  const img = tile.querySelector("img");
  if (img?.src) {
    const match = img.src.match(/Assets\/optimized\/[^?#]+/);
    if (match) return match[0];
  }
  return "";
}

function sortTilesByAssetOrder(tiles, sourcePaths) {
  const order = new Map(sourcePaths.map((path, index) => [path, index]));
  return [...tiles].sort((a, b) => {
    const rankA = order.get(getTileAssetPath(a)) ?? 9999;
    const rankB = order.get(getTileAssetPath(b)) ?? 9999;
    return rankA - rankB;
  });
}

/** Single 2-column grid; tile order matches the array (source list order). */
function appendTilesInSourceOrderGrid(parentEl, tiles) {
  if (!tiles.length) return;
  const gridEl = document.createElement("div");
  gridEl.className = "portfolio-date-grid";
  appendTilesToFullGalleryGrid(gridEl, tiles);
  parentEl.appendChild(gridEl);
}

/** Preview row for a fixed pair; only places same-orientation shots side-by-side. */
function appendPreviewPairByOrientation(parentEl, tiles) {
  if (!tiles.length) return;
  const { landscapes, portraits } = splitTilesByOrientation(tiles);
  if (landscapes.length === tiles.length) {
    appendTilesInSourceOrderGrid(parentEl, landscapes);
  } else if (portraits.length === tiles.length) {
    appendTilesInSourceOrderGrid(parentEl, portraits);
  } else {
    appendTilesInOrientationGroups(parentEl, tiles);
  }
}

/** Render tiles in separate 2-col grids so landscapes and portraits are never side-by-side. */
function appendTilesInOrientationGroups(parentEl, tiles) {
  const { landscapes, portraits } = splitTilesByOrientation(tiles);
  if (landscapes.length) {
    const landscapeGrid = document.createElement("div");
    landscapeGrid.className = "portfolio-date-grid";
    appendTilesToFullGalleryGrid(landscapeGrid, landscapes);
    parentEl.appendChild(landscapeGrid);
  }
  if (portraits.length) {
    const portraitGrid = document.createElement("div");
    portraitGrid.className = "portfolio-date-grid";
    appendTilesToFullGalleryGrid(portraitGrid, portraits);
    parentEl.appendChild(portraitGrid);
  }
}

function pickSameOrientationPreviewPair(landscapes, portraits) {
  if (landscapes.length >= 2) return landscapes.slice(0, 2);
  if (portraits.length >= 2) return portraits.slice(0, 2);
  return [...landscapes, ...portraits].slice(0, 2);
}

// Full-gallery helper: group visible tiles by leading filename number and render
// each numeric bucket as its own section, ordered 1 -> n.
// First row stays fixed size; extra rows use the same height. Expand is CSS-only (no re-layout).
function renderJustifiedPortfolioByNamePrefix(grid, tiles) {
  const visible = tiles.filter((t) => !t.classList.contains("is-hidden"));
  const isFullGalleryPage = document.body.classList.contains("page-full-gallery");
  const isNarrowPhone = window.innerWidth <= 414;
  const baseGap = isNarrowPhone ? 10 : 16;
  const gap = isFullGalleryPage ? Math.round(baseGap * 0.8) : baseGap;

  if (isFullGalleryPage) {
    grid.style.setProperty("--portfolio-section-gap", `${gap}px`);
  }

  grid.textContent = "";
  if (!visible.length) return;

  // Group tiles by numeric filename prefix.
  const groups = new Map();
  visible.forEach((tile) => {
    const label = tile.dataset.groupLabel || "other";
    const order = Number(tile.dataset.groupOrder || 9999);
    const existing = groups.get(label);
    if (existing) {
      existing.tiles.push(tile);
    } else {
      groups.set(label, { order, tiles: [tile] });
    }
  });

  const sorted = Array.from(groups.entries()).sort(([, a], [, b]) => a.order - b.order);

  sorted.forEach(([label, group]) => {
    // User requested number-based grouping only; keep non-numbered items out.
    if (label === "other") return;
    if (EXCLUDED_NUMBERED_SHOW_GROUPS.has(label)) return;

    const section = document.createElement("section");
    section.className = "portfolio-date-group";
    if (isFullGalleryPage) {
      section.style.setProperty("--portfolio-section-gap", `${gap}px`);
    }

    const isExpanded = fullGalleryExpandedGroups.has(label);
    section.classList.add(isExpanded ? "portfolio-date-group--expanded" : "portfolio-date-group--collapsed");

    const headerRow = document.createElement("div");
    headerRow.className = "portfolio-date-header";
    const heading = document.createElement("h3");
    heading.className = "portfolio-date-heading";
    heading.textContent = fullGallerySectionTitles[label] || `Placeholder Heading ${label}_`;
    headerRow.appendChild(heading);

    const pinnedShow = getPinnedShowById(label);
    const usesStacksLayout = label === FULL_GALLERY_STACKS_RATS_NEST.id;
    const usesLeadLayout = PINNED_SHOWS_WITH_LEAD_LAYOUT.has(label);
    const layoutTiles = pinnedShow
      ? sortTilesByAssetOrder(group.tiles, pinnedShow.sources)
      : group.tiles;

    const rowsWrap = document.createElement("div");
    rowsWrap.className = "portfolio-date-rows";
    rowsWrap.style.setProperty("--portfolio-section-gap", `${gap}px`);

    let previewTiles;
    let extraTiles;
    if (usesStacksLayout) {
      previewTiles = layoutTiles.slice(0, 2);
      extraTiles = layoutTiles.slice(2);
    } else if (usesLeadLayout) {
      const leadTiles = layoutTiles.slice(0, PINNED_SHOW_LEAD_COUNT);
      const restTiles = layoutTiles.slice(PINNED_SHOW_LEAD_COUNT);
      previewTiles = leadTiles.slice(0, 2);
      extraTiles = [...leadTiles.slice(2), ...restTiles];
    } else {
      const { landscapes, portraits } = splitTilesByOrientation(layoutTiles);
      previewTiles = pickSameOrientationPreviewPair(landscapes, portraits);
      const previewTileSet = new Set(previewTiles);
      extraTiles = layoutTiles.filter((tile) => !previewTileSet.has(tile));
    }

    if (isFullGalleryPage && layoutTiles.length > previewTiles.length) {
      if (usesStacksLayout) {
        appendPreviewPairByOrientation(rowsWrap, previewTiles);
      } else if (usesLeadLayout) {
        appendTilesInSourceOrderGrid(rowsWrap, previewTiles);
      } else {
        const previewGrid = document.createElement("div");
        previewGrid.className = "portfolio-date-grid";
        appendTilesToFullGalleryGrid(previewGrid, previewTiles);
        rowsWrap.appendChild(previewGrid);
      }
      const chevronBtn = document.createElement("button");
      chevronBtn.type = "button";
      chevronBtn.className = "portfolio-date-chevron";
      chevronBtn.setAttribute("aria-expanded", String(isExpanded));
      chevronBtn.setAttribute("aria-label", isExpanded ? "Collapse section" : "Expand section");
      chevronBtn.textContent = isExpanded ? "▴" : "▾";

      const extraOuter = document.createElement("div");
      extraOuter.className = "portfolio-date-extra";
      if (isExpanded) {
        extraOuter.classList.add("portfolio-date-extra--open");
      }
      const extraInner = document.createElement("div");
      extraInner.className = "portfolio-date-extra-inner";
      if (usesStacksLayout) {
        appendTilesInOrientationGroups(extraInner, extraTiles);
      } else if (usesLeadLayout) {
        const leadRemainder = layoutTiles.slice(2, PINNED_SHOW_LEAD_COUNT);
        const restTiles = layoutTiles.slice(PINNED_SHOW_LEAD_COUNT);
        appendTilesInSourceOrderGrid(extraInner, leadRemainder);
        appendTilesInOrientationGroups(extraInner, restTiles);
      } else {
        appendTilesInOrientationGroups(extraInner, extraTiles);
      }
      if (extraInner.childElementCount > 0) {
        extraOuter.appendChild(extraInner);
      }
      rowsWrap.appendChild(extraOuter);

      chevronBtn.addEventListener("click", () => {
        const isOpen = extraOuter.classList.contains("portfolio-date-extra--open");
        if (isOpen) {
          fullGalleryExpandedGroups.delete(label);
          extraOuter.classList.remove("portfolio-date-extra--open");
          section.classList.remove("portfolio-date-group--expanded");
          section.classList.add("portfolio-date-group--collapsed");
          chevronBtn.setAttribute("aria-expanded", "false");
          chevronBtn.setAttribute("aria-label", "Expand section");
          chevronBtn.textContent = "▾";
        } else {
          fullGalleryExpandedGroups.add(label);
          extraOuter.classList.add("portfolio-date-extra--open");
          section.classList.remove("portfolio-date-group--collapsed");
          section.classList.add("portfolio-date-group--expanded");
          chevronBtn.setAttribute("aria-expanded", "true");
          chevronBtn.setAttribute("aria-label", "Collapse section");
          chevronBtn.textContent = "▴";
        }
      });

      headerRow.appendChild(chevronBtn);
    } else if (usesStacksLayout) {
      appendPreviewPairByOrientation(rowsWrap, layoutTiles.slice(0, 2));
      appendTilesInOrientationGroups(rowsWrap, layoutTiles.slice(2));
    } else if (usesLeadLayout) {
      const leadTiles = layoutTiles.slice(0, PINNED_SHOW_LEAD_COUNT);
      const restTiles = layoutTiles.slice(PINNED_SHOW_LEAD_COUNT);
      appendTilesInSourceOrderGrid(rowsWrap, leadTiles);
      appendTilesInOrientationGroups(rowsWrap, restTiles);
    } else {
      appendTilesInOrientationGroups(rowsWrap, layoutTiles);
    }

    section.appendChild(headerRow);
    section.appendChild(rowsWrap);
    grid.appendChild(section);
  });
}

function setupGridGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  const isFullGalleryPage = document.body.classList.contains("page-full-gallery");
  const sourceItems = isFullGalleryPage ? fullGalleryNumberedItems : mediaItems;
  activeGalleryItems = sourceItems;
  const fragment = document.createDocumentFragment();
  sourceItems.forEach((item, idx) => fragment.appendChild(createGridTile(item, idx)));
  grid.appendChild(fragment);

  const tiles = Array.from(grid.querySelectorAll(".media-item"));
  const metaEl = document.getElementById("portfolio-meta");
  const filterButtons = Array.from(document.querySelectorAll(".portfolio-filter[data-filter]"));
  const MAX_COLLAPSED_ITEMS = 12;
  let currentFilter = "all";
  const groupByNamePrefix = isFullGalleryPage;

  let toggleWrap = null;
  let toggleBtn = null;
  if (!isFullGalleryPage) {
    toggleWrap = document.createElement("div");
    toggleWrap.className = "portfolio-toggle";
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "portfolio-toggle__button";
    toggleBtn.textContent = "View full gallery";
    toggleWrap.appendChild(toggleBtn);
    grid.insertAdjacentElement("afterend", toggleWrap);
  }

  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const video = entry.target.querySelector("video");
              if (!video) return;
              if (entry.isIntersecting) {
                if (!video.src && video.dataset.src) {
                  video.src = video.dataset.src;
                  video.load();
                }
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            });
          },
          { rootMargin: "420px 0px 420px 0px", threshold: 0.01 }
        )
      : null;

  function applyFilter(filterValue) {
    currentFilter = filterValue;
    tiles.forEach((tile) => {
      const kind = tile.dataset.kind || "stills";
      const show =
        filterValue === "all" ||
        (filterValue === "stills" && kind === "stills") ||
        (filterValue === "video" && kind === "video");
      tile.classList.toggle("is-hidden", !show);
      tile.classList.remove("is-collapsed-hidden");
      if (!show) tile.querySelector("video")?.pause();
    });

    const matchingTiles = tiles.filter((t) => !t.classList.contains("is-hidden"));
    matchingTiles.forEach((tile, idx) => {
      const shouldHideForCollapse = !isFullGalleryPage && idx >= MAX_COLLAPSED_ITEMS;
      tile.classList.toggle("is-collapsed-hidden", shouldHideForCollapse);
      if (shouldHideForCollapse) tile.querySelector("video")?.pause();
    });

    if (!isFullGalleryPage && toggleWrap && toggleBtn) {
      const hasOverflow = matchingTiles.length > MAX_COLLAPSED_ITEMS;
      toggleWrap.classList.toggle("is-hidden", !hasOverflow);
      if (hasOverflow) {
        toggleBtn.textContent = "View full gallery";
      }
    }

    if (metaEl) {
      metaEl.textContent = `${matchingTiles.length} works`;
    }
    if (groupByNamePrefix) {
      renderJustifiedPortfolioByNamePrefix(grid, tiles);
    } else {
      renderJustifiedPortfolio(grid, tiles);
    }
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyFilter(btn.dataset.filter || "all");
    });
  });

  toggleBtn?.addEventListener("click", () => {
    const target = new URL("full-gallery.html", window.location.href);
    if (currentFilter && currentFilter !== "all") {
      target.searchParams.set("filter", currentFilter);
    }
    window.location.href = target.toString();
  });

  let resizeTimer;
  let lastGalleryWidth = window.innerWidth;
  function onResizeGallery() {
    const nextWidth = window.innerWidth;
    // Mobile browser chrome show/hide emits resize during scroll.
    // Re-layout only when width meaningfully changes.
    if (Math.abs(nextWidth - lastGalleryWidth) < 2) return;
    lastGalleryWidth = nextWidth;
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (groupByNamePrefix) {
        renderJustifiedPortfolioByNamePrefix(grid, tiles);
      } else {
        renderJustifiedPortfolio(grid, tiles);
      }
    }, 120);
  }
  window.addEventListener("resize", onResizeGallery);

  const requestedFilter = new URLSearchParams(window.location.search).get("filter");
  const initialFilter =
    requestedFilter === "stills" || requestedFilter === "video" ? requestedFilter : "all";
  const initialBtn = filterButtons.find((b) => (b.dataset.filter || "all") === initialFilter);
  if (initialBtn) {
    filterButtons.forEach((b) => b.classList.remove("is-active"));
    initialBtn.classList.add("is-active");
  }

  // Render immediately with available/fallback dimensions so gallery appears at once.
  tiles.forEach((t) => {
    const { nw, nh } = readTileNaturalSize(t);
    t.dataset.aspect = String(nw / nh);
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => applyFilter(initialFilter));
  });

  // Refine layout once intrinsic media dimensions are ready.
  Promise.all(tiles.map((t) => waitForTileDimensions(t))).then(() => {
    let needsRerender = false;
    tiles.forEach((t) => {
      const prevAspect = Number(t.dataset.aspect || 0);
      getTileAspect(t);
      const nextAspect = Number(t.dataset.aspect || 0);
      if (!Number.isFinite(prevAspect) || Math.abs(prevAspect - nextAspect) > 0.02) {
        needsRerender = true;
      }
    });
    if (!needsRerender) return;
    requestAnimationFrame(() => {
      if (groupByNamePrefix) {
        renderJustifiedPortfolioByNamePrefix(grid, tiles);
      } else {
        renderJustifiedPortfolio(grid, tiles);
      }
    });
  });

  if (io) tiles.forEach((tile) => io.observe(tile));
}

/** Pixels from viewport top where section content should align (fixed bar + small gap). */
function getFixedHeaderScrollOffset() {
  const bar = document.querySelector(".gallery-bar");
  const h = bar?.getBoundingClientRect().height ?? 0;
  const fallback = window.innerWidth <= 768 ? 104 : 128;
  return (h > 0 ? h : fallback) + 16;
}

function getPageScrollTop() {
  // Must match `getOnePageScrollRoot`: `body.scrollTop ?? …` is wrong when the
  // document scrolls on `document.scrollingElement` but `body.scrollTop` stays 0,
  // which makes scroll-spy + in-page math oscillate while scrolling.
  const body = document.body;
  const se = document.scrollingElement;
  if (body && body.scrollHeight > body.clientHeight) return body.scrollTop;
  if (se && se.scrollHeight > se.clientHeight) return se.scrollTop;
  return window.scrollY ?? document.documentElement?.scrollTop ?? 0;
}

/** Actual scroll container for the one-page layout (usually `body`). */
function getOnePageScrollRoot() {
  const body = document.body;
  const se = document.scrollingElement;
  if (body && body.scrollHeight > body.clientHeight) return body;
  if (se && se.scrollHeight > se.clientHeight) return se;
  return body || se || document.documentElement;
}

/**
 * Same scroll math as gallery menu in-page links (fixed header offset).
 * @param {Element} target
 * @param {{ instant?: boolean }} [options] Pass `{ instant: true }` for immediate jump (e.g. hire pill).
 */
function scrollToSectionWithOffset(target, options) {
  if (!target) return;
  const opts = options || {};
  const root = getOnePageScrollRoot();
  const currentTop = getPageScrollTop();
  const targetTop = target.getBoundingClientRect().top + currentTop;
  // Menu clicks were landing ~1in too high; reduce the header offset for nav jumps.
  const offset = Math.max(0, getFixedHeaderScrollOffset() - 96);
  const destination = Math.max(0, targetTop - offset);
  const instant =
    opts.instant === true || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (root === document.body || root === document.documentElement) {
    window.scrollTo({ top: destination, behavior: instant ? "auto" : "smooth" });
    return;
  }
  root.scrollTo({ top: destination, behavior: instant ? "auto" : "smooth" });
}

/**
 * Map URL hash fragment id to the element we scroll to on the home page,
 * matching `.gallery-bar__menu-link` targets (e.g. contact uses `#contact-heading`).
 * @param {string} hashId raw id without `#`
 */
function resolveIndexHashScrollTarget(hashId) {
  if (!hashId) return null;
  const id = decodeURIComponent(hashId.split("&")[0]);
  if (id === "contact-section") {
    return document.getElementById("contact-heading") || document.getElementById("contact-section");
  }
  if (id === "gallery-section" || id === "gallery-section-heading") {
    window.location.replace("full-gallery.html");
    return null;
  }
  return document.getElementById(id);
}

function setupMenuAndSections() {
  const isFullGalleryPage = document.body.classList.contains("page-full-gallery");
  const titleEl = document.getElementById("section-title");
  const menuContainer = document.getElementById("gallery-bar-menu");
  const menuLinks = Array.from(document.querySelectorAll(".gallery-bar__menu-link[href^='#']"));
  const allMenuLinks = Array.from(document.querySelectorAll(".gallery-bar__menu-link"));
  const sections = Array.from(document.querySelectorAll(".onepage-section"));

  /** After menu-driven in-page jumps, ignore scroll-spy briefly so it doesn’t fight smooth scroll. */
  let ignoreSpyUntil = 0;

  function clearBrandWidthMorph() {
    if (menuContainer) {
      menuContainer.style.removeProperty("width");
      menuContainer.style.removeProperty("transition");
    }
  }

  /** @param {string} label */
  function setActiveSection(label) {
    if (!titleEl) return;
    if (!label) return;
    if (titleEl.dataset.sectionLabel === label) return;

    clearBrandWidthMorph();

    titleEl.textContent = label;
    titleEl.dataset.sectionLabel = label;
    allMenuLinks.forEach((link) => {
      const linkLabel = (link.textContent || "").trim().toLowerCase();
      link.classList.toggle("is-hidden", linkLabel === label);
    });
  }

  let closeGalleryMenu = () => {};
  if (typeof window.setupGalleryBarMenu === "function") {
    const menuApi = window.setupGalleryBarMenu();
    closeGalleryMenu = (opts) => menuApi.closeMenu(opts);
  }

  // Scroll spy state (also synced from menu clicks so it never fights `scrollIntoView`).
  let spyActiveIndex = 0;
  let spyInitialized = false;
  const SPY_HYSTERESIS_PX = 56;

  function updateActiveSectionFromScroll() {
    if (!sections.length) return;
    if (typeof performance !== "undefined" && performance.now() < ignoreSpyUntil) return;

    const scrollY = getPageScrollTop();
    const tops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
    const probe = scrollY + getFixedHeaderScrollOffset();

    let raw = 0;
    for (let i = 0; i < sections.length; i += 1) {
      if (tops[i] <= probe) raw = i;
    }

    if (!spyInitialized) {
      spyActiveIndex = raw;
      spyInitialized = true;
    } else if (raw > spyActiveIndex) {
      spyActiveIndex = raw;
    } else if (raw < spyActiveIndex) {
      if (probe < tops[spyActiveIndex] - SPY_HYSTERESIS_PX) {
        spyActiveIndex = raw;
      }
    }

    const active = sections[spyActiveIndex];
    const label = active.dataset?.sectionLabel;
    if (label) setActiveSection(label);
  }

  menuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      const navLabel =
        target?.dataset?.sectionLabel ??
        target?.closest?.(".onepage-section")?.dataset?.sectionLabel;
      closeGalleryMenu({ instant: true });
      if (navLabel) {
        ignoreSpyUntil = performance.now() + 1100;
        setActiveSection(navLabel);
        const idx = sections.findIndex((s) => s.dataset.sectionLabel === navLabel);
        if (idx >= 0) {
          spyActiveIndex = idx;
          spyInitialized = true;
        }
      }
      if (target) {
        window.requestAnimationFrame(() => {
          if (navLabel === "home") {
            const root = getOnePageScrollRoot();
            if (root === document.body || root === document.documentElement) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              root.scrollTo({ top: 0, behavior: "smooth" });
            }
            return;
          }
          scrollToSectionWithOffset(target);
        });
      }
    });
  });

  // Scroll spy: keep the menu title aligned with whichever section has crossed
  // the header line (more reliable than a single IntersectionObserver threshold).
  let scrollSpyTicking = false;
  function onScrollSpy() {
    if (scrollSpyTicking) return;
    scrollSpyTicking = true;
    requestAnimationFrame(() => {
      scrollSpyTicking = false;
      updateActiveSectionFromScroll();
    });
  }

  const scrollRoot = getOnePageScrollRoot();
  scrollRoot.addEventListener("scroll", onScrollSpy, { passive: true });
  if (scrollRoot !== window) {
    window.addEventListener("scroll", onScrollSpy, { passive: true });
  }
  function onResizeSections() {
    clearBrandWidthMorph();
    spyInitialized = false;
    updateActiveSectionFromScroll();
  }

  window.addEventListener("resize", onResizeSections);
  if (isFullGalleryPage) {
    setActiveSection("gallery");
  } else {
    updateActiveSectionFromScroll();
  }

  // Cross-page links (e.g. full gallery → index.html#contact-heading) use the browser's
  // default hash scroll, which does not match our menu's scrollToSectionWithOffset.
  if (!isFullGalleryPage) {
    function applyInitialHashNavigation() {
      const raw = (window.location.hash || "").trim();
      if (!raw || raw === "#") return;
      const hashId = raw.slice(1);
      const el = resolveIndexHashScrollTarget(hashId);
      if (!el) return;

      const navLabel =
        el.dataset?.sectionLabel ?? el.closest?.(".onepage-section")?.dataset?.sectionLabel;
      if (navLabel) {
        ignoreSpyUntil = performance.now() + 1100;
        setActiveSection(navLabel);
        const idx = sections.findIndex((s) => s.dataset.sectionLabel === navLabel);
        if (idx >= 0) {
          spyActiveIndex = idx;
          spyInitialized = true;
        }
      }
      window.requestAnimationFrame(() => scrollToSectionWithOffset(el));
    }
    applyInitialHashNavigation();
  }
}

function setupContactBackgroundCrossfade() {
  // Contact page background: keep a single static hero image.
  const bgA = document.querySelector(".contact-bg__layer--a");
  const bgB = document.querySelector(".contact-bg__layer--b");
  if (!bgA || !bgB) return;

  const bgImages = CONTACT_BG_IMAGES;

  // Preload to avoid flashes/black frames.
  bgImages.forEach(function (src) {
    const img = new Image();
    img.src = src;
  });

  function setLayer(el, src) {
    el.style.backgroundImage = 'url("' + src + '")';
  }

  const heroSrc = bgImages[0];
  // Keep only the first image visible and disable slideshow transitions.
  setLayer(bgA, heroSrc);
  bgA.classList.add("is-visible");
  bgB.classList.remove("is-visible");

  const contactSection = document.querySelector(".page--onepage .onepage-section--contact");
  const aspectProbe = new Image();
  aspectProbe.addEventListener("load", () => {
    const w = aspectProbe.naturalWidth;
    const h = aspectProbe.naturalHeight;
    if (!(w > 0 && h > 0)) return;
    const aspect = `${w} / ${h}`;
    document.documentElement.style.setProperty("--contact-bg-aspect", aspect);
    contactSection?.style.setProperty("--contact-bg-aspect", aspect);
  });
  aspectProbe.src = heroSrc;
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const subject = form.querySelector('[name="subject"]')?.value || "";
    const body = form.querySelector('[name="body"]')?.value || "";
    const mailto =
      "mailto:zachariahsavage@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    window.location.href = mailto;
  });
}

function setupHireAvailabilityPill() {
  const isFullGalleryPage = document.body.classList.contains("page-full-gallery");
  if (isFullGalleryPage) return;
  const hash = (window.location.hash || "").toLowerCase();
  if (hash === "#contact-section" || hash === "#contact-heading") return;

  const contactTarget = document.getElementById("contact-heading");
  if (!contactTarget) return;
  const contactSection = document.getElementById("contact-section");
  if (!contactSection) return;

  const cta = document.createElement("div");
  cta.className = "hire-pill-cta";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "hire-pill-cta__close";
  closeBtn.setAttribute("aria-label", "Dismiss");
  closeBtn.textContent = "✕";

  const actionBtn = document.createElement("button");
  actionBtn.type = "button";
  actionBtn.className = "hire-pill-cta__action";
  actionBtn.setAttribute("aria-label", "Go to contact section");
  actionBtn.innerHTML =
    'Zach is available for hire. <span class="hire-pill-cta__link">Send Inquiry!</span>';

  function goToContactFromHirePill() {
    // Same destination/offset as the header menu; always jump (no smooth scroll) so one tap feels immediate.
    scrollToSectionWithOffset(contactTarget, { instant: true });
  }

  function onHirePillNavigate(e) {
    e.preventDefault();
    e.stopPropagation();
    if (cta.classList.contains("hire-pill-cta--dismissed")) return;
    cta.classList.add("hire-pill-cta--dismissed");
    goToContactFromHirePill();
  }

  // `pointerup`: runs as the finger lifts on mobile (before the delayed synthetic `click`).
  // `click`: keyboard / fallback when `pointerup` did not run.
  actionBtn.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!e.isPrimary) return;
    onHirePillNavigate(e);
  });
  actionBtn.addEventListener("click", onHirePillNavigate);
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    cta.classList.add("hire-pill-cta--dismissed");
  });

  cta.appendChild(closeBtn);
  cta.appendChild(actionBtn);
  document.body.appendChild(cta);

  let shown = false;
  let lastTop = getPageScrollTop();
  function getContactEntryTriggerTop() {
    const sectionTop = contactSection.getBoundingClientRect().top + getPageScrollTop();
    return Math.max(0, sectionTop - getFixedHeaderScrollOffset());
  }

  function maybeShow() {
    if (shown) return;
    if (cta.classList.contains("hire-pill-cta--dismissed")) return;
    const top = getPageScrollTop();
    const delta = top - lastTop;
    const triggerTop = getContactEntryTriggerTop();
    const crossedIntoContactFromAbove = delta > 0 && lastTop < triggerTop && top >= triggerTop;
    lastTop = top;
    if (crossedIntoContactFromAbove) {
      shown = true;
      // Next frame: allow CSS transition to run.
      requestAnimationFrame(() => cta.classList.add("is-visible"));
      window.removeEventListener("scroll", maybeShow);
    }
  }

  // Listen on `window`: when `body` is not the scroll container, `body` scroll events never fire.
  window.addEventListener("scroll", maybeShow, { passive: true });
}

function setupHeaderPillsScrollFade() {
  const centerTitle = document.querySelector(".page-center-title");
  const menuPill = document.querySelector(".gallery-bar__brand");
  if (!centerTitle && !menuPill) return;

  let lastTop = getPageScrollTop();
  let ticking = false;
  const deltaThreshold = 2;

  function update() {
    ticking = false;
    const top = getPageScrollTop();
    const delta = top - lastTop;
    lastTop = top;

    if (top <= 8) {
      if (centerTitle) centerTitle.classList.remove("page-center-title--hidden");
      if (menuPill) menuPill.classList.remove("gallery-bar__brand--scroll-hidden");
      return;
    }

    if (delta > deltaThreshold) {
      if (centerTitle) centerTitle.classList.add("page-center-title--hidden");
      if (menuPill && !menuPill.classList.contains("gallery-bar__brand--open")) {
        menuPill.classList.add("gallery-bar__brand--scroll-hidden");
      }
    } else if (delta < -deltaThreshold) {
      if (menuPill && !menuPill.classList.contains("gallery-bar__brand--open")) {
        menuPill.classList.remove("gallery-bar__brand--scroll-hidden");
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  const scrollRoot = getOnePageScrollRoot();
  scrollRoot.addEventListener("scroll", onScroll, { passive: true });
  if (scrollRoot !== window) {
    window.addEventListener("scroll", onScroll, { passive: true });
  }
}

window.addEventListener("load", () => {
  const rowsState = setupRows();
  galleryRowsState = rowsState;
  let flowStarted = false;
  function runFlowMeasure() {
    measureAndPosition(rowsState);
    const flowReady = rowsState.every((row) => row.segmentWidthPx > 0);
    if (!flowStarted && flowReady) {
      startFlowAnimation(rowsState);
      flowStarted = true;
    }
    attachFlowScrollFadeObserver();
    attachContactScrollFadeObserver();
  }

  initFlowScrollFade();
  initContactScrollFade();

  // iOS Safari: wait for layout; remeasure only if viewport width actually changed.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const widthAtPaint = getFlowViewportWidth();
      runFlowMeasure();
      setTimeout(() => {
        const widthNow = Math.round(
          document.documentElement.clientWidth || window.innerWidth
        );
        if (Math.abs(widthNow - widthAtPaint) >= 2) {
          if (!flowStarted) {
            unlockFlowLayoutViewportWidth();
            measureAndPosition(rowsState, { forceRebuild: true });
            if (rowsState.every((row) => row.segmentWidthPx > 0) && !flowStarted) {
              startFlowAnimation(rowsState);
              flowStarted = true;
            }
          } else {
            updateFlowLayoutWidths(rowsState);
          }
        }
        lockFlowLayoutViewportWidth();
      }, 280);
    });
  });

  lightbox = document.querySelector(".lightbox");
  lightboxImage = document.querySelector(".lightbox__image");
  lightboxVideo = document.querySelector(".lightbox__video");
  lightboxCloseBtn = document.querySelector(".lightbox__close");
  lightboxPrevBtn = document.querySelector(".lightbox__arrow--prev");
  lightboxNextBtn = document.querySelector(".lightbox__arrow--next");
  lightboxCloseBtn?.addEventListener("click", closeLightbox);
  lightboxPrevBtn?.addEventListener("click", () => changeLightboxBy(-1));
  lightboxNextBtn?.addEventListener("click", () => changeLightboxBy(1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target === document.querySelector(".lightbox__backdrop")) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (lightbox?.getAttribute("data-state") !== "open") return;
    if (event.key === "Escape") closeLightbox();
    else if (event.key === "ArrowLeft") changeLightboxBy(-1);
    else if (event.key === "ArrowRight") changeLightboxBy(1);
  });

  const flowGallery = document.querySelector(".gallery");
  flowGallery?.addEventListener("mouseleave", () => {
    magneticCursorX = null;
    magneticCursorY = null;
    magneticCursorItem = null;
    galleryRowsState?.forEach((row) =>
      row.mediaElements?.forEach((el) => el.style.setProperty("--scale", "1"))
    );
  });

  let resizeTimeout;
  let lastFlowLayoutWidth = Math.round(
    document.documentElement.clientWidth || window.innerWidth
  );
  const flowRemeasureWidthDelta = () => (isFlowMobileLayout() ? 56 : 2);

  function scheduleFlowRemeasure() {
    const nextWidth = Math.round(
      document.documentElement.clientWidth || window.innerWidth
    );
    if (Math.abs(nextWidth - lastFlowLayoutWidth) < flowRemeasureWidthDelta()) return;
    lastFlowLayoutWidth = nextWidth;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (isFlowMobileLayout()) {
        unlockFlowLayoutViewportWidth();
        flowLayoutViewportWidth = nextWidth;
        lockFlowLayoutViewportWidth();
      }
      const flowReady = rowsState.every((row) => (row.segmentTileCount || 0) > 0);
      if (flowReady) {
        updateFlowLayoutWidths(rowsState);
      } else {
        measureAndPosition(rowsState, { forceRebuild: true });
      }
      refreshFlowTrackAnimations();
    }, 150);
  }
  window.addEventListener("resize", scheduleFlowRemeasure);

  let contactFadeResizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(contactFadeResizeTimeout);
    contactFadeResizeTimeout = setTimeout(setupContactScrollFadeOnResize, 150);
  });

  setupGridGallery();
  setupScrollReveal();
  setupMenuAndSections();
  setupContactBackgroundCrossfade();
  setupContactForm();
  setupHireAvailabilityPill();
  setupHeaderPillsScrollFade();
});
