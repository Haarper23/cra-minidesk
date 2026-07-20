import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import styles from '../components/feedback/PlaceholderPage.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <FileQuestion size={36} aria-hidden="true" />
        </div>
        <h2 className={styles.title}>Sayfa Bulunamadı (404)</h2>
        <p className={styles.description}>
          Ulaşmaya çalıştığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak erişilemiyor
          olabilir.
        </p>
        <Link
          to="/dashboard"
          className={styles.badge}
          style={{
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
          }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Gösterge Paneline Dön</span>
        </Link>
      </div>
    </div>
  );
};
