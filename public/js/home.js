const main = document.querySelector(".main");
let list = [];

//Use fetch method to make get request to genres list link
fetch(
  genres_list_http +
    new URLSearchParams({
      api_key: api_key,
    })
)
  .then((res) => res.json())
  .then(async (data) => {
    updateList();
    data.genres.unshift({ id: 0, name: "My List" });

    //Fetch movie's data according to the genre we fetched
    data.genres.forEach((item) => {
      fetchMoviesListByGenres(item.id, item.name);
    });
    // Wait 1 seconds so that the my-list container can first render before access
    setTimeout(() => {
      renderMyListItems();
    }, 1000);
  });

const searchForMovie = (value) => {
  const movieContainer = document.getElementById("searchBar");
  movieContainer.innerHTML = "";
  fetch(
    search_http +
      new URLSearchParams({
        api_key: api_key,
        query: value,
      })
  )
    .then((res) => res.json())
    .then(async (data) => {
      data.results.forEach((item, i) => {
        if (item.backdrop_path == null) {
          item.backdrop_path = item.poster_path;
          if (item.backdrop_path == null) {
            return;
          }
        }

        // Then check if the release date is in the future
        let today = new Date();
        let releaseDate = new Date(item.release_date);
        console.log(item);

        movieContainer.innerHTML += `
            <div class="movie"> 
                <div class="add-to-list">
                    <span class="add-to-list-button" id="add-to-list-${
                      item.id
                    }" onclick="toggleFromList(${item.id})">+</span>
                </div>
                <img src="${img_url}${
          item.backdrop_path
        }" alt="" onclick="location.href = '/${item.id}'">
                <p class="movie-title">${item.title}</p>
                ${
                  releaseDate > today
                    ? '<div class="coming-soon">Coming Soon</div>'
                    : ""
                }
                
            </div>
            `;

        if (i == data.length - 1) {
          setTimeout(() => {
            setupScrolling();
          }, 100);
        }
      });
    });
};

//Passing another parameter to get specific genres
const fetchMoviesListByGenres = (id, genres) => {
  fetch(
    movie_genres_http +
      new URLSearchParams({
        api_key: api_key,
        with_genres: id,
        page: Math.floor(Math.random() * 3) + 1,
      })
  )
    .then((res) => res.json())
    .then((data) => {
      makeCategoryElement(`${genres}_movies`, data.results);
    })
    .catch((err) => console.log(err));
};
const makeCategoryElement = (category, data) => {
  main.innerHTML += `
   
    <div class="movie-list">

        <button class="pre-btn"><img src="img/pre.png" alt=""></button>

        <h1 class="movie-category">${category.split("_").join(" ")}</h1>

        <div class="movie-container" id="${category}">

        </div>

        <button class="nxt-btn"><img src="img/nxt.png" alt=""></button>

    </div>
    `;

  makeCards(category, data);
};

const renderMyListItems = () => {
  const myListContainer = document.getElementById("My List_movies");
  myListContainer.innerHTML = "";

  // Loop through the items the user has added
  list.forEach((item) => {
    // Then fetch the details of that item via the api
    fetch(
      `${movie_detail_http}/${item}?` +
        new URLSearchParams({
          api_key: api_key,
        })
    )
      .then((res) => res.json())
      .then((data) => {
        // Then check if the release date is in the future
        let today = new Date();
        let releaseDate = new Date(data.release_date);

        // Then render the item in the "my list container";
        myListContainer.innerHTML += `
            <div class="movie"> 
                <div class="add-to-list">
                    <span class="add-to-list-button" id="add-to-list-${
                      data.id
                    }" onclick="toggleFromList(${data.id})">-</span>
                </div>
                <img src="${img_url}${
          data.backdrop_path
        }" alt="" onclick="location.href = '/${data.id}'">
                <p class="movie-title">${data.title}</p>
                ${
                  releaseDate > today
                    ? '<div class="coming-soon">Coming Soon</div>'
                    : ""
                }
            </div>
            `;
      });
  });
};

const updateList = () => {
  list = fetchWishlist();
};

// In movie data. We have "backdrop_path" witch contain movie images.
// But in some cases we will get "poster_path" for image instead of "backdrop_path"
// And in some cases "TMDB" give us none of us. so to make sure that we are getting the image,
// Check for this condition.
const makeCards = (id, data) => {
  const movieContainer = document.getElementById(id);
  data.forEach((item, i) => {
    if (item.backdrop_path == null) {
      item.backdrop_path = item.poster_path;
      if (item.backdrop_path == null) {
        return;
      }
    }

    // then check if the release date is in the future
    let today = new Date();
    let releaseDate = new Date(item.release_date);

    movieContainer.innerHTML += `
        <div class="movie"> 
            <div class="add-to-list">
                <span class="add-to-list-button" id="add-to-list-${
                  item.id
                }" onclick="toggleFromList(${item.id})">+</span>
            </div>
            <img src="${img_url}${
      item.backdrop_path
    }" alt="" onclick="location.href = '/${item.id}'">
            <p class="movie-title">${item.title}</p>
            ${
              releaseDate > today
                ? '<div class="coming-soon">Coming Soon</div>'
                : ""
            }
            
        </div>
        `;

    if (i == data.length - 1) {
      setTimeout(() => {
        setupScrolling();
      }, 100);
    }
  });

  fetchWishlist();
};

const isIdInList = (id) => {
  // Just check if the current movie id that the user clicked on is not already in wish list
  let isInList = false;

  list.forEach((item) => {
    if (item == id) isInList = true;
  });

  return isInList;
};

const fetchWishlist = () => {
  // Get list from local storage and make sure its always an array that we are working with
  let wishlist = localStorage.getItem("wishlist");

  if (wishlist === null) wishlist = [];
  else wishlist = JSON.parse(wishlist);
  return wishlist;
};

const toggleFromList = (id) => {
  // If movie is already in wish list we need to remove it else we need to add it
  if (isIdInList(id)) removeFromList(id);
  else addToList(id);

  // Change the + sign to - conditionally
  changeButtonIcon(id, isIdInList(id));

  // We then re-render the "my list container"
  renderMyListItems();
};

const addToList = (id) => {
  let wishlist = fetchWishlist();
  wishlist.push(id);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  list = wishlist;
};

const changeButtonIcon = (id, condition) => {
  let button = document.getElementById("add-to-list-" + id);
  if (condition) button.innerHTML = "-";
  else button.innerHTML = "+";
};

const removeFromList = (id) => {
  list = list.filter((item) => {
    return item != id;
  });

  localStorage.setItem("wishlist", JSON.stringify(list));
};
