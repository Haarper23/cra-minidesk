import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, Laptop, ShieldCheck, LucideIcon } from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard },
  { to: '/customers', label: 'Müşteriler', icon: Users },
  { to: '/devices', label: 'Cihazlar', icon: Laptop },
  { to: '/repair-orders', label: 'Servis Kayıtları', icon: Wrench },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar} aria-label="Ana Gezinti">
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <ShieldCheck size={22} aria-hidden="true" />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>CRA MiniDesk</span>
          <span className={styles.brandSubtitle}>Servis Yönetimi</span>
        </div>
      </div>

      <nav className={styles.nav} role="navigation">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                  }
                >
                  <IconComponent size={18} aria-hidden="true" className={styles.icon} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <span className={styles.version}>v0.1.0 • Sprint 5A</span>
      </div>
    </aside>
  );
};
