import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import invoiceApi from '../api/invoice.api';
import BillTemplate from '../components/bill/BillTemplate';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { downloadBillAsPDF } from '../utils/pdfGenerator';

export default function BillView() {
  const { token } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Fetch invoice by public token
  useEffect(() => {
    async function fetchPublicInvoice() {
      setLoading(true);
      setError(null);
      try {
        const res = await invoiceApi.getPublic(token);
        const invoiceData = res.data?.invoice || res.data?.data || res.data;
        if (invoiceData) {
          setInvoice(invoiceData);
        } else {
          setError('Invoice not found');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('This invoice could not be found. It may have been deleted or the link is invalid.');
        } else {
          setError(err.response?.data?.message || 'Failed to load invoice. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPublicInvoice();
  }, [token]);

  // Download PDF
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadBillAsPDF('bill-print-area', invoice.invoiceNumber);
    } catch (err) {
      // Silent fail for public page -- user can retry
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner text="Loading invoice..." />
      </div>
    );
  }

  // Error / 404 state
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              {error || 'This invoice could not be found. It may have been deleted or the link is invalid.'}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Powered by SmartBill
          </p>
        </div>
      </div>
    );
  }

  // Success: render bill
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar with Download button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                {invoice.invoiceNumber || 'Invoice'}
              </h1>
              <p className="text-xs text-gray-500">
                {invoice.seller?.businessName || 'Business'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Bill Content */}
      <div className="max-w-[900px] mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-auto">
          <div className="min-w-[210mm]">
            <BillTemplate invoice={invoice} businessProfile={null} />
          </div>
        </div>
      </div>

      {/* Footer Watermark */}
      <div className="pb-8 text-center">
        <p className="text-xs text-gray-400">
          Powered by{' '}
          <span className="font-semibold text-gray-500">SmartBill</span>
        </p>
      </div>
    </div>
  );
}
