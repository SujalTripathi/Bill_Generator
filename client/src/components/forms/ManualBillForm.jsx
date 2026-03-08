import { useState } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { stateList } from '../../utils/stateList';

const billTypes = [
  'TAX INVOICE',
  'RETAIL BILL',
  'PROFORMA INVOICE',
  'CREDIT NOTE',
  'DELIVERY CHALLAN',
  'PURCHASE ORDER',
];

const unitOptions = ['Nos', 'Pcs', 'Kg', 'Ltr', 'Mtr', 'Box', 'Set', 'Pair', 'Dozen'];

const gstRateOptions = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

export default function ManualBillForm({
  billData,
  onUpdate,
  onUpdateBuyer,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddCustomField,
  onRemoveCustomField,
  onUpdateCustomField,
  customers,
  onSelectCustomer,
}) {
  const handleStateChange = (stateName) => {
    const entry = stateList.find((s) => s.name === stateName);
    onUpdateBuyer('state', stateName);
    onUpdateBuyer('stateCode', entry ? entry.code : '');
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (!customerId) return;
    const customer = customers.find((c) => c._id === customerId || c.id === customerId);
    if (customer && onSelectCustomer) {
      onSelectCustomer(customer);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Section A: Bill Details ─── */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bill Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="billType" className="label-text">
              Bill Type
            </label>
            <select
              id="billType"
              className="input-field"
              value={billData.billType}
              onChange={(e) => onUpdate('billType', e.target.value)}
            >
              {billTypes.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="invoiceDate" className="label-text">
              Invoice Date
            </label>
            <input
              id="invoiceDate"
              type="date"
              className="input-field"
              value={billData.invoiceDate}
              onChange={(e) => onUpdate('invoiceDate', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="label-text">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              className="input-field"
              value={billData.dueDate}
              onChange={(e) => onUpdate('dueDate', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ─── Section B: Buyer Details ─── */}
      <section className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Buyer Details
          </h2>
          {customers && customers.length > 0 && (
            <div className="w-full sm:w-64">
              <select
                className="input-field text-sm"
                defaultValue=""
                onChange={handleCustomerSelect}
              >
                <option value="">Select from saved customers</option>
                {customers.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} {c.gstin ? `(${c.gstin})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="buyerName" className="label-text">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="buyerName"
              type="text"
              className="input-field"
              placeholder="Buyer / Company name"
              value={billData.buyer.name}
              onChange={(e) => onUpdateBuyer('name', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerGstin" className="label-text">
              GSTIN
            </label>
            <input
              id="buyerGstin"
              type="text"
              className="input-field uppercase"
              placeholder="e.g. 27AAPFU0939F1ZV"
              maxLength={15}
              value={billData.buyer.gstin}
              onChange={(e) => onUpdateBuyer('gstin', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerPhone" className="label-text">
              Phone
            </label>
            <input
              id="buyerPhone"
              type="tel"
              className="input-field"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={billData.buyer.phone}
              onChange={(e) => onUpdateBuyer('phone', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerEmail" className="label-text">
              Email
            </label>
            <input
              id="buyerEmail"
              type="email"
              className="input-field"
              placeholder="buyer@example.com"
              value={billData.buyer.email}
              onChange={(e) => onUpdateBuyer('email', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="buyerAddress" className="label-text">
              Address Line 1
            </label>
            <input
              id="buyerAddress"
              type="text"
              className="input-field"
              placeholder="Street address, building, locality"
              value={billData.buyer.addressLine1}
              onChange={(e) => onUpdateBuyer('addressLine1', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerCity" className="label-text">
              City
            </label>
            <input
              id="buyerCity"
              type="text"
              className="input-field"
              placeholder="City"
              value={billData.buyer.city}
              onChange={(e) => onUpdateBuyer('city', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="buyerState" className="label-text">
              State
            </label>
            <select
              id="buyerState"
              className="input-field"
              value={billData.buyer.state}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="">Select State</option>
              {stateList.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="buyerStateCode" className="label-text">
              State Code
            </label>
            <input
              id="buyerStateCode"
              type="text"
              className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              value={billData.buyer.stateCode}
              readOnly
              placeholder="Auto-filled"
            />
          </div>

          <div>
            <label htmlFor="buyerPincode" className="label-text">
              Pincode
            </label>
            <input
              id="buyerPincode"
              type="text"
              className="input-field"
              placeholder="6-digit pincode"
              maxLength={6}
              value={billData.buyer.pincode || ''}
              onChange={(e) => onUpdateBuyer('pincode', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ─── Ship To Different Address ─── */}
      <ShippingSection billData={billData} onUpdate={onUpdate} />

      {/* ─── Section C: Items Table ─── */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Items
        </h2>

        {/* Desktop table header */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-2 mb-2 px-1">
          <span className="col-span-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Description
          </span>
          <span className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            HSN/SAC
          </span>
          <span className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Qty
          </span>
          <span className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Unit
          </span>
          <span className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Rate/Unit
          </span>
          <span className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Disc %
          </span>
          <span className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            GST Rate
          </span>
          <span className="col-span-1" />
        </div>

        <div className="space-y-3">
          {billData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              {/* Description */}
              <div className="lg:col-span-3">
                <label className="label-text lg:hidden">Description</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                />
              </div>

              {/* HSN/SAC */}
              <div className="lg:col-span-1">
                <label className="label-text lg:hidden">HSN/SAC</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  placeholder="HSN"
                  value={item.hsnOrSac}
                  onChange={(e) => onUpdateItem(index, 'hsnOrSac', e.target.value)}
                />
              </div>

              {/* Quantity */}
              <div className="lg:col-span-1">
                <label className="label-text lg:hidden">Qty</label>
                <input
                  type="number"
                  className="input-field text-sm"
                  placeholder="1"
                  min="0"
                  step="any"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              {/* Unit */}
              <div className="lg:col-span-1">
                <label className="label-text lg:hidden">Unit</label>
                <select
                  className="input-field text-sm"
                  value={item.unit}
                  onChange={(e) => onUpdateItem(index, 'unit', e.target.value)}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rate Per Unit */}
              <div className="lg:col-span-2">
                <label className="label-text lg:hidden">Rate/Unit</label>
                <input
                  type="number"
                  className="input-field text-sm"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={item.ratePerUnit}
                  onChange={(e) =>
                    onUpdateItem(index, 'ratePerUnit', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              {/* Discount Percent */}
              <div className="lg:col-span-1">
                <label className="label-text lg:hidden">Disc %</label>
                <input
                  type="number"
                  className="input-field text-sm"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="any"
                  value={item.discountPercent}
                  onChange={(e) =>
                    onUpdateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              {/* GST Rate */}
              <div className="lg:col-span-2">
                <label className="label-text lg:hidden">GST Rate</label>
                <select
                  className="input-field text-sm"
                  value={item.gstRate}
                  onChange={(e) =>
                    onUpdateItem(index, 'gstRate', parseFloat(e.target.value))
                  }
                >
                  {gstRateOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete Button */}
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  disabled={billData.items.length <= 1}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove item"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="lg:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Item
        </button>
      </section>

      {/* ─── Section D: Custom Fields ─── */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Custom Fields
          </h2>
          <button
            type="button"
            onClick={onAddCustomField}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Custom Field
          </button>
        </div>

        {billData.customFields.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No custom fields added. Add fields like delivery date, PO number, signature box, etc.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {billData.customFields.map((cf) => (
              <div
                key={cf.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {cf.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {cf.fieldType}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                      {cf.position}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {cf.width === 'full' ? 'Full width' : 'Half width'}
                    </span>
                  </div>
                  {/* Inline value editing for text-based custom fields */}
                  {(cf.fieldType === 'text' || cf.fieldType === 'number' || cf.fieldType === 'date') && (
                    <input
                      type={cf.fieldType === 'date' ? 'date' : cf.fieldType === 'number' ? 'number' : 'text'}
                      className="input-field text-sm mt-2"
                      placeholder={`Enter ${cf.label}`}
                      value={cf.value || ''}
                      onChange={(e) => onUpdateCustomField(cf.id, 'value', e.target.value)}
                    />
                  )}
                  {cf.fieldType === 'textarea' && (
                    <textarea
                      className="input-field text-sm mt-2 resize-y"
                      rows={2}
                      placeholder={`Enter ${cf.label}`}
                      value={cf.value || ''}
                      onChange={(e) => onUpdateCustomField(cf.id, 'value', e.target.value)}
                    />
                  )}
                  {cf.fieldType === 'checkbox' && (
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                        checked={cf.value === true || cf.value === 'true'}
                        onChange={(e) => onUpdateCustomField(cf.id, 'value', e.target.checked)}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cf.label}</span>
                    </label>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCustomField(cf.id)}
                  className="ml-3 flex-shrink-0 p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="Remove field"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Section E: Additional Info ─── */}
      <section className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Information
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="notes" className="label-text">
              Notes
            </label>
            <textarea
              id="notes"
              className="input-field resize-y"
              rows={3}
              placeholder="Any additional notes for the buyer (e.g. Thank you for your business!)"
              value={billData.notes}
              onChange={(e) => onUpdate('notes', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="termsAndConditions" className="label-text">
              Terms &amp; Conditions
            </label>
            <textarea
              id="termsAndConditions"
              className="input-field resize-y"
              rows={4}
              placeholder="Payment terms, return policy, warranty info, etc."
              value={billData.termsAndConditions}
              onChange={(e) => onUpdate('termsAndConditions', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ─── Bottom Action Buttons ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => onUpdate('_action', 'draft')}
          className="btn-secondary"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => onUpdate('_action', 'preview')}
          className="btn-primary"
        >
          Preview Bill
        </button>
        <button
          type="button"
          onClick={() => onUpdate('_action', 'download')}
          className="btn-success"
        >
          Save &amp; Download PDF
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shipping Section (collapsible)
   ───────────────────────────────────────────── */
function ShippingSection({ billData, onUpdate }) {
  const shipping = billData.shippingAddress || {};
  const hasData = shipping.name || shipping.addressLine1 || shipping.city || shipping.state;
  const [showShipping, setShowShipping] = useState(!!hasData);

  const updateShipping = (field, value) => {
    onUpdate('shippingAddress', {
      ...(billData.shippingAddress || {}),
      [field]: value,
    });
  };

  const clearShipping = () => {
    onUpdate('shippingAddress', { name: '', addressLine1: '', city: '', state: '', pincode: '' });
    setShowShipping(false);
  };

  return (
    <section className="card">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showShipping}
          onChange={(e) => {
            if (!e.target.checked) clearShipping();
            else setShowShipping(true);
          }}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Ship to a different address
        </span>
      </label>

      {showShipping && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="label-text">Recipient Name</label>
            <input type="text" className="input-field" value={shipping.name || ''} onChange={(e) => updateShipping('name', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Address</label>
            <input type="text" className="input-field" value={shipping.addressLine1 || ''} onChange={(e) => updateShipping('addressLine1', e.target.value)} />
          </div>
          <div>
            <label className="label-text">City</label>
            <input type="text" className="input-field" value={shipping.city || ''} onChange={(e) => updateShipping('city', e.target.value)} />
          </div>
          <div>
            <label className="label-text">State</label>
            <select className="input-field" value={shipping.state || ''} onChange={(e) => updateShipping('state', e.target.value)}>
              <option value="">Select State</option>
              {stateList.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Pincode</label>
            <input type="text" className="input-field" maxLength={6} value={shipping.pincode || ''} onChange={(e) => updateShipping('pincode', e.target.value)} />
          </div>
        </div>
      )}
    </section>
  );
}
