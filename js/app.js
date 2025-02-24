const API_KEY = 'b8fa02c7f77ebd94aadf9f738319a92b'; // Reemplaza con tu API Key de TMDb
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearch');
const showFavoritesButton = document.getElementById('showFavorites');
const resultsDiv = document.getElementById('results');
const paginationDiv = document.getElementById('pagination');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfoSpan = document.getElementById('pageInfo');

// Variables globales
let currentPage = 1;
let totalPages = 1;
let currentQuery = '';

// Función para buscar películas
async function searchMovies(query, page = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`
    );
    if (!response.ok) {
      throw new Error('Error en la solicitud a la API.');
    }
    const data = await response.json();
    if (data.results.length === 0) {
      throw new Error('No se encontraron resultados.');
    }
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    resultsDiv.innerHTML = `<p>${error.message}</p>`;
    return null;
  }
}

// Función para mostrar películas
function displayMovies(movies) {
    resultsDiv.innerHTML = '';
    if (movies.length === 0) {
      resultsDiv.innerHTML = '<p>No se encontraron resultados.</p>';
      return;
    }
  
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.classList.add('movie-card');
  
      // Verificar si la película ya está en favoritos
      const isFavorite = favorites.some(fav => fav.id === movie.id);
  
      movieCard.innerHTML = `
        <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/200x300'}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>Año: ${movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido'}</p>
        <button class="favorite-button" data-id="${movie.id}">
          ${isFavorite ? '❌ Quitar de Favoritos' : '❤️ Añadir a Favoritos'}
        </button>
      `;
      resultsDiv.appendChild(movieCard);
    });

  // Agregar evento a los botones de favoritos
  document.querySelectorAll('.favorite-button').forEach(button => {
    button.addEventListener('click', () => {
      const movieId = parseInt(button.getAttribute('data-id'));
      const movie = movies.find(m => m.id === movieId);

      if (button.textContent.includes('Quitar')) {
        removeFromFavorites(movieId);
        button.textContent = '❤️ Añadir a Favoritos'; // Cambiar el texto del botón
      } else {
        addToFavorites(movie);
        button.textContent = '❌ Quitar de Favoritos'; // Cambiar el texto del botón
      }
    });
  });
}


// Función para agregar una película a favoritos
function addToFavorites(movie) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === movie.id)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${movie.title} se ha añadido a favoritos.`);
  } else {
    alert(`${movie.title} ya está en favoritos.`);
  }
}

function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Película quitada de favoritos.');
  }

// Función para mostrar favoritos
function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
      resultsDiv.innerHTML = '<p>No tienes películas en favoritos.</p>';
    } else {
      displayMovies(favorites); // Mostrar las películas favoritas
    }
    paginationDiv.innerHTML = ''; // Ocultar paginación en favoritos
  }

// Función para actualizar la paginación
function updatePagination(totalPages, currentPage) {
  pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}

// Función principal de búsqueda
async function handleSearch() {
  const query = searchInput.value.trim();
  if (query === '') {
    alert('Por favor, ingresa un término de búsqueda.');
    return;
  }
  currentQuery = query;
  resultsDiv.innerHTML = '<p>Cargando...</p>';
  const data = await searchMovies(query, currentPage);
  if (data) {
    displayMovies(data.results);
    totalPages = data.total_pages;
    updatePagination(totalPages, currentPage);
  }
}

// Eventos
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  resultsDiv.innerHTML = '';
  paginationDiv.innerHTML = '';
});

showFavoritesButton.addEventListener('click', displayFavorites);

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    handleSearch();
  }
});

nextPageButton.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    handleSearch();
  }
});