import React from 'react';
import { Laptop, Clock } from 'lucide-react';
import styles from '../../../components/feedback/PlaceholderPage.module.css';

export const DevicesPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <Laptop size={36} aria-hidden="true" />
        </div>
        <h2 className={styles.title}>Cihaz Yönetimi Modülü</h2>
        <p className={styles.description}>
          Cihaz kayıtları, seri numarası ve müşteri eşleştirmeleri <strong>Sprint 5B</strong>{' '}
          kapsamında masaüstü uygulamasına entegre edilecektir.
        </p>
        <div className={styles.badge}>
          <Clock size={14} aria-hidden="true" />
          <span>Gelecek Sprintte Kullanıma Açılacaktır</span>
        </div>
      </div>
    </div>
  );
};
