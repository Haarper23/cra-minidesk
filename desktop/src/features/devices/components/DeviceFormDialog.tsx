import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Search, ChevronDown, AlertCircle } from 'lucide-react';
import { Device, DeviceFormInput, DeviceType, DEVICE_TYPE_LABELS } from '../types/deviceTypes';
import { DeviceFormInputSchema } from '../schemas/deviceSchema';
import { useCustomerSearch } from '../hooks/useCustomerSearch';
import { Customer } from '../../customers/types/customerTypes';
import styles from './DeviceFormDialog.module.css';

interface DeviceFormDialogProps {
  isOpen: boolean;
  deviceToEdit?: Device | null;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (data: DeviceFormInput) => void;
}

export const DeviceFormDialog: React.FC<DeviceFormDialogProps> = ({
  isOpen,
  deviceToEdit,
  isLoading = false,
  serverError,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(deviceToEdit);
  const brandRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const comboboxInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Bounded server-backed customer search
  const {
    customers,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    errorMessage: customerErrorMessage,
    searchText: customerSearchText,
    setSearchText: setCustomerSearchText,
  } = useCustomerSearch();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [activeDescendantIndex, setActiveDescendantIndex] = useState(-1);

  const [formData, setFormData] = useState<DeviceFormInput>({
    customerId: 0,
    brand: '',
    model: '',
    serialNumber: '',
    deviceType: 'LAPTOP',
    color: '',
    accessories: '',
    conditionNotes: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Build display list: pin selected customer even when absent from search results
  const displayCustomers = (() => {
    if (!selectedCustomer) return customers;
    const isInResults = customers.some((c) => c.id === selectedCustomer.id);
    if (isInResults) return customers;
    return [selectedCustomer, ...customers];
  })();

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;

      if (deviceToEdit) {
        setFormData({
          customerId: deviceToEdit.customerId,
          brand: deviceToEdit.brand || '',
          model: deviceToEdit.model || '',
          serialNumber: deviceToEdit.serialNumber || '',
          deviceType: deviceToEdit.deviceType || 'LAPTOP',
          color: deviceToEdit.color || '',
          accessories: deviceToEdit.accessories || '',
          conditionNotes: deviceToEdit.conditionNotes || '',
        });
        // In edit mode, create a synthetic selected customer from the device data
        setSelectedCustomer({
          id: deviceToEdit.customerId,
          fullName: deviceToEdit.customerFullName,
          email: '',
          phoneNumber: null,
          notes: null,
          createdAt: '',
          updatedAt: '',
        });
        setCustomerSearchText('');
      } else {
        setFormData({
          customerId: 0,
          brand: '',
          model: '',
          serialNumber: '',
          deviceType: 'LAPTOP',
          color: '',
          accessories: '',
          conditionNotes: '',
        });
        setSelectedCustomer(null);
        setCustomerSearchText('');
      }
      setFieldErrors({});
      setIsComboboxOpen(false);
      setActiveDescendantIndex(-1);

      setTimeout(() => {
        brandRef.current?.focus();
      }, 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen, deviceToEdit, setCustomerSearchText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Scroll active option into view
  useEffect(() => {
    if (activeDescendantIndex >= 0 && listboxRef.current) {
      const option = listboxRef.current.children[activeDescendantIndex] as HTMLElement;
      option?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeDescendantIndex]);

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && dialogRef.current) {
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearchText('');
    setIsComboboxOpen(false);
    setActiveDescendantIndex(-1);
    if (fieldErrors.customerId) {
      setFieldErrors((prev) => ({ ...prev, customerId: '' }));
    }
  };

  const handleComboboxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsComboboxOpen(true);
      setActiveDescendantIndex((prev) => (prev < displayCustomers.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsComboboxOpen(true);
      setActiveDescendantIndex((prev) => (prev > 0 ? prev - 1 : displayCustomers.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeDescendantIndex >= 0 && activeDescendantIndex < displayCustomers.length) {
        handleSelectCustomer(displayCustomers[activeDescendantIndex]);
      }
    } else if (e.key === 'Escape') {
      if (isComboboxOpen) {
        e.stopPropagation();
        setIsComboboxOpen(false);
        setActiveDescendantIndex(-1);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = DeviceFormInputSchema.safeParse(formData);
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

  const activeDescendantId =
    activeDescendantIndex >= 0
      ? `customer-option-${displayCustomers[activeDescendantIndex]?.id}`
      : undefined;

  return (
    <div className={styles.overlay} onClick={() => !isLoading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-dialog-title"
        onKeyDown={handleDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="device-dialog-title" className={styles.title}>
            {isEditing ? 'Cihazı Düzenle' : 'Yeni Cihaz Kaydı'}
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

          {/* Customer combobox selector */}
          <div className={styles.field}>
            <label htmlFor="customer-search-input" className={styles.label}>
              Müşteri <span className={styles.required}>*</span>
            </label>

            {isEditing && selectedCustomer ? (
              // In edit mode, show the selected customer as read-only
              <div className={styles.selectedCustomerReadonly}>
                <span>{selectedCustomer.fullName}</span>
                <input type="hidden" name="customerId" value={formData.customerId} />
              </div>
            ) : (
              <div className={styles.comboboxContainer}>
                {selectedCustomer ? (
                  <div className={styles.selectedCustomerChip}>
                    <span className={styles.chipText}>
                      {selectedCustomer.fullName}
                      {selectedCustomer.email ? ` (${selectedCustomer.email})` : ''}
                    </span>
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => {
                        setSelectedCustomer(null);
                        setFormData((prev) => ({ ...prev, customerId: 0 }));
                        setCustomerSearchText('');
                        setIsComboboxOpen(true);
                        setTimeout(() => comboboxInputRef.current?.focus(), 0);
                      }}
                      disabled={isLoading}
                      aria-label="Müşteri seçimini kaldır"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.comboboxInputWrapper}>
                    <Search size={16} className={styles.comboboxSearchIcon} aria-hidden="true" />
                    <input
                      ref={comboboxInputRef}
                      id="customer-search-input"
                      type="text"
                      role="combobox"
                      aria-expanded={isComboboxOpen}
                      aria-controls="customer-listbox"
                      aria-activedescendant={activeDescendantId}
                      aria-autocomplete="list"
                      aria-label="Müşteri ara"
                      aria-invalid={Boolean(fieldErrors.customerId)}
                      aria-describedby={fieldErrors.customerId ? 'customerId-error' : undefined}
                      className={`${styles.comboboxInput} ${fieldErrors.customerId ? styles.inputError : ''}`}
                      placeholder="Müşteri adı ile arayın..."
                      value={customerSearchText}
                      onChange={(e) => {
                        setCustomerSearchText(e.target.value);
                        setIsComboboxOpen(true);
                        setActiveDescendantIndex(-1);
                      }}
                      onFocus={() => setIsComboboxOpen(true)}
                      onBlur={() => {
                        // Delay to allow click on options
                        setTimeout(() => setIsComboboxOpen(false), 200);
                      }}
                      onKeyDown={handleComboboxKeyDown}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                    <ChevronDown size={16} className={styles.comboboxChevron} aria-hidden="true" />
                  </div>
                )}

                {isComboboxOpen && !selectedCustomer && (
                  <ul
                    ref={listboxRef}
                    id="customer-listbox"
                    role="listbox"
                    aria-label="Müşteri listesi"
                    className={styles.comboboxDropdown}
                  >
                    {isCustomersLoading ? (
                      <li className={styles.comboboxStatusItem} role="option" aria-selected={false}>
                        <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                        <span>Müşteriler aranıyor...</span>
                      </li>
                    ) : isCustomersError ? (
                      <li className={styles.comboboxStatusItem} role="option" aria-selected={false}>
                        <AlertCircle size={16} aria-hidden="true" />
                        <span>{customerErrorMessage || 'Müşteri araması başarısız oldu.'}</span>
                      </li>
                    ) : displayCustomers.length === 0 ? (
                      <li className={styles.comboboxStatusItem} role="option" aria-selected={false}>
                        <span>
                          {customerSearchText.trim()
                            ? 'Eşleşen müşteri bulunamadı.'
                            : 'Henüz müşteri bulunmuyor.'}
                        </span>
                      </li>
                    ) : (
                      displayCustomers.map((customer, index) => (
                        <li
                          key={customer.id}
                          id={`customer-option-${customer.id}`}
                          role="option"
                          aria-selected={index === activeDescendantIndex}
                          className={`${styles.comboboxOption} ${index === activeDescendantIndex ? styles.comboboxOptionActive : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCustomer(customer);
                          }}
                          onMouseEnter={() => setActiveDescendantIndex(index)}
                        >
                          <span className={styles.optionName}>{customer.fullName}</span>
                          <span className={styles.optionEmail}>{customer.email}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}

            {fieldErrors.customerId && (
              <span id="customerId-error" className={styles.errorText}>
                {fieldErrors.customerId}
              </span>
            )}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="brand" className={styles.label}>
                Marka <span className={styles.required}>*</span>
              </label>
              <input
                ref={brandRef}
                id="brand"
                name="brand"
                type="text"
                className={`${styles.input} ${fieldErrors.brand ? styles.inputError : ''}`}
                value={formData.brand}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Örn: Apple, Dell, Asus"
                aria-invalid={Boolean(fieldErrors.brand)}
                aria-describedby={fieldErrors.brand ? 'brand-error' : undefined}
              />
              {fieldErrors.brand && (
                <span id="brand-error" className={styles.errorText}>
                  {fieldErrors.brand}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="model" className={styles.label}>
                Model <span className={styles.required}>*</span>
              </label>
              <input
                id="model"
                name="model"
                type="text"
                className={`${styles.input} ${fieldErrors.model ? styles.inputError : ''}`}
                value={formData.model}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Örn: MacBook Pro, XPS 15"
                aria-invalid={Boolean(fieldErrors.model)}
                aria-describedby={fieldErrors.model ? 'model-error' : undefined}
              />
              {fieldErrors.model && (
                <span id="model-error" className={styles.errorText}>
                  {fieldErrors.model}
                </span>
              )}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="deviceType" className={styles.label}>
                Cihaz Türü <span className={styles.required}>*</span>
              </label>
              <select
                id="deviceType"
                name="deviceType"
                className={`${styles.select} ${fieldErrors.deviceType ? styles.inputError : ''}`}
                value={formData.deviceType}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.deviceType)}
                aria-describedby={fieldErrors.deviceType ? 'deviceType-error' : undefined}
              >
                {(Object.keys(DEVICE_TYPE_LABELS) as DeviceType[]).map((type) => (
                  <option key={type} value={type}>
                    {DEVICE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              {fieldErrors.deviceType && (
                <span id="deviceType-error" className={styles.errorText}>
                  {fieldErrors.deviceType}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="serialNumber" className={styles.label}>
                Seri Numarası
              </label>
              <input
                id="serialNumber"
                name="serialNumber"
                type="text"
                className={`${styles.input} ${fieldErrors.serialNumber ? styles.inputError : ''}`}
                value={formData.serialNumber || ''}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Örn: C02XG011JGH7"
                aria-invalid={Boolean(fieldErrors.serialNumber)}
                aria-describedby={fieldErrors.serialNumber ? 'serialNumber-error' : undefined}
              />
              {fieldErrors.serialNumber && (
                <span id="serialNumber-error" className={styles.errorText}>
                  {fieldErrors.serialNumber}
                </span>
              )}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="color" className={styles.label}>
                Renk
              </label>
              <input
                id="color"
                name="color"
                type="text"
                className={`${styles.input} ${fieldErrors.color ? styles.inputError : ''}`}
                value={formData.color || ''}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Örn: Uzay Grisi, Siyah"
                aria-invalid={Boolean(fieldErrors.color)}
                aria-describedby={fieldErrors.color ? 'color-error' : undefined}
              />
              {fieldErrors.color && (
                <span id="color-error" className={styles.errorText}>
                  {fieldErrors.color}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="accessories" className={styles.label}>
                Aksesuarlar
              </label>
              <input
                id="accessories"
                name="accessories"
                type="text"
                className={`${styles.input} ${fieldErrors.accessories ? styles.inputError : ''}`}
                value={formData.accessories || ''}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Örn: Şarj adaptörü, Çanta"
                aria-invalid={Boolean(fieldErrors.accessories)}
                aria-describedby={fieldErrors.accessories ? 'accessories-error' : undefined}
              />
              {fieldErrors.accessories && (
                <span id="accessories-error" className={styles.errorText}>
                  {fieldErrors.accessories}
                </span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="conditionNotes" className={styles.label}>
              Durum Notları / Fiziki Hasar
            </label>
            <textarea
              id="conditionNotes"
              name="conditionNotes"
              rows={3}
              className={`${styles.textarea} ${fieldErrors.conditionNotes ? styles.inputError : ''}`}
              value={formData.conditionNotes || ''}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Cihazın teslim anındaki çizik, ezik veya arıza durum notları..."
              aria-invalid={Boolean(fieldErrors.conditionNotes)}
              aria-describedby={fieldErrors.conditionNotes ? 'conditionNotes-error' : undefined}
            />
            {fieldErrors.conditionNotes && (
              <span id="conditionNotes-error" className={styles.errorText}>
                {fieldErrors.conditionNotes}
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
