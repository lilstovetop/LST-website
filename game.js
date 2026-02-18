const PAGE_COUNT = 4;
const GRID_COLS = 4;
const GRID_ROWS = 3;
const SLOTS_PER_PAGE = GRID_COLS * GRID_ROWS;
const TOTAL_SLOTS = PAGE_COUNT * SLOTS_PER_PAGE;

const pagesTrack = document.getElementById("pagesTrack");
const pageDots = document.getElementById("pageDots");
const dateLabel = document.getElementById("dateLabel");
const prevPageButton = document.getElementById("prevPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const addChannelButton = document.getElementById("addChannelButton");
const menuViewport = document.getElementById("menuViewport");
const pageTemplate = document.getElementById("pageTemplate");

const initialChannels = [
  {
    title: "Twitter",
    subtitle: "twitter.com",
    theme: "theme-internet",
    url: "https://x.com/lilstovetop",
  },
  { title: "Mii Channel", subtitle: "Nintendo", theme: "theme-mii" },
  { title: "Photo Channel", subtitle: "Nintendo", theme: "theme-photo" },
  { title: "Forecast Channel", subtitle: "Wii", theme: "theme-forecast" },
  { title: "News Channel", subtitle: "Wii", theme: "theme-news" },
  { title: "Wii Shop Channel", subtitle: "Wii", theme: "theme-shop" },
  { title: "Internet Channel", subtitle: "Wii", theme: "theme-internet" },
  { title: "Virtual Console", subtitle: "Nintendo", theme: "theme-vc" },
];

const downloadThemes = ["theme-download-a", "theme-download-b", "theme-download-c"];

let currentPage = 0;

const channels = Array.from({ length: TOTAL_SLOTS }, (_, index) => {
  if (index < initialChannels.length) {
    return { ...initialChannels[index] };
  }
  return null;
});

function animateTileLaunch(tile) {
  tile.classList.remove("launching");
  void tile.offsetWidth;
  tile.classList.add("launching");
}

function renderPages() {
  pagesTrack.innerHTML = "";

  for (let pageIndex = 0; pageIndex < PAGE_COUNT; pageIndex += 1) {
    const page = pageTemplate.content.firstElementChild.cloneNode(true);
    page.setAttribute("aria-label", `Menu page ${pageIndex + 1}`);
    const grid = page.querySelector(".channel-grid");

    for (let slot = 0; slot < SLOTS_PER_PAGE; slot += 1) {
      const channelIndex = pageIndex * SLOTS_PER_PAGE + slot;
      const channel = channels[channelIndex];
      const tile = document.createElement(channel?.url ? "a" : "button");

      if (channel?.url) {
        tile.href = channel.url;
        tile.target = "_blank";
        tile.rel = "noopener noreferrer";
      } else {
        tile.type = "button";
      }

      tile.className = channel
        ? `channel-tile filled ${channel.theme}`
        : "channel-tile empty";

      tile.setAttribute(
        "aria-label",
        channel ? `${channel.title}` : `Empty channel slot ${channelIndex + 1}`,
      );

      const content = document.createElement("div");
      content.className = "tile-content";

      const name = document.createElement("p");
      name.className = "tile-name";
      name.textContent = channel ? channel.title : "Empty";

      const sub = document.createElement("p");
      sub.className = "tile-sub";
      sub.textContent = channel ? channel.subtitle : "";

      content.append(name, sub);
      tile.append(content);

      if (channel) {
        tile.addEventListener("click", () => {
          animateTileLaunch(tile);
        });
      }

      grid.appendChild(tile);
    }

    pagesTrack.appendChild(page);
  }
}

function renderDots() {
  pageDots.innerHTML = "";

  for (let page = 0; page < PAGE_COUNT; page += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = page === currentPage ? "dot active" : "dot";
    dot.setAttribute("aria-label", `Go to page ${page + 1}`);
    dot.addEventListener("click", () => {
      currentPage = page;
      updateNavigation();
    });
    pageDots.appendChild(dot);
  }
}

function updateNavigation() {
  pagesTrack.style.transform = `translateX(-${currentPage * 100}%)`;
  prevPageButton.disabled = currentPage === 0;
  nextPageButton.disabled = currentPage === PAGE_COUNT - 1;
  renderDots();
}

function changePage(direction) {
  const nextPage = Math.max(0, Math.min(PAGE_COUNT - 1, currentPage + direction));
  if (nextPage === currentPage) {
    return;
  }

  currentPage = nextPage;
  updateNavigation();
}

function addChannel() {
  const nextEmpty = channels.findIndex((channel) => channel === null);
  if (nextEmpty === -1) {
    addChannelButton.textContent = "FULL";
    addChannelButton.disabled = true;
    return;
  }

  const number = nextEmpty + 1;
  const theme = downloadThemes[nextEmpty % downloadThemes.length];

  channels[nextEmpty] = {
    title: `Downloaded ${number}`,
    subtitle: "WiiWare",
    theme,
  };

  renderPages();
  currentPage = Math.floor(nextEmpty / SLOTS_PER_PAGE);
  updateNavigation();
}

function updateDateLabel() {
  const now = new Date();
  const weekday = now.toLocaleDateString(undefined, { weekday: "short" });
  const date = now.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
  });

  dateLabel.textContent = `${weekday} ${date}`;
}

let touchStartX = 0;

menuViewport.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
});

menuViewport.addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) < 42) {
    return;
  }

  if (deltaX > 0) {
    changePage(-1);
  } else {
    changePage(1);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    changePage(-1);
  } else if (event.key === "ArrowRight") {
    changePage(1);
  } else if (event.key.toLowerCase() === "a" || event.key === "+") {
    addChannel();
  }
});

prevPageButton.addEventListener("click", () => changePage(-1));
nextPageButton.addEventListener("click", () => changePage(1));
addChannelButton.addEventListener("click", addChannel);

renderPages();
updateNavigation();
updateDateLabel();
setInterval(updateDateLabel, 30000);
