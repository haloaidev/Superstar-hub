import React, { useState } from 'react';
import styles from '../styles/rtmp.module.css';

interface RTMPStream {
  id: string;
  name: string;
  rtmpUrl: string;
  status: 'active' | 'inactive' | 'error';
  bitrate?: number;
}

export const RTMPConfig: React.FC = () => {
  const [streams, setStreams] = useState<RTMPStream[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rtmpUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStream = async () => {
    if (!formData.name.trim() || !formData.rtmpUrl.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add stream');

      const newStream = await response.json();
      setStreams(prev => [...prev, newStream]);
      setFormData({ name: '', rtmpUrl: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStream = async (streamId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove stream');
      setStreams(prev => prev.filter(s => s.id !== streamId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStartStream = async (streamId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}/start`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start stream');
      const updated = await response.json();
      setStreams(prev => prev.map(s => (s.id === streamId ? updated : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStopStream = async (streamId: string) => {
    try {
      const response = await fetch(`/api/streams/${streamId}/stop`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop stream');
      const updated = await response.json();
      setStreams(prev => prev.map(s => (s.id === streamId ? updated : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className={styles.rtmpConfig}>
      <div className={styles.header}>
        <h3>RTMP Stream Configuration</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={styles.toggleButton}
        >
          {showForm ? '✕' : '+ Add Stream'}
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Stream Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="rtmpUrl"
            placeholder="RTMP URL (rtmp://...)"
            value={formData.rtmpUrl}
            onChange={handleInputChange}
          />
          <button
            onClick={handleAddStream}
            disabled={loading}
            className={styles.addButton}
          >
            {loading ? 'Adding...' : 'Add Stream'}
          </button>
        </div>
      )}

      <div className={styles.streamsList}>
        {streams.length === 0 ? (
          <p className={styles.emptyState}>No RTMP streams configured</p>
        ) : (
          streams.map(stream => (
            <div key={stream.id} className={`${styles.streamItem} ${styles[stream.status]}`}>
              <div className={styles.streamInfo}>
                <h4>{stream.name}</h4>
                <p className={styles.url}>{stream.rtmpUrl}</p>
                <div className={styles.streamMeta}>
                  <span className={styles.status}>{stream.status}</span>
                  {stream.bitrate && (
                    <span className={styles.bitrate}>{stream.bitrate} Mbps</span>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                {stream.status === 'active' ? (
                  <button
                    onClick={() => handleStopStream(stream.id)}
                    className={styles.stopButton}
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartStream(stream.id)}
                    className={styles.startButton}
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={() => handleRemoveStream(stream.id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
