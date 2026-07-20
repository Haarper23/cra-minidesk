import React from 'react';
import { useLocation } from 'react-router-dom';
import { Server, ServerOff, Loader2, AlertTriangle } from 'lucide-react';
import { useBackendStatusContext } from '../../app/useBackendStatusContext';
import styles from './TopBar.module.css';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Gösterge Paneli',
  '/customers': 'Müşteri Yönetimi',
  '/devices': 'Cihaz Yönetimi',
  '/repair-orders': 'Servis Kayıtları',
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Sayfa Bulunamadı';
  const { status } = useBackendStatusContext();

  const renderIcon = () => {
    switch (status.badgeClass) {
      case 'pending':
        return <Loader2 size={14} aria-hidden="true" className={styles.spin} />;
      case 'disconnected':
        return <ServerOff size={14} aria-hidden="true" />;
      case 'error':
        return <AlertTriangle size={14} aria-hidden="true" />;
      case 'connected':
      default:
        return <Server size={14} aria-hidden="true" />;
    }
  };

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{pageTitle}</h1>

      <div className={styles.statusArea}>
        <div
          className={`${styles.statusBadge} ${styles[status.badgeClass]}`}
          title={`Backend Durumu: ${status.label}`}
          role="status"
          aria-live="polite"
          aria-label={`Backend Durumu: ${status.label}`}
        >
          {renderIcon()}
          <span>{status.label}</span>
        </div>
      </div>
    </header>
  );
};
