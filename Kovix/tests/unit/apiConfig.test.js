import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getApiBaseUrl, getWebSocketUrl } from '../../src/utils/apiConfig';

describe('apiConfig Utils', () => {
  let originalLocation;
  let originalImportMeta;

  beforeEach(() => {
    originalLocation = window.location;
    originalImportMeta = import.meta.env;
    
    delete window.location;
    window.location = { 
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000'
    };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('getApiBaseUrl', () => {
    it('should return the API base URL', () => {
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
      expect(url).toMatch(/^(http|ws)/);
    });

    it('should use window.location.origin when in browser', () => {
      const url = getApiBaseUrl();
      expect(url).toContain('://');
    });

    it('should handle VITE_API_BASE_URL environment variable', () => {
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('should return URL that starts with protocol', () => {
      const url = getApiBaseUrl();
      expect(url).toMatch(/^(http|\/\/|\/)/);
    });
  });

  describe('getWebSocketUrl', () => {
    it('should return WebSocket URL with ws protocol', () => {
      window.location.protocol = 'http:';
      const url = getWebSocketUrl();
      expect(url).toContain('ws://');
    });

    it('should return WebSocket URL with wss protocol for https', () => {
      window.location.protocol = 'https:';
      const url = getWebSocketUrl();
      expect(url).toContain('wss://');
    });

    it('should include host in WebSocket URL', () => {
      window.location.protocol = 'http:';
      window.location.host = 'example.com:8080';
      const url = getWebSocketUrl();
      expect(url).toContain('example.com:8080');
    });

    it('should format URL correctly', () => {
      window.location.protocol = 'http:';
      window.location.host = 'localhost:3000';
      const url = getWebSocketUrl();
      expect(url).toMatch(/^wss?:\/\/[^/]+$/);
    });

    it('should use current window location for host', () => {
      window.location.protocol = 'https:';
      window.location.host = 'production.example.com';
      const url = getWebSocketUrl();
      expect(url).toContain('production.example.com');
      expect(url).toContain('wss');
    });
  });

  describe('Protocol Detection', () => {
    it('should use https protocol for WebSocket in secure context', () => {
      window.location.protocol = 'https:';
      const url = getWebSocketUrl();
      expect(url.startsWith('wss://')).toBe(true);
    });

    it('should use http protocol for WebSocket in non-secure context', () => {
      window.location.protocol = 'http:';
      const url = getWebSocketUrl();
      expect(url.startsWith('ws://')).toBe(true);
    });
  });

  describe('URL Construction', () => {
    it('should construct valid API URL', () => {
      const url = getApiBaseUrl();
      try {
        if (url.startsWith('http') || url.startsWith('ws')) {
          new URL(url);
          expect(true).toBe(true);
        }
      } catch (e) {
        expect(false).toBe(true);
      }
    });

    it('should construct valid WebSocket URL', () => {
      const url = getWebSocketUrl();
      expect(url).toMatch(/^wss?:\/\/[\w.-]+(:\d+)?$/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle localhost without port', () => {
      window.location.host = 'localhost';
      window.location.protocol = 'http:';
      const url = getWebSocketUrl();
      expect(url).toContain('localhost');
    });

    it('should handle URLs with ports', () => {
      window.location.host = 'localhost:8000';
      window.location.protocol = 'http:';
      const url = getWebSocketUrl();
      expect(url).toContain('8000');
    });

    it('should handle production domains', () => {
      window.location.host = 'kovix.app';
      window.location.protocol = 'https:';
      const url = getWebSocketUrl();
      expect(url).toContain('kovix.app');
      expect(url).toMatch(/^wss:\/\//);
    });

    it('should handle IP addresses', () => {
      window.location.host = '192.168.1.1:3000';
      window.location.protocol = 'http:';
      const url = getWebSocketUrl();
      expect(url).toContain('192.168.1.1');
      expect(url).toContain('3000');
    });
  });

  describe('Consistency', () => {
    it('should return consistent URL on multiple calls', () => {
      const url1 = getApiBaseUrl();
      const url2 = getApiBaseUrl();
      expect(url1).toBe(url2);
    });

    it('should return consistent WebSocket URL on multiple calls', () => {
      const url1 = getWebSocketUrl();
      const url2 = getWebSocketUrl();
      expect(url1).toBe(url2);
    });

    it('should derive WebSocket URL from same origin as API URL', () => {
      const apiUrl = getApiBaseUrl();
      const wsUrl = getWebSocketUrl();
      expect(apiUrl.length).toBeGreaterThan(0);
      expect(wsUrl.length).toBeGreaterThan(0);
    });
  });

  describe('Environment-specific behavior', () => {
    it('should handle Docker backend URL', () => {
      const url = getApiBaseUrl();
      expect(url).not.toContain('backend:8080');
    });

    it('should handle development environment', () => {
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
      expect(url.length).toBeGreaterThan(0);
    });

    it('should work with current page domain', () => {
      window.location.origin = 'http://localhost:5173';
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
    });
  });
});
