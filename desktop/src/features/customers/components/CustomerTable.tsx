import React from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Customer, CustomerSortField, SortDirection } from '../types/customerTypes';
import styles from './CustomerTable.module.css';

interface CustomerTableProps {
  customers: Customer[];
  sortBy: CustomerSortField;
  sortDirection: SortDirection;
  onSortChange: (field: CustomerSortField) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  sortBy,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderSortHeader = (field: CustomerSortField, label: string) => {
    const isActive = sortBy === field;
    const ariaSortValue = isActive
      ? sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none';

    return (
      <th scope="col" aria-sort={ariaSortValue}>
        <button
          type="button"
          className={`${styles.sortButton} ${isActive ? styles.sortActive : ''}`}
          onClick={() => onSortChange(field)}
          aria-label={`${label} sütununa göre sırala (${isActive ? (sortDirection === 'asc' ? 'Artan' : 'Azalan') : 'Sırala'})`}
        >
          <span>{label}</span>
          <span className={styles.sortIcon}>
            {isActive ? (
              sortDirection === 'asc' ? (
                <ArrowUp size={14} aria-hidden="true" />
              ) : (
                <ArrowDown size={14} aria-hidden="true" />
              )
            ) : (
              <ArrowUpDown size={14} aria-hidden="true" />
            )}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {renderSortHeader('fullName', 'Ad Soyad')}
            {renderSortHeader('email', 'E-posta')}
            <th scope="col">Telefon</th>
            {renderSortHeader('createdAt', 'Oluşturulma Tarihi')}
            {renderSortHeader('updatedAt', 'Güncellenme Tarihi')}
            <th scope="col" className={styles.alignRight}>
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className={styles.row}>
              <td className={styles.cellMain}>
                <span className={styles.fullName}>{customer.fullName}</span>
                {customer.notes && (
                  <span className={styles.notesTruncated} title={customer.notes}>
                    {customer.notes}
                  </span>
                )}
              </td>
              <td>{customer.email}</td>
              <td>{customer.phoneNumber || '—'}</td>
              <td className={styles.dateCell}>{formatDate(customer.createdAt)}</td>
              <td className={styles.dateCell}>{formatDate(customer.updatedAt)}</td>
              <td className={styles.alignRight}>
                <div className={styles.actionGroup}>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => onEdit(customer)}
                    aria-label={`${customer.fullName} müşterisini düzenle`}
                    title="Düzenle"
                  >
                    <Edit2 size={15} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onDelete(customer)}
                    aria-label={`${customer.fullName} müşterisini sil`}
                    title="Sil"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
