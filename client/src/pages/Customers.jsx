import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import customerApi from '../api/customer.api';
import { stateList } from '../utils/stateList';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const initialForm = {
  name: '',
  gstin: '',
  phone: '',
  email: '',
  addressLine1: '',
  city: '',
  state: '',
  stateCode: '',
  pincode: '',
};

function formatIndianCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getAll();
      const list = res.data?.customers || res.data?.data || res.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Filtered customers by search
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase().trim();
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  // Form handlers
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

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      gstin: customer.gstin || '',
      phone: customer.phone || '',
      email: customer.email || '',
      addressLine1: customer.addressLine1 || '',
      city: customer.city || '',
      state: customer.state || '',
      stateCode: customer.stateCode || '',
      pincode: customer.pincode || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setForm(initialForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        const res = await customerApi.update(editingCustomer._id, form);
        const updated = res.data?.customer || res.data?.data || res.data;
        setCustomers((prev) =>
          prev.map((c) => (c._id === editingCustomer._id ? { ...c, ...updated } : c))
        );
        toast.success('Customer updated successfully');
      } else {
        const res = await customerApi.create(form);
        const newCustomer = res.data?.customer || res.data?.data || res.data;
        if (newCustomer && newCustomer._id) {
          setCustomers((prev) => [newCustomer, ...prev]);
        } else {
          await fetchCustomers();
        }
        toast.success('Customer added successfully');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await customerApi.delete(customer._id);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      toast.success('Customer deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="card">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="card !p-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded hidden md:block" />
              <div className="flex-1" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your customers and their details
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <FiPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 !py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="card overflow-hidden !p-0">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <FiSearch size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {search.trim() ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              {search.trim()
                ? 'Try adjusting your search terms to find what you are looking for.'
                : 'Get started by adding your first customer. Click the "Add Customer" button above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden sm:table-cell">GSTIN</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden lg:table-cell">City</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Total Bills</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Total Amount</th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs hidden sm:table-cell">
                      {customer.gstin || <span className="text-gray-400 dark:text-gray-500">--</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      {customer.phone || <span className="text-gray-400 dark:text-gray-500">--</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 hidden lg:table-cell">
                      {customer.city || <span className="text-gray-400 dark:text-gray-500">--</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      {customer.totalBills ?? customer.invoiceCount ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                      {formatIndianCurrency(customer.totalAmount ?? customer.totalRevenue ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Edit customer"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete customer"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredCustomers.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
          Showing {filteredCustomers.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal */}
      {showModal && (
        <CustomerModal
          form={form}
          editingCustomer={editingCustomer}
          saving={saving}
          handleChange={handleChange}
          handleStateChange={handleStateChange}
          handleSave={handleSave}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}

/* -----------------------------------------------
   Customer Modal (Add / Edit)
   ----------------------------------------------- */
function CustomerModal({
  form,
  editingCustomer,
  saving,
  handleChange,
  handleStateChange,
  handleSave,
  closeModal,
}) {
  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name (required) */}
            <div className="md:col-span-2">
              <label htmlFor="cust-name" className="label-text">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="cust-name"
                name="name"
                type="text"
                className="input-field"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            {/* GSTIN */}
            <div>
              <label htmlFor="cust-gstin" className="label-text">
                GSTIN
              </label>
              <input
                id="cust-gstin"
                name="gstin"
                type="text"
                className="input-field uppercase"
                maxLength={15}
                value={form.gstin}
                onChange={handleChange}
                placeholder="e.g. 22AAAAA0000A1Z5"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="cust-phone" className="label-text">
                Phone
              </label>
              <input
                id="cust-phone"
                name="phone"
                type="tel"
                className="input-field"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="cust-email" className="label-text">
                Email
              </label>
              <input
                id="cust-email"
                name="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </div>

            {/* Address Line 1 */}
            <div className="md:col-span-2">
              <label htmlFor="cust-address" className="label-text">
                Address
              </label>
              <input
                id="cust-address"
                name="addressLine1"
                type="text"
                className="input-field"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="cust-city" className="label-text">
                City
              </label>
              <input
                id="cust-city"
                name="city"
                type="text"
                className="input-field"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="cust-state" className="label-text">
                State
              </label>
              <select
                id="cust-state"
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

            {/* State Code (auto-filled, read-only) */}
            <div>
              <label htmlFor="cust-stateCode" className="label-text">
                State Code
              </label>
              <input
                id="cust-stateCode"
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

            {/* Pincode */}
            <div>
              <label htmlFor="cust-pincode" className="label-text">
                Pincode
              </label>
              <input
                id="cust-pincode"
                name="pincode"
                type="text"
                className="input-field"
                maxLength={6}
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={closeModal}
            className="btn-secondary px-6"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary px-6"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : editingCustomer
                ? 'Update Customer'
                : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}
