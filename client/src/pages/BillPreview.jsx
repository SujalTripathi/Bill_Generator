import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import invoiceApi from '../api/invoice.api';
import businessApi from '../api/business.api';
import BillTemplate from '../components/bill/BillTemplate';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { calculateBillTotals } from '../utils/billCalculator';
import { downloadBillAsPDF, generateWhatsAppURL } from '../utils/pdfGenerator';

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
  },
  sent: {
    label: 'Sent',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
  },
  paid: {
    label: 'Paid',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
  },
};

export default function BillPreview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('edit');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Editable fields
  const [buyerName, setBuyerName] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('draft');

  // Fetch invoice and business profile on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [invoiceRes, businessRes] = await Promise.all([
          invoiceApi.getById(id),
          businessApi.get().catch(() => ({ data: null })),
        ]);

        const invoiceData = invoiceRes.data?.invoice || invoiceRes.data?.data || invoiceRes.data;
        const businessData = businessRes.data?.profile || businessRes.data?.business || businessRes.data?.data || null;

        if (invoiceData) {
          setInvoice(invoiceData);
          setBuyerName(invoiceData.buyer?.name || '');
          setNotes(invoiceData.notes || '');
          setStatus(invoiceData.status || 'draft');
        }

        if (businessData) {
          setBusinessProfile(businessData);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load invoice');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  // Build live preview invoice by merging edits
  const liveInvoice = invoice
    ? {
        ...invoice,
        buyer: { ...invoice.buyer, name: buyerName },
        notes,
        status,
      }
    : null;

  // Recalculate totals for the live preview
  const previewInvoice = liveInvoice
    ? (() => {
        const totals = calculateBillTotals(
          liveInvoice.items || [],
          liveInvoice.seller?.state,
          liveInvoice.buyer?.state
        );
        return { ...liveInvoice, ...totals };
      })()
    : null;

  // Save editable fields
  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...invoice,
        buyer: { ...invoice.buyer, name: buyerName },
        notes,
      };
      const res = await invoiceApi.update(id, updateData);
      const updated = res.data?.invoice || res.data?.data || res.data;
      if (updated) {
        setInvoice(updated);
      }
      toast.success('Invoice updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadBillAsPDF('bill-print-area', invoice.invoiceNumber);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const businessName = invoice.seller?.businessName || businessProfile?.businessName || 'Business';
    const url = generateWhatsAppURL(invoice, businessName);
    window.open(url, '_blank');
  };

  // Mark as Sent
  const handleMarkAsSent = async () => {
    try {
      const res = await invoiceApi.updateStatus(id, { status: 'sent' });
      const updated = res.data?.invoice || res.data?.data || res.data;
      if (updated) {
        setInvoice(updated);
        setStatus('sent');
      } else {
        setStatus('sent');
      }
      toast.success('Invoice marked as sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Mark as Paid
  const handleMarkAsPaid = async () => {
    try {
      const res = await invoiceApi.updateStatus(id, { status: 'paid' });
      const updated = res.data?.invoice || res.data?.data || res.data;
      if (updated) {
        setInvoice(updated);
        setStatus('paid');
      } else {
        setStatus('paid');
      }
      toast.success('Invoice marked as paid');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Duplicate invoice
  const handleDuplicate = async () => {
    try {
      const res = await invoiceApi.duplicate(id);
      const newInvoice = res.data?.invoice || res.data?.data || res.data;
      if (newInvoice && newInvoice._id) {
        toast.success('Invoice duplicated');
        navigate(`/bill-preview/${newInvoice._id}`);
      } else {
        toast.success('Invoice duplicated');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to duplicate invoice');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Invoice not found</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  /* ------------------------------------------------------------------ */
  /*  Edit Panel                                                         */
  /* ------------------------------------------------------------------ */
  const EditPanel = (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusCfg.bg} ${statusCfg.text}`}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Invoice Info (read-only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text">Invoice Number</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed">
            {invoice.invoiceNumber || '-'}
          </div>
        </div>
        <div>
          <label className="label-text">Invoice Date</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed">
            {invoice.invoiceDate
              ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '-'}
          </div>
        </div>
      </div>

      {/* Editable: Buyer Name */}
      <div>
        <label htmlFor="buyerName" className="label-text">
          Buyer Name
        </label>
        <input
          id="buyerName"
          type="text"
          className="input-field"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
        />
      </div>

      {/* Buyer Details (read-only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-text">Buyer GSTIN</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed">
            {invoice.buyer?.gstin || '-'}
          </div>
        </div>
        <div>
          <label className="label-text">Buyer Phone</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed">
            {invoice.buyer?.phone || '-'}
          </div>
        </div>
      </div>

      {/* Items Summary (read-only) */}
      <div>
        <label className="label-text">Items ({(invoice.items || []).length})</label>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Description
                </th>
                <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Qty
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 dark:border-gray-700/50"
                >
                  <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                    {item.description || '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">
                    {item.quantity || 0}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-200 font-medium">
                    {'\u20B9'}
                    {(item.lineTotal || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grand Total */}
      <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          Grand Total
        </span>
        <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
          {'\u20B9'}
          {(invoice.grandTotal || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Editable: Notes */}
      <div>
        <label htmlFor="notes" className="label-text">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          className="input-field resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes or comments..."
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveEdits}
        disabled={saving}
        className="btn-primary w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*  Preview Panel                                                      */
  /* ------------------------------------------------------------------ */
  const PreviewPanel = (
    <div className="overflow-auto">
      <div className="min-w-[210mm]">
        <BillTemplate
          invoice={previewInvoice}
          businessProfile={businessProfile}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {invoice.invoiceNumber || 'Invoice'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invoice.buyer?.name || 'Unknown Buyer'}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/edit-bill/${id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share WhatsApp
        </button>

        {status !== 'sent' && status !== 'paid' && (
          <button
            onClick={handleMarkAsSent}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Mark as Sent
          </button>
        )}

        {status !== 'paid' && (
          <button
            onClick={handleMarkAsPaid}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-white bg-green-700 hover:bg-green-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark as Paid
          </button>
        )}

        <button
          onClick={handleDuplicate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
          Duplicate
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'edit' && <div className="card">{EditPanel}</div>}
          {activeTab === 'preview' && <div className="card p-2">{PreviewPanel}</div>}
        </div>
      </div>

      {/* Desktop Split Layout */}
      <div className="hidden md:grid md:grid-cols-5 gap-6">
        {/* Left Panel: Editable Form */}
        <div className="md:col-span-2">
          <div className="card sticky top-4">{EditPanel}</div>
        </div>

        {/* Right Panel: Live Bill Template */}
        <div className="md:col-span-3">
          <div className="card p-2">{PreviewPanel}</div>
        </div>
      </div>
    </div>
  );
}
