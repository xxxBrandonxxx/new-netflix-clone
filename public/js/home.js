const main = document.querySelector('.main');
let list = [];

fetch(genres_list_http + new URLSearchParams({
    api_key: api_key
}))
.then(res => res.json())
.then(async data => {
    updateList();
    data.genres.unshift({id: 0, name: 'My List'});
    data.genres.forEach(item => {
        fetchMoviesListByGenres(item.id, item.name);
    });
    setTimeout(() => { // wait 1 seconds so that the mylist container can first render before access
        renderMyListItems();
    }, 1000);
});

const fetchMoviesListByGenres = (id, genres) => {
    fetch(movie_genres_http + new URLSearchParams({
        api_key: api_key,
        with_genres: id,
        page: Math.floor(Math.random() * 3) + 1
    }))
    .then(res => res.json())
    .then(data => {
        makeCategoryElement(`${genres}_movies`, data.results);
    })
    .catch(err =>  console.log(err));


}//Trying to add search bar
// const searchInput = document.querySelectorAll("[data-search]")
// searchInput.addEventListener('input' , (getValue) => {
//     const value = getValue.target.value
// })
//up here
const makeCategoryElement = (category, data) => {
    main.innerHTML += `
    <input type="Search id="search" data-search>

    <div class="movie-list">

        <button class="pre-btn"><img src="img/pre.png" alt=""></button>

        <h1 class="movie-category">${category.split("_").join(" ")}</h1>

        <div class="movie-container" id="${category}">

        </div>

        <button class="nxt-btn"><img src="img/nxt.png" alt=""></button>

    </div>
    `;
    makeCards(category, data);
}

const renderMyListItems = () => {
    const myListContainer = document.getElementById('My List_movies');
    myListContainer.innerHTML = '';

    // loop through the items the user has added 
    list.forEach(item => {

        // then fetch the details of that item via the api
        fetch(`${movie_detail_http}/${item}?` + new URLSearchParams({
            api_key: api_key
        }))
        .then(res => res.json())
        .then(data => {

            // then check if the release date is in the future
            let today = new Date();
            let releaseDate = new Date(data.release_date);

            // then render the item in the "my list container";
            myListContainer.innerHTML += `
            <div class="movie"> 
                <div class="add-to-list">
                    <span class="add-to-list-button" id="add-to-list-${data.id}" onclick="toggleFromList(${data.id})">-</span>
                </div>
                <img src="${img_url}${data.backdrop_path}" alt="" onclick="location.href = '/${data.id}'">
                <p class="movie-title">${data.title}</p>
                ${releaseDate > today ? '<div class="coming-soon">Coming Soon</div>' : ''}
            </div>
            `;
        });

    })

}

const updateList = () => {
    list = fetchWishlist();
}

const makeCards = (id, data) => {
    const movieContainer = document.getElementById(id);
    data.forEach((item, i) => {
        if(item.backdrop_path == null){
            item.backdrop_path = item.poster_path;
            if(item.backdrop_path == null){ // TODO:
                return;
            }
        }

        // then check if the release date is in the future
        let today = new Date();
        let releaseDate = new Date(item.release_date);

        movieContainer.innerHTML += `
        <div class="movie"> 
            <div class="add-to-list">
                <span class="add-to-list-button" id="add-to-list-${item.id}" onclick="toggleFromList(${item.id})">+</span>
            </div>
            <img src="${img_url}${item.backdrop_path}" alt="" onclick="location.href = '/${item.id}'">
            <p class="movie-title">${item.title}</p>
            ${releaseDate > today ? '<div class="coming-soon">Coming Soon</div>' : ''}
            
        </div>
        `;

        if(i == data.length - 1){
            setTimeout(() => {
                setupScrolling();
            }, 100);
        }
    });

    fetchWishlist();
}

const isIdInList = (id) => {
    // just check if the current movie id that the user clicked on is not already in wish list
    let isInList = false;

    list.forEach(item => {
        if (item == id) isInList = true;
    });

    return isInList;
}

const fetchWishlist = () => {
    // get list from local storage and make sure its always an array that we are working with
    let wishlist = localStorage.getItem('wishlist');

    if (wishlist === null) wishlist = [];
    else wishlist = JSON.parse(wishlist);
    return wishlist;
};


const toggleFromList = (id) => {
    // if movie is already in wish list we need to remove it else we need to add it
    if (isIdInList(id)) removeFromList(id);
    else addToList(id);

    // change the + sign to - conditionally
    changeButtonIcon(id, isIdInList(id));

    // we then re-render the "my list container"
    renderMyListItems();
}

const addToList = (id) => {
    let wishlist = fetchWishlist();
    wishlist.push(id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    list = wishlist;
}

const changeButtonIcon = (id, condition) => {
    let button = document.getElementById('add-to-list-' + id);
    if (condition) button.innerHTML = "-";
    else button.innerHTML = "+";
}


const removeFromList = (id) => {
    list = list.filter(item => {
        return item != id;
    });

    localStorage.setItem('wishlist', JSON.stringify(list));
}