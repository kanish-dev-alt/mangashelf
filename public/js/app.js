

let featuredManga = [];
let latestManga = [];

const featuredGrid = document.getElementById("featuredGrid");
const latestGrid = document.getElementById("latestGrid");
const dotsContainer = document.getElementById("carouselDots");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

let activeSlide = 0;
let searchTerm = "";

const bookmarks = new Set();

const mangaThemes = {
  "One Piece": { symbol: "海賊", a: "#32a9df", b: "#103a67" },
  "Bleach": { symbol: "斬", a: "#b8b8c9", b: "#25253f" },
  "Naruto": { symbol: "忍", a: "#ff9c35", b: "#742d1b" },
  "Re:Zero": { symbol: "零", a: "#a7c9e9", b: "#493b70" },
  "Hunter x Hunter": { symbol: "狩", a: "#8bd7a0", b: "#18553b" },
  "Sword Art Online": { symbol: "剣", a: "#7fc9ef", b: "#182f6a" },
  "Tokyo Ghoul": { symbol: "喰", a: "#d54d59", b: "#291521" },
  "Black Clover": { symbol: "魔", a: "#79b6b1", b: "#1a3340" }
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Load manga records from MySQL through Express
async function loadManga() {
  latestGrid.innerHTML = "<p>Loading manga...</p>";

  try {
    const response = await fetch("/api/manga");

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid manga API response");
    }

    latestManga = result.data.map(manga => {
      const theme = mangaThemes[manga.title] || {
        symbol: "漫",
        a: "#8b8db5",
        b: "#25253f"
      };

      return {
        id: manga.series_id,
        title: manga.title,
        author: manga.author,
        genre: manga.genre || "Uncategorized",
        description: manga.description || "No description available.",
        publisher: manga.publisher || "",
        illustrator: manga.illustrator || "",
        totalVolumes: Number(manga.total_volumes) || 0,
        totalCopies: Number(manga.total_copies) || 0,
        availableCopies: Number(manga.available_copies) || 0,
        coverImage: manga.cover_image_url,
        ...theme
      };
    });

    featuredManga = latestManga.map(manga => ({
      ...manga,
      eyebrow: manga.genre.replace(/,\s*/g, " · ")
    }));

    activeSlide = 0;
    renderFeatured();
    renderLatest();

  } catch (error) {
    console.error("Unable to load manga:", error);

    latestGrid.innerHTML = `
      <p>Unable to load manga from the database.</p>
      <button type="button" id="retryManga">Try Again</button>
    `;

    document.getElementById("retryManga")
      .addEventListener("click", loadManga);

    resultCount.textContent = "Unable to load manga";
    emptyState.hidden = true;
  }
}

// Reusable manga cover for the bottom cards
function coverMarkup(item, extraClass = "") {
  if (item.coverImage) {
    return `
      <div class="${extraClass} image-cover">
        <img
          src="${escapeHTML(item.coverImage)}"
          alt="${escapeHTML(item.title)} cover"
          loading="lazy"
          onerror="this.style.display='none'"
        >
      </div>`;
  }

  return `
    <div class="${extraClass}"
         style="--cover-a:${item.a};--cover-b:${item.b}">
      <span>${escapeHTML(item.symbol)}</span>
    </div>`;
}

