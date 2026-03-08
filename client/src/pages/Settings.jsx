import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import businessApi from '../api/business.api';
import { stateList } from '../utils/stateList';
import { useAuth } from '../hooks/useAuth';

const tabs = [
  { key: 'business', label: 'Business Profile' },
  { key: 'invoice', label: 'Invoice Settings' },
  { key: 'bank', label: 'Bank Details' },
  { key: 'account', label: 'Account' },
];

const businessTypes = [
  { value: 'shop', label: 'Shop' },
  { value: 'service', label: 'Service' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'trader', label: 'Trader' },
  { value: 'freelancer', label: 'Freelancer' },
];

const templateStyles = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Traditional invoice layout with a formal structure',
  },
  {
    value: 'modern',
    label: 'Modern',
    description: 'Clean and contemporary design with bold accents',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Simple and clutter-free with essential details only',
  },
];

const initialForm = {
  businessName: '',
  gstin: '',
  businessType: 'shop',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  stateCode: '',
  pincode: '',
  phone: '',
  email: '',
  logo: '',
  primaryColor: '#4f46e5',
  templateStyle: 'classic',
  invoicePrefix: 'INV',
  defaultTerms: '',
  defaultNotes: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
  upiId: '',
};

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [form, setForm] = useState(initialForm);
  const [isNew, setIsNew] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const res = await businessApi.get();
      const data = res.data.profile || res.data.business || res.data;
      setForm((prev) => ({
        ...prev,
        businessName: data.businessName || '',
        gstin: data.gstin || '',
        businessType: data.businessType || 'shop',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        state: data.state || '',
        stateCode: data.stateCode || '',
        pincode: data.pincode || '',
        phone: data.phone || '',
        email: data.email || '',
        logo: data.logo || '',
        primaryColor: data.primaryColor || '#4f46e5',
        templateStyle: data.templateStyle || 'classic',
        invoicePrefix: data.invoicePrefix || 'INV',
        defaultTerms: data.defaultTerms || '',
        defaultNotes: data.defaultNotes || '',
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        ifscCode: data.ifscCode || '',
        accountHolderName: data.accountHolderName || '',
        upiId: data.upiId || '',
      }));
      if (data.logo) {
        setLogoPreview(data.logo);
      }
      setIsNew(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsNew(true);
      } else {
        toast.error('Failed to load business profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const stateEntry = stateList.find((s) => s.name === selectedState);
    setForm((prev) => ({
      ...prev,
      state: selectedState,
      stateCode: stateEntry ? stateEntry.code : '',
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await businessApi.uploadLogo(formData);
      const logoUrl = res.data.logo || res.data.url || res.data.logoUrl;
      setForm((prev) => ({ ...prev, logo: logoUrl }));
      setLogoPreview(logoUrl);
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logo upload failed');
      setLogoPreview(form.logo);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await businessApi.create(form);
        setIsNew(false);
        toast.success('Business profile created successfully');
      } else {
        await businessApi.update(form);
        toast.success('Settings saved successfully');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await businessApi.create(form);
          setIsNew(false);
          toast.success('Business profile created successfully');
        } catch (createErr) {
          toast.error(createErr.response?.data?.message || 'Failed to save settings');
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your business profile, invoice preferences, and account details
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'business' && (
          <BusinessProfileTab
            form={form}
            handleChange={handleChange}
            handleStateChange={handleStateChange}
            handleLogoUpload={handleLogoUpload}
            logoPreview={logoPreview}
            uploadingLogo={uploadingLogo}
          />
        )}
        {activeTab === 'invoice' && (
          <InvoiceSettingsTab form={form} handleChange={handleChange} />
        )}
        {activeTab === 'bank' && (
          <BankDetailsTab form={form} handleChange={handleChange} />
        )}
        {activeTab === 'account' && <AccountTab user={user} />}
      </div>

      {/* Save Button (not shown on Account tab) */}
      {activeTab !== 'account' && (
        <div className="flex justify-end mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Business Profile Tab
   ───────────────────────────────────────────── */
function BusinessProfileTab({
  form,
  handleChange,
  handleStateChange,
  handleLogoUpload,
  logoPreview,
  uploadingLogo,
}) {
  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="businessName" className="label-text">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className="input-field"
              value={form.businessName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="gstin" className="label-text">
              GSTIN
            </label>
            <input
              id="gstin"
              name="gstin"
              type="text"
              className="input-field uppercase"
              maxLength={15}
              value={form.gstin}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              15-digit GST Identification Number
            </p>
          </div>

          <div>
            <label htmlFor="businessType" className="label-text">
              Business Type
            </label>
            <select
              id="businessType"
              name="businessType"
              className="input-field"
              value={form.businessType}
              onChange={handleChange}
            >
              {businessTypes.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="addressLine1" className="label-text">
              Address Line 1
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              className="input-field"
              value={form.addressLine1}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="addressLine2" className="label-text">
              Address Line 2
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              className="input-field"
              value={form.addressLine2}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="city" className="label-text">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className="input-field"
              value={form.city}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="state" className="label-text">
              State
            </label>
            <select
              id="state"
              name="state"
              className="input-field"
              value={form.state}
              onChange={handleStateChange}
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
            <label htmlFor="stateCode" className="label-text">
              State Code
            </label>
            <input
              id="stateCode"
              name="stateCode"
              type="text"
              className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              value={form.stateCode}
              readOnly
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Auto-filled from state selection
            </p>
          </div>

          <div>
            <label htmlFor="pincode" className="label-text">
              Pincode
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              className="input-field"
              maxLength={6}
              value={form.pincode}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contact Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="label-text">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input-field"
              maxLength={10}
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="label-text">
              Business Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding</h2>
        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="label-text">Business Logo</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Business logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg
                    className="w-10 h-10 text-gray-300 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <label
                  htmlFor="logo-upload"
                  className={`btn-secondary inline-block cursor-pointer text-sm ${
                    uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  PNG, JPG or SVG. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="label-text">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="primaryColor"
                name="primaryColor"
                type="color"
                className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5"
                value={form.primaryColor}
                onChange={handleChange}
              />
              <input
                type="text"
                className="input-field w-32"
                value={form.primaryColor}
                onChange={(e) =>
                  handleChange({ target: { name: 'primaryColor', value: e.target.value } })
                }
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Used as the accent color on your invoices
              </span>
            </div>
          </div>

          {/* Template Style */}
          <div>
            <label className="label-text">Template Style</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {templateStyles.map((ts) => (
                <label
                  key={ts.value}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    form.templateStyle === ts.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-600'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="templateStyle"
                    value={ts.value}
                    checked={form.templateStyle === ts.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {/* Template icon */}
                  <div
                    className={`w-12 h-16 rounded border-2 mb-3 flex flex-col items-center justify-center gap-1 ${
                      form.templateStyle === ts.value
                        ? 'border-primary-400'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}
                  >
                    {ts.value === 'classic' && (
                      <>
                        <div className="w-6 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
                        <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-4 h-1 bg-gray-400 dark:bg-gray-500 rounded-full mt-1" />
                      </>
                    )}
                    {ts.value === 'modern' && (
                      <>
                        <div className="w-8 h-2 bg-primary-400 rounded-sm" />
                        <div className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-8 h-1.5 bg-primary-200 dark:bg-primary-800 rounded-sm mt-1" />
                      </>
                    )}
                    {ts.value === 'minimal' && (
                      <>
                        <div className="w-4 h-0.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                        <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-600 rounded-full" />
                        <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-600 rounded-full" />
                      </>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      form.templateStyle === ts.value
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {ts.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                    {ts.description}
                  </span>
                  {form.templateStyle === ts.value && (
                    <div className="absolute top-2 right-2">
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Invoice Settings Tab
   ───────────────────────────────────────────── */
function InvoiceSettingsTab({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Preferences</h2>

      <div>
        <label htmlFor="invoicePrefix" className="label-text">
          Invoice Number Prefix
        </label>
        <input
          id="invoicePrefix"
          name="invoicePrefix"
          type="text"
          className="input-field w-full md:w-64"
          value={form.invoicePrefix}
          onChange={handleChange}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Your invoices will be numbered as {form.invoicePrefix || 'INV'}-0001, {form.invoicePrefix || 'INV'}-0002, etc.
        </p>
      </div>

      <div>
        <label htmlFor="defaultTerms" className="label-text">
          Default Terms &amp; Conditions
        </label>
        <textarea
          id="defaultTerms"
          name="defaultTerms"
          rows={5}
          className="input-field resize-y"
          value={form.defaultTerms}
          onChange={handleChange}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          These terms will appear at the bottom of every invoice by default. You can override them per invoice.
        </p>
      </div>

      <div>
        <label htmlFor="defaultNotes" className="label-text">
          Default Notes
        </label>
        <textarea
          id="defaultNotes"
          name="defaultNotes"
          rows={4}
          className="input-field resize-y"
          value={form.defaultNotes}
          onChange={handleChange}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Additional notes or thank-you message shown on your invoices.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Bank Details Tab
   ───────────────────────────────────────────── */
function BankDetailsTab({ form, handleChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Account</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          These details will be printed on your invoices for payment collection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="accountHolderName" className="label-text">
            Account Holder Name
          </label>
          <input
            id="accountHolderName"
            name="accountHolderName"
            type="text"
            className="input-field"
            value={form.accountHolderName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="bankName" className="label-text">
            Bank Name
          </label>
          <input
            id="bankName"
            name="bankName"
            type="text"
            className="input-field"
            value={form.bankName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="accountNumber" className="label-text">
            Account Number
          </label>
          <input
            id="accountNumber"
            name="accountNumber"
            type="text"
            className="input-field"
            value={form.accountNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="ifscCode" className="label-text">
            IFSC Code
          </label>
          <input
            id="ifscCode"
            name="ifscCode"
            type="text"
            className="input-field uppercase"
            maxLength={11}
            value={form.ifscCode}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            11-character Indian Financial System Code
          </p>
        </div>

        <div>
          <label htmlFor="upiId" className="label-text">
            UPI ID
          </label>
          <input
            id="upiId"
            name="upiId"
            type="text"
            className="input-field"
            value={form.upiId}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            e.g. yourname@upi or 9876543210@ybl
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Account Tab
   ───────────────────────────────────────────── */
function AccountTab({ user }) {
  const planColors = {
    free: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    starter: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    pro: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    enterprise: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  };

  const plan = user?.plan || 'free';
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const badgeClass = planColors[plan] || planColors.free;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label-text">Name</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {user?.name || 'N/A'}
          </div>
        </div>

        <div>
          <label className="label-text">Email</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
            {user?.email || 'N/A'}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>
      </div>

      <div>
        <label className="label-text">Current Plan</label>
        <div className="flex items-center gap-3 mt-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
            {planLabel}
          </span>
          {plan === 'free' && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Upgrade to unlock more features
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Account Details
        </h3>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500 dark:text-gray-400">Member since</dt>
            <dd className="text-gray-900 dark:text-white font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
            <dd className="text-gray-900 dark:text-white font-medium font-mono text-xs">
              {user?._id || user?.id || 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
