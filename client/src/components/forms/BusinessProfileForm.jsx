import { useState } from 'react';
import { stateList } from '../../utils/stateList';

export default function BusinessProfileForm({ onSave }) {
  const [form, setForm] = useState({
    businessName: '',
    state: '',
    stateCode: '',
    gstin: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const entry = stateList.find((s) => s.name === selectedState);
    setForm((prev) => ({
      ...prev,
      state: selectedState,
      stateCode: entry ? entry.code : '',
    }));
    if (errors.state) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.state;
        return next;
      });
    }
  };

  const validate = () => {
    const e = {};
    if (!form.businessName.trim()) {
      e.businessName = 'Business name is required';
    }
    if (!form.state) {
      e.state = 'Please select your state';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        businessName: form.businessName.trim(),
        state: form.state,
        stateCode: form.stateCode,
        gstin: form.gstin.trim(),
        phone: form.phone.trim(),
      });
    } catch (err) {
      // Parent handles error toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            SB
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set up your business
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tell us a bit about your business so we can configure your invoices.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="label-text">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className={`input-field ${errors.businessName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="e.g. Mehta Electronics, Sharma & Sons"
              value={form.businessName}
              onChange={handleChange}
            />
            {errors.businessName && (
              <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="label-text">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              name="state"
              className={`input-field ${errors.state ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              value={form.state}
              onChange={handleStateChange}
            >
              <option value="">Select your state</option>
              {stateList.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            )}
            {form.stateCode && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                State code: {form.stateCode}
              </p>
            )}
          </div>

          {/* GSTIN */}
          <div>
            <label htmlFor="gstin" className="label-text">
              GSTIN
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
            </label>
            <input
              id="gstin"
              name="gstin"
              type="text"
              className="input-field uppercase"
              placeholder="e.g. 27AAPFU0939F1ZV"
              maxLength={15}
              value={form.gstin}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              15-digit GST Identification Number. You can add this later in Settings.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="label-text">
              Phone
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input-field"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Save & Continue'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            You can update these details anytime from Settings.
          </p>
        </form>
      </div>
    </div>
  );
}
