//variables

function newsTemplate(data) {
  return `
  <div class="item">
          <a href="news/details/${data.newsid}">
            <img src="/${data.img}" alt="" />
            <div class="text">
              <h5 class="title" style="text-transform: capitalize">${data.title}</h5>
              <p class="desc">
                ${data.description} <i class="bi bi-book" style="color: blue; font-weight: 800;"></i>...read more <br />
              <span class="date"><i class="bi bi-alarm-fill" style="color: navy; font-weight: 300; font-size: 15px;"></i>${data.date}</span>

              </p>
            </div>
          </a>
        </div>
   `;
}

const openSidebarBtn = document.querySelector(".open-sidebar-btn");

openSidebarBtn.addEventListener("click", (e) => {
  document.querySelector(".sidebar").classList.toggle("hide");
  if (openSidebarBtn.innerHTML == `<i class="bi bi-list"></i>`) {
    openSidebarBtn.innerHTML = `<i class="bi bi-x"></i>`;
    openSidebarBtn.style.top = "10%";
  } else {
    openSidebarBtn.innerHTML = `<i class="bi bi-list"></i>`;
    openSidebarBtn.style.top = "10%";
  }
});

// ========================FETCH HOME PAGE LATEST NEWS======================
let news = [];
let filterNews = [];
async function fetchNews(url = "") {
  try {
    const res = await fetch(url);
    const data = await res.json();

    news = data;
    filterNews = data;

    displayNews();
  } catch (error) {
    console.log(error);
  }
}

function displayNews() {
  const container = document.getElementById("news-container-grid");
  container.innerHTML = "";
  filterNews.forEach((item) => {
    let div = document.createElement("div");
    if (
      item.healine !== null &&
      item.title !== null &&
      item.description !== null
    ) {
      item.headline = item.headline.slice(0, 15);
      item.title = item.title.slice(0, 25) + "...";
      item.description = item.description.slice(0, 14);
    }
    div.innerHTML = newsTemplate(item);
    container.append(div);
  });
}

function searchNews() {
  document.getElementById("nav-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const search = this.querySelector("#search-news-form");
    filterNews = news.filter((news) =>
      news.title.toLowerCase().includes(search.value.toLowerCase())
    );
    displayNews();
  });
}
// ===================================FETCH CATEGORIES=====================
function fetchCategories(url = "") {
  const newsFileterCategoryContainer = document.querySelector("#filter-news");
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((item) => {
        const option = document.createElement("option");
        option.innerHTML = `<option value=${item.title}>${item.title}</option>`;
        newsFileterCategoryContainer.append(option);
      });
    })
    .catch((err) => console.log(err));
}

function filterNewsByCategory() {
  document.getElementById("filter-news").addEventListener("change", (e) => {
    const category = e.target.value;
    const heading = document.getElementById("news-heading");
    heading.innerHTML = category;
    if (category == "all") {
      fetchNews("/api/news");
      window.location.replace("/news");
    }
    fetchNews(`/api/news?category=${category}`);
  });
}
//====================================NEWS SCRIPTS

function createNews() {
  const file = document.querySelector(".create-news #file");
  file.addEventListener("change", function (e) {
    for (let i = 0; i < this.files.length; i++) {
      const img = document.querySelector(".create-img-preview");
      img.src = URL.createObjectURL(this.files[i]);
      img.onload = function () {
        URL.revokeObjectURL(this.src);
      };
    }
  });
}

function deleteNews() {
  const newsDelBtn = document.querySelectorAll(".del");
  for (let i = 0; i < newsDelBtn.length; i++) {
    newsDelBtn[i].addEventListener("click", function () {
      const id = this.id;
      fetch(`/api/news/delete/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((data) => {
          alert(data);
          window.location.reload();
        })
        .catch((err) => console.log(err));
    });
  }
}

function updateNews() {
  const file = document.querySelector(".update-news #file");

  file.addEventListener("change", function (e) {
    for (let i = 0; i < this.files.length; i++) {
      let img = document.querySelector(".edit-img-preview");
      img.src = URL.createObjectURL(this.files[i]);
      img.onload = function () {
        URL.revokeObjectURL(this.src);
      };
    }
  });
}

function changeProfilePic() {
  const file = document.querySelector("#profileImgForm #profilepic");

  file.addEventListener("change", function (e) {
    for (let i = 0; i < this.files.length; i++) {
      let img = document.querySelector(".profile-preview-img");
      img.src = URL.createObjectURL(this.files[i]);
      img.onload = function () {
        URL.revokeObjectURL(this.src);
      };
    }
  });
}

async function deleteUserFromDb() {
  const deleteBtn = document.querySelectorAll(".del-account");
  for (let i = 0; i < deleteBtn.length; i++) {
    deleteBtn[i].addEventListener("click", async function () {
      const id = this.parentElement.id;
      console.log(id);
      const agreed = prompt(
        "This is action cannot be undone! Do you want to do this? type 'yes' to delete this account"
      );
      if (agreed.toLowerCase() === "yes") {
        try {
          const res = await fetch("/api/user/delete/" + id, {
            method: "DELETE",
          });
          const data = await res.json();
          alert(data);
          window.location.replace("/");
        } catch (error) {
          console.log(error);
        }
      } else {
        return false;
      }
    });
  }
}

function deleteCategory() {
  const categoryDelBtn = document.querySelectorAll(".del");
  for (let i = 0; i < categoryDelBtn.length; i++) {
    categoryDelBtn[i].addEventListener("click", function () {
      const id = this.id;
      console.log(id);
      fetch(`/api/categories/delete/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((data) => {
          alert(data);
          window.location.reload();
        })
        .catch((err) => console.log(err));
    });
  }
}
