import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { axiosInstance } from '../api/auth.api';
import { FiGrid, FiPlus, FiTrash2, FiCopy } from 'react-icons/fi';
import LoadingSpinner from '../components/shared/LoadingSpinner';

/* -----------------------------------------------
   Built-in Template Definitions
   ----------------------------------------------- */
const BUILT_IN_TEMPLATES = [
  {
    id: 'builtin-transport',
    name: 'Transport / Logistics',
    description: 'Invoice template for transport, freight, and logistics businesses with fields for LR, vehicle, and e-way bill details.',
    billType: 'TRANSPORT INVOICE',
    customFields: [
      { key: 'lrNumber', label: 'LR Number', type: 'text', defaultValue: '' },
      { key: 'vehicleNumber', label: 'Vehicle Number', type: 'text', defaultValue: '' },
      { key: 'driverName', label: 'Driver Name', type: 'text', defaultValue: '' },
      { key: 'loadingPoint', label: 'Loading Point', type: 'text', defaultValue: '' },
      { key: 'unloadingPoint', label: 'Unloading Point', type: 'text', defaultValue: '' },
      { key: 'deliveryDate', label: 'Delivery Date', type: 'date', defaultValue: '' },
      { key: 'ewayBillNo', label: 'E-Way Bill No', type: 'text', defaultValue: '' },
      { key: 'authorizedSignature', label: 'Authorized Signature', type: 'text', defaultValue: '' },
      { key: 'driverSignature', label: 'Driver Signature', type: 'text', defaultValue: '' },
    ],
  },
  {
    id: 'builtin-medical',
    name: 'Medical / Pharma',
    description: 'Pharmacy and medical store invoice with drug license, patient, and prescription tracking fields.',
    billType: 'MEDICAL INVOICE',
    customFields: [
      { key: 'drugLicenseNo', label: 'Drug License No', type: 'text', defaultValue: '' },
      { key: 'patientName', label: 'Patient Name', type: 'text', defaultValue: '' },
      { key: 'doctorName', label: 'Doctor Name', type: 'text', defaultValue: '' },
      { key: 'prescriptionNo', label: 'Prescription No', type: 'text', defaultValue: '' },
    ],
  },
  {
    id: 'builtin-restaurant',
    name: 'Restaurant / Hotel',
    description: 'Restaurant and hotel billing template with table, waiter, and order management fields.',
    billType: 'RESTAURANT BILL',
    customFields: [
      { key: 'tableNumber', label: 'Table Number', type: 'text', defaultValue: '' },
      { key: 'waiterName', label: 'Waiter Name', type: 'text', defaultValue: '' },
      { key: 'coverCount', label: 'Cover Count', type: 'number', defaultValue: '' },
      { key: 'orderNumber', label: 'Order Number', type: 'text', defaultValue: '' },
    ],
  },
  {
    id: 'builtin-contractor',
    name: 'Contractor / Construction',
    description: 'Construction and contractor invoice with work order, site details, and project timeline fields.',
    billType: 'CONTRACTOR INVOICE',
    customFields: [
      { key: 'workOrderNo', label: 'Work Order No', type: 'text', defaultValue: '' },
      { key: 'siteAddress', label: 'Site Address', type: 'text', defaultValue: '' },
      { key: 'workStartDate', label: 'Work Start Date', type: 'date', defaultValue: '' },
      { key: 'completionDate', label: 'Completion Date', type: 'date', defaultValue: '' },
      { key: 'engineerName', label: 'Engineer Name', type: 'text', defaultValue: '' },
      { key: 'clientPoNo', label: 'Client PO No', type: 'text', defaultValue: '' },
    ],
  },
  {
    id: 'builtin-retail',
    name: 'Retail Shop',
    description: 'Standard retail shop billing template with cashier and counter tracking for quick sales.',
    billType: 'RETAIL BILL',
    customFields: [
      { key: 'cashier', label: 'Cashier', type: 'text', defaultValue: '' },
      { key: 'counterNo', label: 'Counter No', type: 'text', defaultValue: '' },
    ],
  },
  {
    id: 'builtin-export',
    name: 'Export Invoice',
    description: 'International export invoice template with shipping, port, currency, and exchange rate fields.',
    billType: 'EXPORT INVOICE',
    customFields: [
      { key: 'shippingBillNo', label: 'Shipping Bill No', type: 'text', defaultValue: '' },
      { key: 'portOfLoading', label: 'Port of Loading', type: 'text', defaultValue: '' },
      { key: 'portOfDischarge', label: 'Port of Discharge', type: 'text', defaultValue: '' },
      { key: 'countryOfOrigin', label: 'Country of Origin', type: 'text', defaultValue: '' },
      { key: 'currency', label: 'Currency', type: 'text', defaultValue: 'USD' },
      { key: 'exchangeRate', label: 'Exchange Rate', type: 'number', defaultValue: '' },
    ],
  },
];

