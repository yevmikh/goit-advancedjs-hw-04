import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '42208037-79ed24c913e3ae53795b11edc';
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let currentPage = 1;
let hoorayMessage = false;
let searchQuery = '';
let totalImagesAvailable = 0;

let loadMoreBtn = document.getElementById('loadMoreBtn');

if (!loadMoreBtn) {
  loadMoreBtn = document.createElement('button');
  loadMoreBtn.id = 'loadMoreBtn';
  loadMoreBtn.textContent = 'Load More';
  document.body.appendChild(loadMoreBtn);
  loadMoreBtn.style.display = 'none';
}

const simpleLightbox = new SimpleLightbox('.gallery a');

async function searchImages(query) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    totalImagesAvailable = response.data.totalHits;

    if (currentPage === 1) {
      showTotalHitsMessage(response.data.totalHits);
    }
    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

function showTotalHitsMessage(totalHits) {
  if (totalHits > 0 && !hoorayMessage) {
    iziToast.success({
      title: 'Hooray!',
      message: `We found ${totalHits} images.`,
      timeout: 2500,
    });
    hoorayMessage = true;
  }
}

function displayLargeImage(images) {
  images.forEach(image => {
    const card = document.createElement('a');
    card.href = image.largeImageURL;
    card.className = 'photo-card';
    card.innerHTML = `
<div class ="info">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            <div class="card-info">
                <div class ="card-list"><p>Likes</p> ${image.likes}</div>
                <div class ="card-list"><p>Views</p> ${image.views}</div>
                <div class ="card-list"><p>Comments</p> ${image.comments}</div>
                <div class ="card-list"><p>Downloads</p>${image.downloads}</div>
            </div></div>
        `;
    gallery.appendChild(card);
  });
  simpleLightbox.refresh();

  const loadedImagesCount = currentPage * 40;
  if (loadedImagesCount >= totalImagesAvailable) {
    loadMoreBtn.style.display = 'none';
    setTimeout(() => {
      iziToast.info({
        title: 'End of Stock',
        message: 'We are sorry, but you have reached end of search results',
        position: 'bottomCenter',
        timeout: 3000,
      });
    }, 2700);
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

searchForm.addEventListener('submit', handlerSubmit);
async function handlerSubmit(event) {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value.trim();
  if (searchQuery) {
    currentPage = 1;
    gallery.innerHTML = '';
    hoorayMessage = false;
    loadMoreBtn.style.display = 'none';
    const images = await searchImages(searchQuery);
    if (images.length > 0) {
      displayLargeImage(images);
    } else {
      iziToast.warning({
        title: 'Sorry',
        message: 'No images found for your query. Please try again.',
      });
    }
  }
}

loadMoreBtn.addEventListener('click', handlerImg);
async function handlerImg() {
  currentPage += 1;
  const images = await searchImages(searchQuery);
  displayLargeImage(images);
}
