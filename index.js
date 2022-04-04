const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12

const movies = []
//儲存符合篩選條件的項目
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //title, image
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  //製作 template
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  //回傳切割後的新陣列(起始 index, 結尾 index不包含在新陣列中)
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

//監聽 Search Bar
searchForm.addEventListener('submit', function onSearchFormSubmiited(event) {
  //停止瀏覽器的預設行為，把控制權交給JavaScript
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()


  // //錯誤處理：輸入無效字串
  // if (!keyword.length) {
  //   return alert ('請輸入有效字串！')
  // }

  //條件篩選
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword)
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)
  //預設顯示第1頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
  .catch((err) => console.log(err))