/* -----------------------------------------------
   Bill Type badge colors
   ----------------------------------------------- */
function getBillTypeBadgeClass(billType) {
  const type = (billType || '').toUpperCase();
  if (type.includes('TRANSPORT')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
  if (type.includes('MEDICAL') || type.includes('PHARMA')) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  if (type.includes('RESTAURANT') || type.includes('HOTEL')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
  if (type.includes('CONTRACTOR') || type.includes('CONSTRUCTION')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  if (type.includes('RETAIL')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
  if (type.includes('EXPORT')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
}

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch user templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/templates');
      const list = res.data?.templates || res.data?.data || res.data || [];
      setTemplates(Array.isArray(list) ? list : []);
    } catch (err) {
      // If 404, templates endpoint may not exist yet -- just show empty
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.message || 'Failed to load templates');
      }
    } finally {
      setLoading(false);
    }
  };

  // Use a user-created template
  const handleUseTemplate = async (template) => {
    try {
      const res = await axiosInstance.post(`/templates/${template._id}/apply`);
      const data = res.data?.template || res.data?.data || res.data || {};
      sessionStorage.setItem(
        'templateData',
        JSON.stringify({
          billType: data.billType || template.billType || '',
          customFields: data.customFields || template.customFields || [],
          templateName: data.name || template.name || '',
        })
      );
      toast.success(`Template "${template.name}" applied`);
      navigate('/new-bill');
    } catch (err) {
      // Fallback: store local data even if API call fails
      sessionStorage.setItem(
        'templateData',
        JSON.stringify({
          billType: template.billType || '',
          customFields: template.customFields || [],
          templateName: template.name || '',
        })
      );
      toast.success(`Template "${template.name}" applied`);
      navigate('/new-bill');
    }
  };

  // Use a built-in template (no API call needed)
  const handleUseBuiltIn = (template) => {
    sessionStorage.setItem(
      'templateData',
      JSON.stringify({
        billType: template.billType || '',
        customFields: template.customFields || [],
        templateName: template.name || '',
      })
    );
    toast.success(`Template "${template.name}" applied`);
    navigate('/new-bill');
  };

  // Delete a user-created template
  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Delete template "${template.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(template._id);
    try {
      await axiosInstance.delete(`/templates/${template._id}`);
      setTemplates((prev) => prev.filter((t) => t._id !== template._id));
      toast.success('Template deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete template');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading templates..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose a template to quickly create invoices for your industry
          </p>
        </div>
      </div>

      {/* User-Created Templates */}
      {templates.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FiGrid size={20} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Templates
            </h2>
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
              {templates.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((template) => (
              <UserTemplateCard
                key={template._id}
                template={template}
                onUse={() => handleUseTemplate(template)}
                onDelete={() => handleDeleteTemplate(template)}
                deleting={deletingId === template._id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Built-in Templates */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <FiCopy size={20} className="text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Built-in Templates
          </h2>
          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
            {BUILT_IN_TEMPLATES.length}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Industry-specific templates with pre-configured custom fields. Click "Use Template" to start a new bill.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BUILT_IN_TEMPLATES.map((template) => (
            <BuiltInTemplateCard
              key={template.id}
              template={template}
              onUse={() => handleUseBuiltIn(template)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* -----------------------------------------------
   User Template Card
   ----------------------------------------------- */
function UserTemplateCard({ template, onUse, onDelete, deleting }) {
  const fieldCount = template.customFields?.length || 0;
  const usageCount = template.usageCount ?? template.useCount ?? 0;
  const isPublic = template.isPublic ?? false;

  return (
    <div className="card flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
            {template.name}
          </h3>
          {isPublic && (
            <span className="flex-shrink-0 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
              Public
            </span>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {template.billType && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getBillTypeBadgeClass(template.billType)}`}>
              {template.billType}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {fieldCount} custom field{fieldCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Used {usageCount} time{usageCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onUse}
          className="btn-primary flex-1 text-sm py-2 inline-flex items-center justify-center gap-1.5"
        >
          <FiPlus size={15} />
          Use Template
        </button>
        {!isPublic && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete template"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------
   Built-in Template Card
   ----------------------------------------------- */
function BuiltInTemplateCard({ template, onUse }) {
  const fieldCount = template.customFields?.length || 0;

  return (
    <div className="card flex flex-col justify-between hover:shadow-md transition-shadow duration-200 border-dashed">
      <div>
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
            {template.name}
          </h3>
          <span className="flex-shrink-0 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
            Built-in
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getBillTypeBadgeClass(template.billType)}`}>
            {template.billType}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {fieldCount} custom field{fieldCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Custom field labels preview */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.customFields.map((field) => (
            <span
              key={field.key}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
            >
              {field.label}
            </span>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onUse}
          className="btn-primary w-full text-sm py-2 inline-flex items-center justify-center gap-1.5"
        >
          <FiPlus size={15} />
          Use Template
        </button>
      </div>
    </div>
  );
}
