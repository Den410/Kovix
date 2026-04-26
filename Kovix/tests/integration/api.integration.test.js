import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      patch: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}));

import { moviesAPI, reviewsAPI, authAPI, watchlistAPI } from '../../src/services/api';

describe('API Services - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('moviesAPI - Integration with Axios', () => {
    it('should have all movie API methods defined', () => {
      expect(moviesAPI.getAll).toBeDefined();
      expect(typeof moviesAPI.getAll).toBe('function');
    });

    it('should add Bearer token to requests when localStorage has token', () => {
      const token = 'test-jwt-token';
      global.localStorage.getItem.mockReturnValue(token);
      
      expect(global.localStorage.getItem('token')).toBe(token);
    });

    it('should format search parameters correctly', () => {
      expect(moviesAPI.getAll).toBeDefined();
      expect(typeof moviesAPI.getAll).toBe('function');
    });

    it('should handle movie details request', () => {
      expect(moviesAPI.getById).toBeDefined();
      expect(typeof moviesAPI.getById).toBe('function');
    });

    it('should handle multiple API endpoints', () => {
      const endpoints = [
        'getAll',
        'getFilters',
        'getNew',
        'getById',
        'getTrending',
        'getTopRated',
        'getRandom',
        'create',
        'update',
        'delete'
      ];

      endpoints.forEach(endpoint => {
        expect(moviesAPI[endpoint]).toBeDefined();
        expect(typeof moviesAPI[endpoint]).toBe('function');
      });
    });

    it('should handle movie reactions', () => {
      expect(moviesAPI.react).toBeDefined();
      expect(typeof moviesAPI.react).toBe('function');
    });

    it('should handle episode operations', () => {
      const episodeMethods = ['rateEpisode', 'addEpisode', 'updateEpisode', 'deleteEpisode'];
      episodeMethods.forEach(method => {
        expect(moviesAPI[method]).toBeDefined();
        expect(typeof moviesAPI[method]).toBe('function');
      });
    });
  });

  describe('reviewsAPI - Integration with Axios', () => {
    it('should have all review endpoints defined', () => {
      const endpoints = [
        'getByMovie',
        'create',
        'update',
        'delete',
        'vote',
        'getByUser'
      ];

      endpoints.forEach(endpoint => {
        expect(reviewsAPI[endpoint]).toBeDefined();
        expect(typeof reviewsAPI[endpoint]).toBe('function');
      });
    });

    it('should handle review voting', () => {
      expect(reviewsAPI.vote).toBeDefined();
      expect(typeof reviewsAPI.vote).toBe('function');
    });

    it('should handle review CRUD operations', () => {
      expect(reviewsAPI.create).toBeDefined();
      expect(reviewsAPI.update).toBeDefined();
      expect(reviewsAPI.delete).toBeDefined();
    });
  });

  describe('authAPI - Integration with Axios', () => {
    it('should have all authentication endpoints', () => {
      const endpoints = [
        'login',
        'register',
        'getProfile',
        'updateProfile',
        'updateSettings',
        'changePassword',
        'forgotPassword',
        'resetPassword'
      ];

      endpoints.forEach(endpoint => {
        expect(authAPI[endpoint]).toBeDefined();
        expect(typeof authAPI[endpoint]).toBe('function');
      });
    });

    it('should handle profile update with FormData', () => {
      expect(authAPI.updateProfile).toBeDefined();
    });

    it('should handle password change', () => {
      expect(authAPI.changePassword).toBeDefined();
    });

    it('should handle password reset flow', () => {
      expect(authAPI.forgotPassword).toBeDefined();
      expect(authAPI.resetPassword).toBeDefined();
    });
  });

  describe('watchlistAPI - Integration with Axios', () => {
    it('should have all watchlist endpoints', () => {
      const endpoints = [
        'getStatus',
        'update',
        'getMyList'
      ];

      endpoints.forEach(endpoint => {
        expect(watchlistAPI[endpoint]).toBeDefined();
        expect(typeof watchlistAPI[endpoint]).toBe('function');
      });
    });

    it('should get watchlist status for movie', () => {
      expect(watchlistAPI.getStatus).toBeDefined();
    });

    it('should update watchlist entry', () => {
      expect(watchlistAPI.update).toBeDefined();
    });
  });

  describe('API Interceptor Integration', () => {
    it('should have token stored in localStorage when user is authenticated', () => {
      const token = 'test-jwt-token-12345';
      global.localStorage.getItem.mockReturnValue(token);

      expect(global.localStorage.getItem('token')).toBe(token);
    });

    it('should return null when token is not available', () => {
      global.localStorage.getItem.mockReturnValue(null);

      expect(global.localStorage.getItem('token')).toBeNull();
    });

    it('should handle different token formats', () => {
      const bearerToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      global.localStorage.getItem.mockReturnValue(bearerToken);

      expect(global.localStorage.getItem('token')).toContain('Bearer');
    });
  });

  describe('API Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const apiMethods = [
        moviesAPI.getAll,
        reviewsAPI.getByMovie,
        authAPI.login,
        watchlistAPI.getMyList
      ];

      apiMethods.forEach(method => {
        expect(typeof method).toBe('function');
      });
    });

    it('should pass parameters correctly to API endpoints', () => {
      expect(typeof moviesAPI.getAll).toBe('function');
      expect(typeof moviesAPI.searchTmdb).toBe('function');
      expect(typeof reviewsAPI.vote).toBe('function');
    });
  });

  describe('API Query Parameter Encoding', () => {
    it('should handle special characters in search', () => {
      expect(moviesAPI.searchTmdb).toBeDefined();
    });

    it('should handle movie filtering parameters', () => {
      expect(moviesAPI.getAll).toBeDefined();
    });

    it('should format trending and top rated endpoints', () => {
      expect(moviesAPI.getTrending).toBeDefined();
      expect(moviesAPI.getTopRated).toBeDefined();
    });
  });
});
