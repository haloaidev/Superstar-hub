import express from 'express';
import axios from 'axios';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();

app.use(express.json());

// Store active RTMP streams
interface RTMPStream {
  id: string;
  name: string;
  rtmpUrl: string;
  status: 'active' | 'inactive' | 'error';
  bitrate?: number;
  process?: any;
  startedAt?: number;
}

const streams: Map<string, RTMPStream> = new Map();
const streamProcesses: Map<string, any> = new Map();

// Get all streams
app.get('/api/streams', (req, res) => {
  const streamList = Array.from(streams.values()).map(stream => ({
    id: stream.id,
    name: stream.name,
    rtmpUrl: stream.rtmpUrl,
    status: stream.status,
    bitrate: stream.bitrate,
  }));
  res.json(streamList);
});

// Add new stream
app.post('/api/streams', (req, res) => {
  const { name, rtmpUrl } = req.body;

  if (!name || !rtmpUrl) {
    return res.status(400).json({ error: 'Name and RTMP URL required' });
  }

  const id = `stream_${Date.now()}`;
  const stream: RTMPStream = {
    id,
    name,
    rtmpUrl,
    status: 'inactive',
  };

  streams.set(id, stream);
  res.json(stream);
});

// Remove stream
app.delete('/api/streams/:id', async (req, res) => {
  const { id } = req.params;
  const stream = streams.get(id);

  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  // Stop if active
  if (stream.status === 'active') {
    const process = streamProcesses.get(id);
    if (process) {
      process.kill();
      streamProcesses.delete(id);
    }
  }

  streams.delete(id);
  res.json({ success: true });
});

// Start stream
app.post('/api/streams/:id/start', async (req, res) => {
  const { id } = req.params;
  const stream = streams.get(id);

  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  if (stream.status === 'active') {
    return res.status(400).json({ error: 'Stream already active' });
  }

  try {
    // Use ffmpeg to proxy RTMP stream
    // This is a simplified example - in production, use proper RTMP server
    stream.status = 'active';
    stream.startedAt = Date.now();
    stream.bitrate = Math.random() * 5 + 1; // Simulate bitrate

    // In production, you'd actually start an RTMP proxy here
    // const ffmpegCmd = `ffmpeg -i "${stream.rtmpUrl}" -c copy -f flv rtmp://localhost/live/${id}`;
    // This would be run in a separate process with monitoring

    streams.set(id, stream);
    res.json(stream);
  } catch (error) {
    stream.status = 'error';
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

// Stop stream
app.post('/api/streams/:id/stop', (req, res) => {
  const { id } = req.params;
  const stream = streams.get(id);

  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  if (stream.status !== 'active') {
    return res.status(400).json({ error: 'Stream is not active' });
  }

  const process = streamProcesses.get(id);
  if (process) {
    process.kill();
    streamProcesses.delete(id);
  }

  stream.status = 'inactive';
  stream.bitrate = undefined;
  streams.set(id, stream);

  res.json(stream);
});

// Get stream status
app.get('/api/streams/:id', (req, res) => {
  const { id } = req.params;
  const stream = streams.get(id);

  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  res.json(stream);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    activeStreams: Array.from(streams.values()).filter(s => s.status === 'active')
      .length,
  });
});

const PORT = process.env.RTMP_PROXY_PORT || 3002;
app.listen(PORT, () => {
  console.log(`RTMP Proxy server running on port ${PORT}`);
});
