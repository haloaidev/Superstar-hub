import React, { useState, useEffect } from 'react';
import { ChatPanel } from './ChatPanel';
import { StreamStats } from './StreamStats';
import { RTMPConfig } from './RTMPConfig';
import styles from '../styles/broadcast.module.css';

interface ChannelData {
  id: string;
  name: string;
  status: 'live' | 'offline';
  viewers?: number;
}

export const BroadcastUI: React.FC = () => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
    fetchStats();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/channels');
      if (!response.ok) throw new Error('Failed to fetch channels');
      const data = await response.json();
      setChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>🌟 SUPERSTAR BROADCAST HUB</h1>
        <p className={styles.subtitle}>Professional Multi-Platform Streaming System</p>
      </header>

      <div className={styles.mainContent}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.controlsSection}>
          <button onClick={fetchChannels} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Channels'}
          </button>
          <button onClick={fetchStats}>Refresh Stats</button>
        </div>

        <div className={styles.gridContainer}>
          <div className={styles.leftPanel}>
            <RTMPConfig />
            <StreamStats stats={stats} />
          </div>

          <div className={styles.mainPanel}>
            <div className={styles.channelsSection}>
              <h2>Active Channels</h2>
              <div className={styles.channelsList}>
                {channels.length === 0 ? (
                  <p className={styles.emptyState}>No channels available</p>
                ) : (
                  channels.map(channel => (
                    <div
                      key={channel.id}
                      className={`${styles.channelCard} ${
                        selectedChannel === channel.id ? styles.active : ''
                      }`}
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <div className={styles.channelHeader}>
                        <h3>{channel.name}</h3>
                        <span
                          className={`${styles.statusBadge} ${
                            channel.status === 'live' ? styles.live : styles.offline
                          }`}
                        >
                          {channel.status === 'live' ? '🔴 LIVE' : 'Offline'}
                        </span>
                      </div>
                      {channel.viewers !== undefined && (
                        <p className={styles.viewers}>{channel.viewers} viewers</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedChannel && (
              <ChatPanel channelId={selectedChannel} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
