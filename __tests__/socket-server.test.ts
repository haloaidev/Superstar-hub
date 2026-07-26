import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

describe('Socket.IO Server', () => {
  describe('REST API', () => {
    it('should return empty channels on startup', async () => {
      const response = await axios.get(`${API_URL}/api/channels`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should return stats', async () => {
      const response = await axios.get(`${API_URL}/api/stats`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalViewers');
      expect(response.data).toHaveProperty('activeStreams');
      expect(response.data).toHaveProperty('uptime');
    });

    it('should return health status', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    });
  });
});
