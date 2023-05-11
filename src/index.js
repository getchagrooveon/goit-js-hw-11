import Notiflix from 'notiflix';
import axios from 'axios';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';

const lightbox = new SimpleLightbox('.gallery__link', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  docClose: true,
});
const parameters = {
  key: '36220225-498e2aaa7af1c41719481b4e5',
  q: null,
  image_type: 'photo',
  orientation: 'vertical',
  per_page: 40,
  page: 1,
};

const gallery = document.querySelector('ul');
const form = document.querySelector('form');
const load = document.querySelector('#load');
const loaddiv = document.querySelector('#loaddiv');

form.addEventListener('submit', handleSubmit);

async function handleNewLoad(event) {
  parameters.page = parameters.page + 1;
  const nextResponce = await axios.get('https://pixabay.com/api/', {
    params: parameters,
  });
  createMarkup(nextResponce.data.hits);
  checkQuantityFinal(nextResponce.data.hits);
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function checkQuantityFinal(data) {
  if (data.length <= parameters.per_page - 1) {
    loaddiv.classList.add('invisible');
    load.removeEventListener('click', handleNewLoad);
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  load.addEventListener('click', handleNewLoad);
  gallery.innerHTML = '';
  parameters.page = 1;
  try {
    parameters.q = event.target.elements.search.value;
    const responce = await axios.get('https://pixabay.com/api/', {
      params: parameters,
    });
    checkErrors(responce);
    checkQuantity(responce);
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}
function checkQuantity(responce) {
  if (responce.data.totalHits > 40) {
    loaddiv.classList.remove('invisible');
  } else {
    loaddiv.classList.add('invisible');
  }
}

function checkErrors(responce) {
  if (responce.data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    Notiflix.Notify.success(
      `Hooray! We found ${responce.data.totalHits} images.`
    );
  }
  return createMarkup(responce.data.hits);
}
function createMarkup(data) {
  const markUp = data.reduce((accumulator, element) => {
    accumulator =
      accumulator +
      `<li class="gallery__item">
      <a class="gallery__link" href="${element.largeImageURL}">
         <img class="gallery__image" src="${element.previewURL}" alt="${element.tags}" width="500"/>
      </a>
<p>Views: ${element.views}<br>Likes: ${element.likes}<br>Comments: ${element.comments}<br>Downloads: ${element.downloads}</p>
   </li>`;
    return accumulator;
  }, '');
  gallery.insertAdjacentHTML('beforeend', markUp);
  lightbox.refresh();
}
