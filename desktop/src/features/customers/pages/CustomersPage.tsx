import React from 'react';
import { Users, Clock } from 'lucide-react';
import styles from '../../../components/feedback/PlaceholderPage.module.css';

export const CustomersPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <Users size={36} aria-hidden="true" />
        </div>
        <h2 className={styles.title}>Müşteri Yönetimi Modülü</h2>
        <p className={styles.description}>
          Müşteri listeleme, arama, filtreleme, yeni müşteri kaydı ve detay görünümleri{' '}
          <strong>Sprint 5B</strong> kapsamında masaüstü uygulamasına entegre edilecektir.
        </p>
        <div className={styles.badge}>
          <Clock size={14} aria-hidden="true" />
          <span>Gelecek Sprintte Kullanıma Açılacaktır</span>
        </div>
      </div>
    </div>
  );
};
