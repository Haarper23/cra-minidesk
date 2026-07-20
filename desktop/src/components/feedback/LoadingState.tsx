import React from 'react';
import styles from './FeedbackState.module.css';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Veriler yükleniyor...',
}) => {
  return (
    <div className={styles.loadingContainer} role="status" aria-live="polite">
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </div>

      <div className={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={`${styles.skeleton} ${styles.skeletonCardTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonCardValue}`}></div>
          </div>
        ))}
      </div>

      <div className={styles.skeletonBlock}>
        <div className={`${styles.skeleton} ${styles.skeletonBlockHeader}`}></div>
        <div className={styles.skeletonRowGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonRow}`}></div>
          ))}
        </div>
      </div>

      <p className="sr-only">{message}</p>
    </div>
  );
};
