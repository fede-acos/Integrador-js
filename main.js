const BASE_URL_TOP_STORIES = "https://api.nytimes.com/svc/topstories/v2";
const BASE_URL_SEARCH =
  "https://api.nytimes.com/svc/search/v2/articlesearch.json?";
const STORAGE_KEY = "news-cache";
const API_KEY = "api-key=0gXtaZrp8R4zWDtkUXoV7M5teGuME70i";
const USER_KEY = "current-user-news";
const leftContainer = document.querySelector(".left-main-column");
const rightContainer = document.querySelector("#top-news-container");
const latestContainer = document.querySelector(".article-container");
const navBtn = document.querySelector(".mobile-nav-toggle");
const menu = document.querySelector(".nav-sub");
const bigTemplate = document.querySelector("#news-card-big-template");
const smallTemplate = document.querySelector("#news-card-small-template");
const latestTemplate = document.querySelector("#latest-template");
const navBar = document.querySelector(".nav-links");
const loadMoreButton = document.getElementById("load-more");
const navContainer = document.querySelector(".nav-container");
const loginContainer = document.querySelector(".login-container");

const RELATED_NEWS_AMOUNT = 5;

let newsWithImages = [];
let fullNewsList = [];

window.onscroll = function () {
  navFixedOnScroll();
};

checkIfLoggedIn();
filterResponseFromApi();

navBtn.addEventListener("click", () => {
  if (navBtn.getAttribute("data-visible") === "false") {
    navBtn.setAttribute("data-visible", "true");
    menu.setAttribute("data-visible", "true");
  } else {
    navBtn.setAttribute("data-visible", "false");
    menu.setAttribute("data-visible", "false");
  }
});

navBar.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-section")) {
    const section = e.target.getAttribute("data-section");
    filterResponseFromApi(section, true);
    /*     getLatestFromApi(section);
     */
  }
});

loadMoreButton.addEventListener("click", () => {
  renderBottomArticles();
});

/* function findParent(target) {
  if (!target.hasAttribute("data-news-id")) {
    if (target == leftContainer) return;
    let parent = target.parentNode;
    console.log(parent);
    findParent(parent);
  }
} */

function navFixedOnScroll() {
  const sticky = navContainer.offsetTop;
  if (window.pageYOffset > sticky) {
    navContainer.setAttribute("data-sticky", "true");
  } else {
    navContainer.setAttribute("data-sticky", "false");
  }
}

function checkIfLoggedIn() {
  const currentUser = loadCurrentUser();
  console.log(currentUser);
  if (currentUser.length < 1 || undefined) return;
  loginContainer.innerHTML = "";
  const userMsg = document.createElement("span");
  const logOut = document.createElement("span");
  logOut.classList.add("log-out");
  logOut.onclick = function () {
    logOutUser();
  };
  userMsg.innerText = `Hello, ${currentUser.name}`;
  loginContainer.appendChild(userMsg);
  loginContainer.appendChild(logOut);
}

function logOutUser() {
  localStorage.removeItem(USER_KEY);
  location.reload();
}

function loadCurrentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY)) || [];
}

function checkIfNewsIsCache(section) {
  let myData =
    JSON.parse(sessionStorage.getItem(`${STORAGE_KEY}-${section}`)) || [];
  if (myData.length > 1) return true;
}

async function getNewsFromApi(section) {
  if (!checkIfNewsIsCache(section)) {
    const response = await fetch(
      `${BASE_URL_TOP_STORIES}/${section}.json?${API_KEY}`
    );
    const data = await response.json();
    const { results } = data;
    sessionStorage.setItem(
      `${STORAGE_KEY}-${section}`,
      JSON.stringify(results)
    );
    return results;
  } else {
    const results =
      JSON.parse(sessionStorage.getItem(`${STORAGE_KEY}-${section}`)) || [];
    return results;
  }
}

async function filterResponseFromApi(section = "world", reload) {
  const news = await getNewsFromApi(section);
  newsWithImages = news.filter(
    (news) => news.multimedia != null && news.title != "" && news.abstract != ""
  );

  fullNewsList = [...newsWithImages];
  renderMainArticle();
  const sideArticles = newsWithImages.splice(1, 3);
  renderSideArticles(sideArticles);
  renderBottomArticles(true);
  console.log(newsWithImages);
}

