import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './FeedbackState.module.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Veriler Yüklenemedi',
  message = 'Backend sunucusuna bağlanılamadı. Lütfen sunucunun ve veritabanının açık olduğunu kontrol edin.',
  onRetry,
}) => {
  return (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.errorIcon}>
        <AlertCircle size={32} aria-hidden="true" />
      </div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          <span>Tekrar Dene</span>
        </button>
      )}
    </div>
  );
};
