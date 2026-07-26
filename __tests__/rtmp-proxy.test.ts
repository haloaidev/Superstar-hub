import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const API_URL = 'http://localhost:3002';

describe('RTMP Proxy Server', () => {
  describe('REST API', () => {
    it('should return empty streams on startup', async () => {
      const response = await axios.get(`${API_URL}/api/streams`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should add a new stream', async () => {
      const response = await axios.post(`${API_URL}/api/streams`, {
        name: 'Test Stream',
        rtmpUrl: 'rtmp://example.com/live/test',
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name', 'Test Stream');
      expect(response.data).toHaveProperty('status', 'inactive');
    });

    it('should return health status', async () => {
      const response = await axios.get(`${API_URL}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    });
  });
});
