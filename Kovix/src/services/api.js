import axios from 'axios';

const API_BASE_URL = '/api';

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
  getAll: (page = 1, pageSize = 8, search = '', genres = '', year = '', sort = '') =>
    api.get('/movies', { params: { page, pageSize, search, genres, year, sort } }),
  getFilters: () => api.get('/movies/filters'),
  getNew: (days = 45, limit = 10) =>
    api.get(`/movies/new?days=${days}&limit=${limit}`),
  getById: (id) => api.get(`/movies/${id}`),
  getTrending: () => api.get('/movies/trending'),
  getTopRated: () => api.get('/movies/top-rated'),
  getRandom: () => api.get('/movies/random'),
  addToHistory: (id) => api.post(`/movies/${id}/history`),
  getHistory: () => api.get('/movies/history'),
  create: (movieData) => api.post('/movies', movieData),
  update: (id, movieData) => api.put(`/movies/${id}`, movieData),
  delete: (id) => api.delete(`/movies/${id}`),
  react: (movieId, type) => api.post(`/movies/${movieId}/react?type=${type}`),
  rateEpisode: (episodeId, rating) => {
    return api.post(`/movies/rate-episode/${episodeId}?rating=${rating}`);
  },
  addEpisode: (movieId, data) => {
    return api.post(`/movies/${movieId}/add-episode`, data);
  },

  updateEpisode: (id, data) => {
    return api.put(`/movies/episodes/${id}`, data);
  },

  deleteEpisode: (id) => {
    return api.delete(`/movies/episodes/${id}`);
  },

  searchTmdb: (query) => api.get(`/movies/tmdb/search?query=${encodeURIComponent(query)}`),
  getTmdbDetails: (tmdbId) => api.get(`/movies/tmdb/details/${tmdbId}`),
  getLatest: () => api.get('/movies/latest'),
  incrementView: (id) => api.post(`/movies/${id}/increment-view`),
  getFranchises: () => api.get('/movies/franchises'),
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
  updateSettings: (data) => api.put('/auth/settings', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const watchlistAPI = {
  getStatus: (movieId) => api.get(`/watchlist/movie/${movieId}`),
  update: (movieId, data) => api.post(`/watchlist/movie/${movieId}`, data),
  getMyList: () => api.get('/watchlist/my-list'),
};

export const usersAPI = {
  getPublicProfile: (id) => api.get(`/users/${id}/profile`),
  toggleBlock: (id) => api.post(`/users/${id}/toggle-block`),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/unfollow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  block: (id) => api.put(`/users/${id}/block`)
};

export const friendsAPI = {
  add: (userId) => api.post(`/friends/add/${userId}`),
  accept: (userId) => api.post(`/friends/accept/${userId}`),
  remove: (userId) => api.delete(`/friends/remove/${userId}`),
  getMyFriends: () => api.get('/friends/my-friends'),
  checkStatus: (userId) => api.get(`/friends/status/${userId}`),
  getRequests: () => api.get('/friends/requests'),
};

export const blocksAPI = {
  block: (userId) => api.post(`/blocks/${userId}`),
  unblock: (userId) => api.delete(`/blocks/${userId}`),
  check: (userId) => api.get(`/blocks/check/${userId}`),
};

export const chatAPI = {
  getGeneralHistory: () => api.get('/chat/general'),
  getPrivateHistory: (userId) => api.get(`/chat/private/${userId}`),
  markAsRead: (senderId) => api.post(`/chat/messages/read/${senderId}`),
  getGeneralChatInfo: () => api.get('/chat/general'),
  markGeneralAsRead: () => api.post('/chat/general/read'),
};

export const reportsAPI = {
  getAll: () => api.get('/reports'),
  create: (data) => api.post('/reports', data),
  resolve: (id, data) => api.put(`/reports/${id}/resolve`, JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    }),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clear: () => api.delete('/notifications/clear'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const actorsAPI = {
  getAll: () => api.get('/actors'),
  getById: (id) => api.get(`/actors/${id}`),
  create: (data) => api.post('/actors', data),
  update: (id, data) => api.put(`/actors/${id}`, data),
  delete: (id) => api.delete(`/actors/${id}`),
};

export const contentFilterAPI = {
  getBlockedActors: () => api.get('/contentfilter/blocked-actors'),
  blockActor: (actorId) => api.post(`/contentfilter/block-actor/${actorId}`),
  unblockActor: (actorId) => api.delete(`/contentfilter/unblock-actor/${actorId}`)
};

export const appealsAPI = {
  create: (content) => api.post('/appeals', JSON.stringify(content), {
    headers: { 'Content-Type': 'application/json' }
  }),
  getMyAppeal: () => api.get('/appeals/my-appeal'),
  getAll: () => api.get('/appeals'),
  process: (id, data) => api.put(`/appeals/${id}/process`, data),
};

export const charactersAPI = {
  getByMovie: (movieId) => api.get(`/movies/${movieId}/characters`),
  getById: (id) => api.get(`/characters/${id}`),
  create: (movieId, data) => api.post(`/movies/${movieId}/characters`, data),
  update: (movieId, characterId, data) => api.put(`/movies/${movieId}/characters/${characterId}`, data),
  delete: (movieId, characterId) => api.delete(`/movies/${movieId}/characters/${characterId}`),
};

export const voiceActorsAPI = {
  getByCharacter: (characterId) => api.get(`/characters/${characterId}/voice-actors`),
  getByMovie: (movieId) => api.get(`/movies/${movieId}/voice-actors`),
  getById: (actorId) => api.get(`/actors/${actorId}`),
};

export const statsAPI = {
  getStats: () => api.get('/users/stats'),
};

export const moviePhotosAPI = {
  getByMovie: (movieId) => api.get(`/movies/${movieId}/photos`),
  
  addUrl: (movieId, imageUrl) => api.post(`/movies/${movieId}/photos/url`, `"${imageUrl}"`, {
      headers: { 'Content-Type': 'application/json' }
  }),
  
  uploadMultiple: (movieId, formData) => api.post(`/movies/${movieId}/photos/upload`, formData),
  
  delete: (movieId, photoId) => api.delete(`/movies/${movieId}/photos/${photoId}`)
};

export const newsAPI = {
  getAll: () => api.get('/news'),
  getById: (id) => api.get(`/news/${id}`),
  update: (id, data) => api.put(`/news/${id}`, data),
  create: (data) => api.post('/news', data),
  delete: (id) => api.delete(`/news/${id}`)
};

export default api;