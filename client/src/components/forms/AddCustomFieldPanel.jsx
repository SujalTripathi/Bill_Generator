import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'signature', label: 'Signature' },
  { value: 'stampbox', label: 'Stamp Box' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'image', label: 'Image' },
];

const positionOptions = [
  { value: 'header', label: 'Header' },
  { value: 'below_buyer', label: 'Below Buyer Details' },
  { value: 'above_items', label: 'Above Items Table' },
  { value: 'below_items', label: 'Below Items Table' },
  { value: 'footer', label: 'Footer' },
];

const initialField = {
  label: '',
  fieldType: 'text',
  position: 'below_items',
  width: 'full',
};

export default function AddCustomFieldPanel({ isOpen, onClose, onAdd }) {
  const [field, setField] = useState({ ...initialField });
  const panelRef = useRef(null);
  const labelInputRef = useRef(null);

  // Reset form when panel opens
  useEffect(() => {
    if (isOpen) {
      setField({ ...initialField });
      // Focus the label input after a short delay for the animation
      const timer = setTimeout(() => {
        labelInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close when clicking outside the panel
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (key, value) => {
    setField((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    if (!field.label.trim()) return;
    onAdd({
      label: field.label.trim(),
      fieldType: field.fieldType,
      position: field.position,
      width: field.width,
    });
    setField({ ...initialField });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleBackdropClick} />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto animate-slide-in-right"
        style={{
          animation: 'slideInRight 0.25s ease-out forwards',
        }}
      >
        {/* Panel Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Custom Field
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Label */}
          <div>
            <label htmlFor="cf-label" className="label-text">
              Field Label <span className="text-red-500">*</span>
            </label>
            <input
              ref={labelInputRef}
              id="cf-label"
              type="text"
              className="input-field"
              placeholder="e.g. Delivery Date, PO Number, Authorized Signatory"
              value={field.label}
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </div>

          {/* Field Type */}
          <div>
            <label htmlFor="cf-fieldType" className="label-text">
              Field Type
            </label>
            <select
              id="cf-fieldType"
              className="input-field"
              value={field.fieldType}
              onChange={(e) => handleChange('fieldType', e.target.value)}
            >
              {fieldTypes.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {ft.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {field.fieldType === 'signature' && 'Renders a signature pad / upload area on the bill.'}
              {field.fieldType === 'stampbox' && 'Renders a bordered box for a company stamp.'}
              {field.fieldType === 'image' && 'Allows uploading an image (e.g. product photo, seal).'}
              {field.fieldType === 'textarea' && 'Multi-line text field for longer content.'}
              {field.fieldType === 'checkbox' && 'A single yes/no checkbox field.'}
              {(field.fieldType === 'text' || field.fieldType === 'date' || field.fieldType === 'number') && 'Standard input field.'}
            </p>
          </div>

          {/* Position */}
          <div>
            <label htmlFor="cf-position" className="label-text">
              Position on Bill
            </label>
            <select
              id="cf-position"
              className="input-field"
              value={field.position}
              onChange={(e) => handleChange('position', e.target.value)}
            >
              {positionOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Width */}
          <div>
            <label className="label-text">Width</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cf-width"
                  value="half"
                  checked={field.width === 'half'}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Half width</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cf-width"
                  value="full"
                  checked={field.width === 'full'}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Full width</span>
              </label>
            </div>
          </div>

          {/* Preview hint */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview:</strong> A{' '}
              <span className="font-mono">{field.fieldType}</span> field labelled{' '}
              <span className="font-semibold">"{field.label || '...'}"</span> will appear in the{' '}
              <span className="font-semibold">{positionOptions.find((p) => p.value === field.position)?.label || field.position}</span>{' '}
              section, spanning{' '}
              <span className="font-semibold">{field.width === 'full' ? 'full' : 'half'}</span> width.
            </p>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!field.label.trim()}
            className="btn-primary flex-1"
          >
            Add Field
          </button>
        </div>
      </div>

      {/* Inline keyframes for the slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
