import axios from 'axios';

const API_BASE_URL = 'http://localhost:5096/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const moviesAPI = {
  getAll: (page = 1, pageSize = 8, search = '', genres = '') => 
      api.get('/movies', { params: { page, pageSize, search, genres } }),
  getNew: () => api.get('/movies/new'),
  getById: (id) => api.get(`/movies/${id}`),
  getById: (id) => api.get(`/movies/${id}`),
  getTrending: () => api.get('/movies/trending'),
  getTopRated: () => api.get('/movies/top-rated'),
  create: (movieData) => api.post('/movies', movieData),
  update: (id, movieData) => api.put(`/movies/${id}`, movieData),
  delete: (id) => api.delete(`/movies/${id}`),
  react: (movieId, type) => api.post(`/movies/${movieId}/react?type=${type}`),
};

export const reviewsAPI = {
  getByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),
  create: (reviewData) => api.post('/reviews', reviewData), 
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  vote: (reviewId, isLike) => api.post(`/reviews/${reviewId}/vote?isLike=${isLike}`),
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (formData) => api.put('/auth/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const watchlistAPI = {
    getStatus: (movieId) => api.get(`/watchlist/movie/${movieId}`),
    update: (movieId, data) => api.post(`/watchlist/movie/${movieId}`, data),
    getMyList: () => api.get('/watchlist/my-list'),
};

export const usersAPI = {
  getPublicProfile: (id) =>
    api.get(`/users/${id}/profile`)
};

export const friendsAPI = {
    add: (userId) => api.post(`/friends/add/${userId}`),
    accept: (userId) => api.post(`/friends/accept/${userId}`),
    remove: (userId) => api.delete(`/friends/remove/${userId}`),
    getMyFriends: () => api.get('/friends/my-friends'),
    checkStatus: (userId) => api.get(`/friends/status/${userId}`),
};

export const blocksAPI = {
    block: (userId) => api.post(`/blocks/${userId}`),
    unblock: (userId) => api.delete(`/blocks/${userId}`),
    check: (userId) => api.get(`/blocks/check/${userId}`),
};

export const chatAPI = {
    getGeneralHistory: () => api.get('/chat/general'),
    getPrivateHistory: (userId) => api.get(`/chat/private/${userId}`),
};

export default api;