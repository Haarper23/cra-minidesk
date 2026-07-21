import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Search, ChevronDown, AlertCircle } from 'lucide-react';
import {
  RepairOrder,
  CreateRepairOrderInput,
  UpdateRepairOrderInput,
  RepairPriority,
  REPAIR_PRIORITY_LABELS,
} from '../types/repairOrderTypes';
import {
  CreateRepairOrderInputSchema,
  UpdateRepairOrderInputSchema,
} from '../schemas/repairOrderSchema';
import { useCustomerSearch } from '../../devices/hooks/useCustomerSearch';
import { useDeviceSearch } from '../hooks/useDeviceSearch';
import { Customer } from '../../customers/types/customerTypes';
import { Device } from '../../devices/types/deviceTypes';
import styles from './RepairOrderFormDialog.module.css';

interface RepairOrderFormDialogProps {
  isOpen: boolean;
  orderToEdit?: RepairOrder | null;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmitCreate: (data: CreateRepairOrderInput) => void;
  onSubmitUpdate: (id: number, data: UpdateRepairOrderInput) => void;
}

export const RepairOrderFormDialog: React.FC<RepairOrderFormDialogProps> = ({
  isOpen,
  orderToEdit,
  isLoading = false,
  serverError,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}) => {
  const isEditing = Boolean(orderToEdit);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const reportedIssueRef = useRef<HTMLTextAreaElement>(null);

  // Customer combobox search
  const {
    customers,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    errorMessage: customerErrorMessage,
    searchText: customerSearchText,
    setSearchText: setCustomerSearchText,
  } = useCustomerSearch();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerComboboxOpen, setIsCustomerComboboxOpen] = useState(false);
  const [customerActiveIndex, setCustomerActiveIndex] = useState(-1);

  // Device combobox search (filtered by selectedCustomer.id)
  const selectedCustomerId = selectedCustomer?.id;
  const {
    devices,
    isLoading: isDevicesLoading,
    isError: isDevicesError,
    errorMessage: deviceErrorMessage,
    searchText: deviceSearchText,
    setSearchText: setDeviceSearchText,
  } = useDeviceSearch(selectedCustomerId);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDeviceComboboxOpen, setIsDeviceComboboxOpen] = useState(false);
  const [deviceActiveIndex, setDeviceActiveIndex] = useState(-1);

  // Form State
  const [formData, setFormData] = useState({
    deviceId: 0,
    reportedIssue: '',
    priority: 'NORMAL' as RepairPriority,
    diagnosisNotes: '',
    technicianNotes: '',
    estimatedCost: '',
    finalCost: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;

      if (orderToEdit) {
        setFormData({
          deviceId: orderToEdit.deviceId,
          reportedIssue: orderToEdit.reportedIssue || '',
          priority: orderToEdit.priority || 'NORMAL',
          diagnosisNotes: orderToEdit.diagnosisNotes || '',
          technicianNotes: orderToEdit.technicianNotes || '',
          estimatedCost:
            orderToEdit.estimatedCost !== undefined && orderToEdit.estimatedCost !== null
              ? String(orderToEdit.estimatedCost)
              : '',
          finalCost:
            orderToEdit.finalCost !== undefined && orderToEdit.finalCost !== null
              ? String(orderToEdit.finalCost)
              : '',
        });
        setSelectedCustomer({
          id: orderToEdit.customerId,
          fullName: orderToEdit.customerFullName,
          email: '',
          phoneNumber: null,
          notes: null,
          createdAt: '',
          updatedAt: '',
        });
        setSelectedDevice({
          id: orderToEdit.deviceId,
          customerId: orderToEdit.customerId,
          customerFullName: orderToEdit.customerFullName,
          brand: orderToEdit.deviceBrand,
          model: orderToEdit.deviceModel,
          serialNumber: null,
          deviceType: 'LAPTOP',
          color: null,
          accessories: null,
          conditionNotes: null,
          createdAt: '',
          updatedAt: '',
        });
      } else {
        setFormData({
          deviceId: 0,
          reportedIssue: '',
          priority: 'NORMAL',
          diagnosisNotes: '',
          technicianNotes: '',
          estimatedCost: '',
          finalCost: '',
        });
        setSelectedCustomer(null);
        setSelectedDevice(null);
        setCustomerSearchText('');
        setDeviceSearchText('');
      }
      setFieldErrors({});
      setIsCustomerComboboxOpen(false);
      setIsDeviceComboboxOpen(false);

      setTimeout(() => {
        reportedIssueRef.current?.focus();
      }, 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen, orderToEdit, setCustomerSearchText, setDeviceSearchText]);

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
    setSelectedDevice(null);
    setFormData((prev) => ({ ...prev, deviceId: 0 }));
    setCustomerSearchText('');
    setIsCustomerComboboxOpen(false);
    setCustomerActiveIndex(-1);
  };

  const handleSelectDevice = (device: Device) => {
    setSelectedDevice(device);
    setFormData((prev) => ({ ...prev, deviceId: device.id }));
    setDeviceSearchText('');
    setIsDeviceComboboxOpen(false);
    setDeviceActiveIndex(-1);
    if (fieldErrors.deviceId) {
      setFieldErrors((prev) => ({ ...prev, deviceId: '' }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const estCostNum =
      formData.estimatedCost.trim() === '' ? undefined : Number(formData.estimatedCost);
    const finalCostNum = formData.finalCost.trim() === '' ? undefined : Number(formData.finalCost);

    if (isEditing && orderToEdit) {
      const updatePayload = {
        reportedIssue: formData.reportedIssue,
        priority: formData.priority,
        diagnosisNotes: formData.diagnosisNotes || undefined,
        technicianNotes: formData.technicianNotes || undefined,
        estimatedCost: estCostNum,
        finalCost: finalCostNum,
      };

      const result = UpdateRepairOrderInputSchema.safeParse(updatePayload);
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
      onSubmitUpdate(orderToEdit.id, result.data);
    } else {
      const createPayload = {
        deviceId: formData.deviceId,
        reportedIssue: formData.reportedIssue,
        priority: formData.priority,
        diagnosisNotes: formData.diagnosisNotes || undefined,
        technicianNotes: formData.technicianNotes || undefined,
        estimatedCost: estCostNum,
      };

      const result = CreateRepairOrderInputSchema.safeParse(createPayload);
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
      onSubmitCreate(result.data);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => !isLoading && onClose()}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="repair-order-dialog-title"
        onKeyDown={handleDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="repair-order-dialog-title" className={styles.title}>
            {isEditing
              ? `Servis Kaydını Düzenle (${orderToEdit?.orderNumber})`
              : 'Yeni Servis Kaydı'}
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

          {/* Customer Selection */}
          <div className={styles.field}>
            <label htmlFor="customer-search-input" className={styles.label}>
              Müşteri <span className={styles.required}>*</span>
            </label>
            {isEditing && selectedCustomer ? (
              <div className={styles.readonlyField}>
                <span>{selectedCustomer.fullName}</span>
              </div>
            ) : (
              <div className={styles.comboboxContainer}>
                {selectedCustomer ? (
                  <div className={styles.selectedChip}>
                    <span className={styles.chipText}>{selectedCustomer.fullName}</span>
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => {
                        setSelectedCustomer(null);
                        setSelectedDevice(null);
                        setFormData((prev) => ({ ...prev, deviceId: 0 }));
                        setIsCustomerComboboxOpen(true);
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
                      id="customer-search-input"
                      type="text"
                      role="combobox"
                      aria-expanded={isCustomerComboboxOpen}
                      aria-label="Müşteri ara"
                      className={styles.comboboxInput}
                      placeholder="Müşteri adı ile arayın..."
                      value={customerSearchText}
                      onChange={(e) => {
                        setCustomerSearchText(e.target.value);
                        setIsCustomerComboboxOpen(true);
                      }}
                      onFocus={() => setIsCustomerComboboxOpen(true)}
                      onBlur={() => setTimeout(() => setIsCustomerComboboxOpen(false), 200)}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                    <ChevronDown size={16} className={styles.comboboxChevron} aria-hidden="true" />
                  </div>
                )}

                {isCustomerComboboxOpen && !selectedCustomer && (
                  <ul role="listbox" className={styles.comboboxDropdown}>
                    {isCustomersLoading ? (
                      <li className={styles.comboboxStatusItem}>
                        <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                        <span>Müşteriler aranıyor...</span>
                      </li>
                    ) : isCustomersError ? (
                      <li className={styles.comboboxStatusItem}>
                        <AlertCircle size={16} aria-hidden="true" />
                        <span>{customerErrorMessage || 'Müşteri aranırken hata oluştu.'}</span>
                      </li>
                    ) : customers.length === 0 ? (
                      <li className={styles.comboboxStatusItem}>
                        <span>Müşteri bulunamadı.</span>
                      </li>
                    ) : (
                      customers.map((c, idx) => (
                        <li
                          key={c.id}
                          role="option"
                          aria-selected={idx === customerActiveIndex}
                          className={`${styles.comboboxOption} ${idx === customerActiveIndex ? styles.comboboxOptionActive : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCustomer(c);
                          }}
                          onMouseEnter={() => setCustomerActiveIndex(idx)}
                        >
                          <span className={styles.optionTitle}>{c.fullName}</span>
                          <span className={styles.optionSubtitle}>{c.email}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Device Selection */}
          <div className={styles.field}>
            <label htmlFor="device-search-input" className={styles.label}>
              Cihaz <span className={styles.required}>*</span>
            </label>
            {isEditing && selectedDevice ? (
              <div className={styles.readonlyField}>
                <span>
                  {selectedDevice.brand} {selectedDevice.model}
                </span>
              </div>
            ) : (
              <div className={styles.comboboxContainer}>
                {selectedDevice ? (
                  <div className={styles.selectedChip}>
                    <span className={styles.chipText}>
                      {selectedDevice.brand} {selectedDevice.model}
                    </span>
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => {
                        setSelectedDevice(null);
                        setFormData((prev) => ({ ...prev, deviceId: 0 }));
                        setIsDeviceComboboxOpen(true);
                      }}
                      disabled={isLoading}
                      aria-label="Cihaz seçimini kaldır"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.comboboxInputWrapper}>
                    <Search size={16} className={styles.comboboxSearchIcon} aria-hidden="true" />
                    <input
                      id="device-search-input"
                      type="text"
                      role="combobox"
                      aria-expanded={isDeviceComboboxOpen}
                      aria-label="Cihaz ara"
                      aria-invalid={Boolean(fieldErrors.deviceId)}
                      className={`${styles.comboboxInput} ${fieldErrors.deviceId ? styles.inputError : ''}`}
                      placeholder={
                        selectedCustomer
                          ? 'Bu müşteriye ait cihazı arayın...'
                          : 'Önce müşteri seçiniz...'
                      }
                      value={deviceSearchText}
                      onChange={(e) => {
                        setDeviceSearchText(e.target.value);
                        setIsDeviceComboboxOpen(true);
                      }}
                      onFocus={() => setIsDeviceComboboxOpen(true)}
                      onBlur={() => setTimeout(() => setIsDeviceComboboxOpen(false), 200)}
                      disabled={isLoading || !selectedCustomer}
                      autoComplete="off"
                    />
                    <ChevronDown size={16} className={styles.comboboxChevron} aria-hidden="true" />
                  </div>
                )}

                {isDeviceComboboxOpen && !selectedDevice && (
                  <ul role="listbox" className={styles.comboboxDropdown}>
                    {isDevicesLoading ? (
                      <li className={styles.comboboxStatusItem}>
                        <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                        <span>Cihazlar aranıyor...</span>
                      </li>
                    ) : isDevicesError ? (
                      <li className={styles.comboboxStatusItem}>
                        <AlertCircle size={16} aria-hidden="true" />
                        <span>{deviceErrorMessage || 'Cihaz aranırken hata oluştu.'}</span>
                      </li>
                    ) : devices.length === 0 ? (
                      <li className={styles.comboboxStatusItem}>
                        <span>
                          {selectedCustomer
                            ? 'Bu müşteriye ait kayıtlı cihaz bulunamadı.'
                            : 'Lütfen önce müşteri seçin.'}
                        </span>
                      </li>
                    ) : (
                      devices.map((d, idx) => (
                        <li
                          key={d.id}
                          role="option"
                          aria-selected={idx === deviceActiveIndex}
                          className={`${styles.comboboxOption} ${idx === deviceActiveIndex ? styles.comboboxOptionActive : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectDevice(d);
                          }}
                          onMouseEnter={() => setDeviceActiveIndex(idx)}
                        >
                          <span className={styles.optionTitle}>
                            {d.brand} {d.model}
                          </span>
                          <span className={styles.optionSubtitle}>
                            {d.serialNumber ? `Seri No: ${d.serialNumber}` : 'Seri No yok'}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
            {fieldErrors.deviceId && (
              <span className={styles.errorText}>{fieldErrors.deviceId}</span>
            )}
          </div>

          {/* Issue & Priority */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="priority" className={styles.label}>
                Öncelik <span className={styles.required}>*</span>
              </label>
              <select
                id="priority"
                name="priority"
                className={styles.select}
                value={formData.priority}
                onChange={handleChange}
                disabled={isLoading}
              >
                {(Object.keys(REPAIR_PRIORITY_LABELS) as RepairPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {REPAIR_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="estimatedCost" className={styles.label}>
                Tahmini Tutar (₺)
              </label>
              <input
                id="estimatedCost"
                name="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                className={`${styles.input} ${fieldErrors.estimatedCost ? styles.inputError : ''}`}
                value={formData.estimatedCost}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Örn: 500.00"
              />
              {fieldErrors.estimatedCost && (
                <span className={styles.errorText}>{fieldErrors.estimatedCost}</span>
              )}
            </div>

            {isEditing && (
              <div className={styles.field}>
                <label htmlFor="finalCost" className={styles.label}>
                  Nihai Tutar (₺)
                </label>
                <input
                  id="finalCost"
                  name="finalCost"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`${styles.input} ${fieldErrors.finalCost ? styles.inputError : ''}`}
                  value={formData.finalCost}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Örn: 650.00"
                />
                {fieldErrors.finalCost && (
                  <span className={styles.errorText}>{fieldErrors.finalCost}</span>
                )}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="reportedIssue" className={styles.label}>
              Şikayet / Arıza Açıklaması <span className={styles.required}>*</span>
            </label>
            <textarea
              ref={reportedIssueRef}
              id="reportedIssue"
              name="reportedIssue"
              rows={3}
              className={`${styles.textarea} ${fieldErrors.reportedIssue ? styles.inputError : ''}`}
              value={formData.reportedIssue}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Müşterinin bildirdiği arıza / şikayet açıklaması..."
            />
            {fieldErrors.reportedIssue && (
              <span className={styles.errorText}>{fieldErrors.reportedIssue}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="diagnosisNotes" className={styles.label}>
              Teşhis Notları
            </label>
            <textarea
              id="diagnosisNotes"
              name="diagnosisNotes"
              rows={2}
              className={`${styles.textarea} ${fieldErrors.diagnosisNotes ? styles.inputError : ''}`}
              value={formData.diagnosisNotes}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Arıza tespiti ve teknik inceleme notları..."
            />
            {fieldErrors.diagnosisNotes && (
              <span className={styles.errorText}>{fieldErrors.diagnosisNotes}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="technicianNotes" className={styles.label}>
              Teknisyen / Yapılan İşlem Notları
            </label>
            <textarea
              id="technicianNotes"
              name="technicianNotes"
              rows={2}
              className={`${styles.textarea} ${fieldErrors.technicianNotes ? styles.inputError : ''}`}
              value={formData.technicianNotes}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Yapılan müdahale, değiştirilen parçalar vb..."
            />
            {fieldErrors.technicianNotes && (
              <span className={styles.errorText}>{fieldErrors.technicianNotes}</span>
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
