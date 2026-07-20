import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Customer, CustomerFormInput } from '../types/customerTypes';
import { CustomerFormInputSchema } from '../schemas/customerSchema';
import styles from './CustomerFormDialog.module.css';

interface CustomerFormDialogProps {
  isOpen: boolean;
  customerToEdit?: Customer | null;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (data: CustomerFormInput) => void;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  isOpen,
  customerToEdit,
  isLoading = false,
  serverError,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(customerToEdit);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState<CustomerFormInput>({
    fullName: '',
    email: '',
    phoneNumber: '',
    notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;

      if (customerToEdit) {
        setFormData({
          fullName: customerToEdit.fullName || '',
          email: customerToEdit.email || '',
          phoneNumber: customerToEdit.phoneNumber || '',
          notes: customerToEdit.notes || '',
        });
      } else {
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          notes: '',
        });
      }
      setFieldErrors({});

      setTimeout(() => {
        fullNameRef.current?.focus();
      }, 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen, customerToEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && dialogRef.current) {
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = CustomerFormInputSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setFieldErrors({});
    onSubmit(result.data);
  };

  return (
    <div className={styles.overlay} onClick={() => !isLoading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={handleDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="dialog-title" className={styles.title}>
            {isEditing ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Oluştur'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Kapat"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {serverError && (
            <div className={styles.serverError} role="alert">
              {serverError}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>
              Ad Soyad <span className={styles.required}>*</span>
            </label>
            <input
              ref={fullNameRef}
              id="fullName"
              name="fullName"
              type="text"
              className={`${styles.input} ${fieldErrors.fullName ? styles.inputError : ''}`}
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
            />
            {fieldErrors.fullName && (
              <span id="fullName-error" className={styles.errorText}>
                {fieldErrors.fullName}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              E-posta Adresi <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className={styles.errorText}>
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Telefon Numarası
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              className={`${styles.input} ${fieldErrors.phoneNumber ? styles.inputError : ''}`}
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Örn: 05551234567"
              aria-invalid={Boolean(fieldErrors.phoneNumber)}
              aria-describedby={fieldErrors.phoneNumber ? 'phoneNumber-error' : undefined}
            />
            {fieldErrors.phoneNumber && (
              <span id="phoneNumber-error" className={styles.errorText}>
                {fieldErrors.phoneNumber}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="notes" className={styles.label}>
              Notlar
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className={`${styles.textarea} ${fieldErrors.notes ? styles.inputError : ''}`}
              value={formData.notes || ''}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Müşteri hakkında özel notlar..."
              aria-invalid={Boolean(fieldErrors.notes)}
              aria-describedby={fieldErrors.notes ? 'notes-error' : undefined}
            />
            {fieldErrors.notes && (
              <span id="notes-error" className={styles.errorText}>
                {fieldErrors.notes}
              </span>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Vazgeç
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading && <Loader2 size={16} className={styles.spin} aria-hidden="true" />}
              <span>{isEditing ? 'Güncelle' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