// Featured carousel - FIXED to show real cover images
function renderFeatured() {
  featuredGrid.innerHTML = "";
  dotsContainer.innerHTML = "";

  if (featuredManga.length === 0) return;

  const visibleItems = [
    featuredManga[
      (activeSlide + featuredManga.length - 1) % featuredManga.length
    ],
    featuredManga[activeSlide],
    featuredManga[
      (activeSlide + 1) % featuredManga.length
    ]
  ];

  visibleItems.forEach((item, index) => {
    const card = document.createElement("article");

    card.className = "featured-card" +
      (index === 1 ? " featured-center" : "");

    card.innerHTML = `
      <div class="cover-art"
           style="--cover-a:${item.a};--cover-b:${item.b}">

        ${
          item.coverImage
            ? `<img
                 class="featured-cover-image"
                 src="${escapeHTML(item.coverImage)}"
                 alt="${escapeHTML(item.title)} cover"
               >`
            : `<span class="cover-symbol">
                 ${escapeHTML(item.symbol)}
               </span>`
        }

        <span class="cover-caption">
          ${escapeHTML(item.eyebrow)}
        </span>
      </div>

      <div class="featured-content">
        <span class="eyebrow">Featured manga</span>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.description)}</p>

        <p class="inventory-info">
          ${item.totalVolumes} volume(s) ·
          ${item.availableCopies} copies available
        </p>

        <div class="featured-actions">
          <button class="read-button read-featured" type="button">
            ▣ View Volumes
          </button>

          <button
            class="bookmark-button ${bookmarks.has(item.title) ? "saved" : ""}"
            type="button"
            aria-label="Bookmark ${escapeHTML(item.title)}"
            aria-pressed="${bookmarks.has(item.title)}">
            ${bookmarks.has(item.title) ? "♥" : "♧"}
          </button>
        </div>
      </div>
    `;

    card.querySelector(".read-featured")
      .addEventListener("click", () => viewVolumes(item));

    card.querySelector(".bookmark-button")
      .addEventListener("click", () => toggleBookmark(item.title));

    featuredGrid.appendChild(card);
  });

  dotsContainer.innerHTML = featuredManga.map((item, index) => `
    <button
      type="button"
      class="${index === activeSlide ? "active" : ""}"
      aria-label="Show ${escapeHTML(item.title)}"
      aria-current="${index === activeSlide ? "true" : "false"}"
      data-slide="${index}">
    </button>
  `).join("");

  dotsContainer.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      activeSlide = Number(button.dataset.slide);
      renderFeatured();
    });
  });
}

