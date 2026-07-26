import React, { useEffect, useState } from 'react';
import styles from '../styles/stats.module.css';

interface Stats {
  totalViewers?: number;
  activeStreams?: number;
  bandwidth?: number;
  uptime?: number;
}

interface StreamStatsProps {
  stats: Stats | null;
}

export const StreamStats: React.FC<StreamStatsProps> = ({ stats }) => {
  const [displayStats, setDisplayStats] = useState<Stats>({
    totalViewers: 0,
    activeStreams: 0,
    bandwidth: 0,
    uptime: 0,
  });

  useEffect(() => {
    if (stats) {
      setDisplayStats(stats);
    }
  }, [stats]);

  const formatBandwidth = (bytes?: number) => {
    if (!bytes) return '0 Mbps';
    const mbps = (bytes / 1024 / 1024) * 8;
    return `${mbps.toFixed(2)} Mbps`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.statsContainer}>
      <h3>Stream Statistics</h3>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.label}>Total Viewers</div>
          <div className={styles.value}>{displayStats.totalViewers || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>Active Streams</div>
          <div className={styles.value}>{displayStats.activeStreams || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>Bandwidth</div>
          <div className={styles.value}>{formatBandwidth(displayStats.bandwidth)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.label}>Uptime</div>
          <div className={styles.value}>{formatUptime(displayStats.uptime)}</div>
        </div>
      </div>
    </div>
  );
};