function filterMainArticleImg() {
  /* Filtramos las imagenes que no tienen el aspect ratio correcto */

  const mainArticleList = newsWithImages.filter(
    (news) => news.multimedia[0].width / news.multimedia[0].height > 1.36
  );
  const mainArticle = mainArticleList.shift();
  /* removemos el mainarticle del la lista de news */
  newsWithImages = newsWithImages.filter((news) => news != mainArticle);

  return mainArticle;
}

function renderMainArticle(mainArticle) {
  mainArticle = filterMainArticleImg();

  const itemContainer = leftContainer;
  itemContainer.innerHTML = "";
  const newsItem = bigTemplate.content.cloneNode(true);

  const container = newsItem.querySelector("[data-newsId]");
  container.dataset.newsId = mainArticle.created_date;

  const newsItemImg = newsItem.querySelector("[data-news-img-big]");
  newsItemImg.src = mainArticle.multimedia[0].url;

  const newsItemCategory = newsItem.querySelector("[data-news-category]");
  newsItemCategory.dataset.newsCategory = mainArticle.section;
  newsItemCategory.innerText =
    mainArticle.subsection.toUpperCase() || mainArticle.section.toUpperCase();

  const newsItemTitle = newsItem.querySelector("[data-news-title]");
  newsItemTitle.innerText = mainArticle.title;
  newsItemTitle.href = mainArticle.url;

  const newsItemAbstract = newsItem.querySelector("[data-news-abstract]");
  newsItemAbstract.innerText = mainArticle.abstract;

  itemContainer.appendChild(newsItem);
}

function renderSideArticles(sideArticles) {
  const itemContainer = rightContainer;
  itemContainer.innerHTML = "";

  sideArticles.forEach((news, index) => {
    const newsItem = smallTemplate.content.cloneNode(true);

    const container = newsItem.querySelector("[data-news-id]");
    container.dataset.newsid = index;

    const newsItemImg = newsItem.querySelector("[data-news-img-small]");
    newsItemImg.src = news.multimedia[1].url;

    const newsItemCategory = newsItem.querySelector("[data-news-category]");
    newsItemCategory.dataset.newsCategory = news.section;
    newsItemCategory.innerText = news.section.toUpperCase();

    const newsItemTitle = newsItem.querySelector("[data-news-title]");
    newsItemTitle.innerText = news.title;
    newsItemTitle.href = news.url;

    itemContainer.appendChild(newsItem);
  });
}

function checkIfCanLoadNews(reload) {
  if (newsWithImages.length < RELATED_NEWS_AMOUNT) {
    loadMoreButton.setAttribute("disabled", true);
    loadMoreButton.disable = true;
    return false;
  } else if (reload) {
    const itemContainer = latestContainer;
    itemContainer.innerHTML = "";
    loadMoreButton.removeAttribute("disabled");

    return true;
  }
  loadMoreButton.removeAttribute("disabled");

  return true;
}

function renderBottomArticles(reload) {
  if (!checkIfCanLoadNews(reload)) return;

  const itemContainer = latestContainer;

  const bottomArticle = newsWithImages.splice(0, 4);

  bottomArticle.forEach((news, index) => {
    const newsItem = latestTemplate.content.cloneNode(true);

    const container = newsItem.querySelector("[data-card]");
    container.dataset.newsid = index;

    const newsItemImg = newsItem.querySelector("[data-news-img-small]");
    newsItemImg.src = news.multimedia[1].url;

    const newsItemCategory = newsItem.querySelector("[data-news-category]");
    newsItemCategory.dataset.newsCategory = news.section;
    newsItemCategory.innerText = news.section.toUpperCase();

    const newsItemTitle = newsItem.querySelector("[data-news-title]");
    newsItemTitle.innerText = news.title;
    newsItemTitle.href = news.url;

    const newsItemAbstract = newsItem.querySelector("[data-news-abstract]");
    newsItemAbstract.innerText = news.abstract;
    itemContainer.appendChild(newsItem);
  });
}