// Latest manga cards
function renderLatest() {
  const filtered = latestManga.filter(item =>
    `${item.title} ${item.author} ${item.genre} ${item.publisher}`
      .toLowerCase()
      .includes(searchTerm)
  );

  latestGrid.innerHTML = filtered.map(item => `
    <article class="latest-card">
      ${coverMarkup(item, "latest-cover")}

      <div class="latest-info">
        <h3>${escapeHTML(item.title)}</h3>
        <p class="author">${escapeHTML(item.author)}</p>
        <p class="genre">${escapeHTML(item.genre)}</p>

        <p class="inventory-info">
          Volumes: ${item.totalVolumes}
        </p>

        <p class="inventory-info">
          Available copies: ${item.availableCopies} / ${item.totalCopies}
        </p>

        <button
          class="read-button"
          type="button"
          data-volume-id="${item.id}">
          ▣ View Volumes
        </button>

        <button
          class="bookmark-button ${bookmarks.has(item.title) ? "saved" : ""}"
          type="button"
          aria-label="Bookmark ${escapeHTML(item.title)}"
          aria-pressed="${bookmarks.has(item.title)}"
          data-bookmark="${escapeHTML(item.title)}">
          ${bookmarks.has(item.title) ? "♥" : "♧"}
        </button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
  resultCount.textContent = `${filtered.length} manga titles`;

  latestGrid.querySelectorAll("[data-volume-id]").forEach(button => {
    button.addEventListener("click", () => {
      const manga = latestManga.find(
        item => item.id === Number(button.dataset.volumeId)
      );

      if (manga) viewVolumes(manga);
    });
  });

  latestGrid.querySelectorAll("[data-bookmark]").forEach(button => {
    button.addEventListener("click", () => {
      toggleBookmark(button.dataset.bookmark);
    });
  });
}

// Get volume details from the database
async function viewVolumes(manga) {
  let modal = document.getElementById("volumeModal");

  // Create the modal only once
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "volumeModal";
    modal.className = "volume-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "volumeModalTitle");

    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="volume-modal-backdrop"></div>
    <div class="volume-modal-content">
      <button class="volume-modal-close"
              type="button"
              aria-label="Close volume details">&times;</button>

      <div class="volume-modal-header">
        <div>
          <p class="volume-modal-label">MANGASHELF COLLECTION</p>
          <h2 id="volumeModalTitle">${escapeHTML(manga.title)}</h2>
          <p class="volume-modal-author">
            By ${escapeHTML(manga.author)}
          </p>
        </div>

        ${
          manga.coverImage
            ? `<img class="volume-modal-cover"
                    src="${escapeHTML(manga.coverImage)}"
                    alt="${escapeHTML(manga.title)} cover">`
            : ""
        }
      </div>

      <div class="volume-modal-body">
        <p class="volume-loading">Loading volume details...</p>
      </div>
    </div>
  `;

  modal.classList.add("open");
  document.body.classList.add("modal-open");

  modal.querySelector(".volume-modal-close")
    .addEventListener("click", closeVolumeModal);

  modal.querySelector(".volume-modal-backdrop")
    .addEventListener("click", closeVolumeModal);

  // Allow closing with the Escape key
  modal.onkeydown = event => {
    if (event.key === "Escape") closeVolumeModal();
  };

  try {
    const response = await fetch(`/api/manga/${manga.id}/volumes`);

    if (!response.ok) {
      throw new Error("Could not fetch volumes");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Volume request failed");
    }

    const body = modal.querySelector(".volume-modal-body");

    if (!result.data || result.data.length === 0) {
      body.innerHTML = `
        <div class="volume-empty">
          <span class="volume-empty-icon">📚</span>
          <h3>No volumes added yet</h3>
          <p>There are no volume records for this manga.</p>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="volume-summary">
        <div class="volume-stat">
          <span>Total volumes</span>
          <strong>${result.data.length}</strong>
        </div>
        <div class="volume-stat">
          <span>Total copies</span>
          <strong>${result.data.reduce(
            (sum, v) => sum + Number(v.total_copies || 0), 0
          )}</strong>
        </div>
        <div class="volume-stat">
          <span>Available copies</span>
          <strong>${result.data.reduce(
            (sum, v) => sum + Number(v.available_copies || 0), 0
          )}</strong>
        </div>
      </div>

      <div class="volume-list">
        ${result.data.map(volume => `
          <article class="volume-item">
            <div class="volume-number">
              <span>VOLUME</span>
              <strong>${escapeHTML(volume.volume_number)}</strong>
            </div>

            <div class="volume-details">
              <h3>${escapeHTML(manga.title)} — Volume ${escapeHTML(volume.volume_number)}</h3>

              <p>
                <span>Edition</span>
                ${escapeHTML(volume.edition || "Standard")}
              </p>

              <p>
                <span>ISBN</span>
                ${escapeHTML(volume.isbn || "Not provided")}
              </p>

              <p>
                <span>Language</span>
                ${escapeHTML(volume.language || "Unknown")}
              </p>

              <p>
                <span>Publication date</span>
                ${
                  volume.publication_date
                    ? escapeHTML(String(volume.publication_date).slice(0, 10))
                    : "Not provided"
                }
              </p>

              <div class="volume-stock">
                <span>
                  ${Number(volume.available_copies) > 0
                    ? "Available"
                    : "Out of stock"}
                </span>
                <strong>
                  ${Number(volume.available_copies || 0)}
                  / ${Number(volume.total_copies || 0)} copies
                </strong>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  } catch (error) {
    console.error("Volume details error:", error);

    const body = modal.querySelector(".volume-modal-body");

    if (body) {
      body.innerHTML = `
        <div class="volume-empty">
          <h3>Unable to load volumes</h3>
          <p>Please check your server and try again.</p>
          <button class="read-button" id="retryVolumeLoad" type="button">
            Try Again
          </button>
        </div>
      `;

      document.getElementById("retryVolumeLoad")
        .addEventListener("click", () => viewVolumes(manga));
    }
  }
}

function closeVolumeModal() {
  const modal = document.getElementById("volumeModal");

  if (modal) {
    modal.classList.remove("open");
  }

  document.body.classList.remove("modal-open");
}


// Bookmarks
function toggleBookmark(title) {
  if (bookmarks.has(title)) {
    bookmarks.delete(title);
  } else {
    bookmarks.add(title);
  }

  renderFeatured();
  renderLatest();
}

// Previous carousel item
document.getElementById("previousButton")
  .addEventListener("click", () => {
    if (featuredManga.length === 0) return;

    activeSlide =
      (activeSlide - 1 + featuredManga.length) % featuredManga.length;

    renderFeatured();
  });

// Next carousel item
document.getElementById("nextButton")
  .addEventListener("click", () => {
    if (featuredManga.length === 0) return;

    activeSlide = (activeSlide + 1) % featuredManga.length;
    renderFeatured();
  });

// Search
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderLatest();
});

// Mobile navigation
document.getElementById("menuToggle")
  .addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("open");
  });

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.remove("open");
  });
});

// Start MangaShelf
loadManga();
