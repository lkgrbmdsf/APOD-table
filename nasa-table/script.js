const dates = document.querySelectorAll("input");
const button = document.querySelector(".get-pictures");
const main = document.querySelector(".main");
const select = document.querySelector("select");
const startDate = document.querySelector("input[name='date-start']");
const endDate = document.querySelector("input[name='date-end']");
const table = document.querySelector(".table");
const pagination = document.querySelector(".pagination");
const header = document.querySelector(".header");
const modal = document.querySelector(".modal");
const modalWrapper = document.querySelector(".modal-wrapper");
const pages = pagination.querySelector("ul");

const preButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");
const currPage = document.querySelector(".curr-pg");
const totalPages = document.querySelector(".total-pg");

const FIRST_APOD_DATE = "1995-06-16";
const DATE_NOW = new Date().toISOString().split("T")[0];
startDate.value = "2021-11-01";
endDate.value = "2021-11-09";
startDate.max = endDate.value;
endDate.max = DATE_NOW;

let currentPageNumber = 1;
preButton.disabled = currentPageNumber === 1;

document.addEventListener("DOMContentLoaded", () => {
  getResults(startDate.value, endDate.value);
});

dates.forEach((date) => {
  date.min = FIRST_APOD_DATE;

  date.addEventListener("change", () => {
    if (endDate.value < startDate.value) {
      startDate.value = endDate.value;
    }
    startDate.max = endDate.value;

    getResults(startDate.value, endDate.value);
  });
});

modalWrapper.addEventListener("click", () => {
  modal.innerHTML = "";
  [header, table, pagination].forEach((element) => {
    element.classList.remove("disabled");
    modalWrapper.classList.remove("expanded");
  });
});

async function getResults(startDate, endDate) {
  const spinner = '<div class="loading-spinner"></div>';
  table.innerHTML = spinner;
  try {
    pagination.classList.add("hidden");
    // const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${startDate}&end_date=${endDate}`;
    const url = "./temp.json";
    const result = await fetch(url);
    const listOfImgs = await result.json();
    return loadPaging(listOfImgs.length, (pagingOptions) => {
      const newArray = pageArraySplit(listOfImgs, pagingOptions);
      return loadList(newArray);
    });
  } catch (e) {
    console.log(e);
  } finally {
    pagination.classList.remove("hidden");
  }
}

function createItem(item) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = item.url.match(regExp);

  const alternativePic = `https://img.youtube.com/vi/${match[7]}/3.jpg`;

  const html = `
      <div class="row">
    <img src="${
      item.media_type === "image" ? item.url : alternativePic
    }" alt="a picture of the day" data-src="${
    item.media_type === "video" ? item.url : ""
  }" width="200" height="140">
    <p>${item.title}</p>
    <p>${item.copyright ? item.copyright : ""}</p>
    <p>${item.date.split("-").reverse().join(".")}</p>    
    </div>
    `;

  return html;
}

async function loadList(list) {
  if (table.innerHTML) {
    table.innerHTML = "";
  }

  let html = "";
  await list.forEach((item) => {
    html += createItem(item);
  });

  table.innerHTML = html;

  const imgs = table.querySelectorAll("img");
  imgs.forEach((img) =>
    img.addEventListener("click", () => {
      modal.innerHTML =
        img.dataset.src === ""
          ? `<img src="${img.src}">`
          : `<iframe src="${img.dataset.src}">`;
      modalWrapper.classList.add("expanded");
    })
  );

  return table;
}

function loadPaging(totalItems, callback) {
  const updatePaging = () => {
    pages.innerHTML = "";
    const totalPageCount = Math.ceil(totalItems / +select.value);

    const li = document.createElement("li");

    for (let i = 1; i <= totalPageCount; i++) {
      li.innerText = `<li>${i}</li>`;
      pages.innerHTML += li.innerText;
    }

    const listOfLi = pages.querySelectorAll("li");
    listOfLi.forEach((item) => {
      if (+item.innerText === currentPageNumber)
        item.classList.toggle("active-pg");

      item.addEventListener("click", (e) => {
        console.log(e.target.innerText);
        currentPageNumber = +e.target.innerText;
        updatePaging();
      });
    });

    const pagingOptions = {
      currentPageNumber: currentPageNumber,
      perPage: +select.value,
    };

    callback(pagingOptions);
    nextButton.disabled = currentPageNumber === totalPageCount;
    if (currentPageNumber > totalPageCount) {
      currentPageNumber = totalPageCount;
      updatePaging();
    }

    preButton.disabled = currentPageNumber === 1;
  };

  updatePaging();

  nextButton.onclick = () => {
    currentPageNumber++;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    updatePaging();
  };

  preButton.onclick = () => {
    currentPageNumber--;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    updatePaging();
  };

  select.addEventListener("change", () => {
    updatePaging();
  });
}

function pageArraySplit(array, pagingOptions) {
  const currentPageNumber = pagingOptions.currentPageNumber;
  const perPage = pagingOptions.perPage;
  const startingIndex = (currentPageNumber - 1) * perPage;
  const endingIndex = startingIndex + perPage;
  return array.slice(startingIndex, endingIndex);
}
