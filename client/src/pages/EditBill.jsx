import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBill } from '../hooks/useBill';
import invoiceApi from '../api/invoice.api';
import businessApi from '../api/business.api';
import customerApi from '../api/customer.api';
import ManualBillForm from '../components/forms/ManualBillForm';
import AddCustomFieldPanel from '../components/forms/AddCustomFieldPanel';
import BillTemplate from '../components/bill/BillTemplate';
import TaxSummary from '../components/bill/TaxSummary';
import { calculateBillTotals } from '../utils/billCalculator';
import { stateList } from '../utils/stateList';
import { downloadBillAsPDF } from '../utils/pdfGenerator';
import LoadingSpinner from '../components/shared/LoadingSpinner';

/* ------------------------------------------------------------------ */
/*  Default buyer shape (matches BillContext emptyBill.buyer)           */
/* ------------------------------------------------------------------ */

const defaultBuyer = {
  name: '',
  gstin: '',
  addressLine1: '',
  city: '',
  state: '',
  stateCode: '',
  phone: '',
  email: '',
};

/* ------------------------------------------------------------------ */
/*  EditBill Page                                                       */
/* ------------------------------------------------------------------ */

export default function EditBill() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---- Bill context ---- */
  const {
    billData,
    setBillData,
    calculatedBill,
    setCalculatedBill,
    resetBill,
    updateBillField,
    updateBuyer,
    addItem,
    updateItem,
    removeItem,
    addCustomField,
    updateCustomField,
    removeCustomField,
  } = useBill();

  /* ---- Local UI state ---- */
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Business profile and customers */
  const [businessProfile, setBusinessProfile] = useState(null);
  const [customers, setCustomers] = useState([]);

  /* Original invoice data (for header display) */
  const [invoiceNumber, setInvoiceNumber] = useState('');

  /* Custom field panel */
  const [customFieldPanelOpen, setCustomFieldPanelOpen] = useState(false);

  /* Mobile view toggle: 'form' or 'preview' */
  const [mobileView, setMobileView] = useState('form');

  /* Ref for bill preview scroll target */
  const billPreviewRef = useRef(null);

  /* ---------------------------------------------------------------- */
  /*  On mount: fetch invoice, business profile, and customers         */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      setPageLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        invoiceApi.getById(id),
        businessApi.get(),
        customerApi.getAll(),
      ]);

      if (cancelled) return;

      // --- Invoice ---
      const invoiceResult = results[0];
      if (invoiceResult.status === 'fulfilled') {
        const invoice =
          invoiceResult.value?.data?.invoice ||
          invoiceResult.value?.data?.data ||
          invoiceResult.value?.data ||
          null;

        if (!invoice) {
          setError('Invoice not found.');
          setPageLoading(false);
          return;
        }

        setInvoiceNumber(invoice.invoiceNumber || '');

        // Pre-populate all fields into BillContext
        setBillData({
          billType: invoice.billType || 'TAX INVOICE',
          invoiceDate: invoice.invoiceDate
            ? new Date(invoice.invoiceDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          dueDate: invoice.dueDate
            ? new Date(invoice.dueDate).toISOString().split('T')[0]
            : '',
          buyer: { ...defaultBuyer, ...invoice.buyer },
          shippingAddress: invoice.shippingAddress || {},
          items:
            invoice.items?.map((item) => ({
              description: item.description || '',
              hsnOrSac: item.hsnOrSac || '',
              isService: item.isService || false,
              quantity: item.quantity || 1,
              unit: item.unit || 'Nos',
              ratePerUnit: item.ratePerUnit || 0,
              mrp: item.mrp || null,
              discountPercent: item.discountPercent || 0,
              gstRate: item.gstRate ?? 18,
              cessRate: item.cessRate || 0,
            })) || [
              {
                description: '',
                hsnOrSac: '',
                quantity: 1,
                unit: 'Nos',
                ratePerUnit: 0,
                discountPercent: 0,
                gstRate: 18,
                cessRate: 0,
              },
            ],
          customFields: invoice.customFields || [],
          notes: invoice.notes || '',
          termsAndConditions: invoice.termsAndConditions || '',
          placeOfSupply: invoice.placeOfSupply || '',
          aiInputText: invoice.aiInputText || '',
        });
      } else {
        const errStatus = invoiceResult.reason?.response?.status;
        if (errStatus === 404) {
          setError('Invoice not found. It may have been deleted.');
        } else {
          setError('Failed to load invoice. Please try again.');
          console.error('Failed to load invoice:', invoiceResult.reason);
        }
        setPageLoading(false);
        return;
      }

      // --- Business Profile ---
      const profileResult = results[1];
      if (profileResult.status === 'fulfilled') {
        const profileData =
          profileResult.value?.data?.profile ||
          profileResult.value?.data?.business ||
          profileResult.value?.data?.data ||
          null;
        if (profileData && (profileData.businessName || profileData.state)) {
          setBusinessProfile(profileData);
        }
      } else {
        console.error('Failed to load business profile:', profileResult.reason);
      }

      // --- Customers ---
      const customersResult = results[2];
      if (customersResult.status === 'fulfilled') {
        const customerList =
          customersResult.value?.data?.customers ||
          customersResult.value?.data?.data ||
          customersResult.value?.data ||
          [];
        setCustomers(Array.isArray(customerList) ? customerList : []);
      }

      setPageLoading(false);
    }

    fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, [id, setBillData]);

  /* ---------------------------------------------------------------- */
  /*  Real-time tax calculation                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!businessProfile) return;

    const sellerState = businessProfile.state || '';
    const buyerState = billData.buyer?.state || '';

    try {
      const totals = calculateBillTotals(billData.items, sellerState, buyerState);
      setCalculatedBill(totals);
    } catch (err) {
      console.error('Calculation error:', err);
    }
  }, [
    billData.items,
    billData.buyer?.state,
    businessProfile,
    setCalculatedBill,
  ]);

  /* ---------------------------------------------------------------- */
  /*  Customer selection handler                                       */
  /* ---------------------------------------------------------------- */

  const handleSelectCustomer = useCallback(
    (customer) => {
      setBillData((prev) => {
        const stateEntry = customer.state
          ? stateList.find(
              (s) => s.name.toLowerCase() === customer.state.toLowerCase()
            )
          : null;

        return {
          ...prev,
          buyer: {
            ...prev.buyer,
            name: customer.name || prev.buyer.name,
            gstin: customer.gstin || prev.buyer.gstin,
            addressLine1:
              customer.addressLine1 || customer.address || prev.buyer.addressLine1,
            city: customer.city || prev.buyer.city,
            state: customer.state || prev.buyer.state,
            stateCode: stateEntry
              ? stateEntry.code
              : customer.stateCode || prev.buyer.stateCode,
            phone: customer.phone || prev.buyer.phone,
            email: customer.email || prev.buyer.email,
            pincode: customer.pincode || prev.buyer.pincode || '',
          },
        };
      });
    },
    [setBillData]
  );

  /* ---------------------------------------------------------------- */
  /*  ManualBillForm action handler (draft / preview / download)       */
  /* ---------------------------------------------------------------- */

  const handleFormAction = useCallback(
    (field, value) => {
      if (field === '_action') {
        switch (value) {
          case 'draft':
            handleSaveChanges();
            break;
          case 'preview':
            handlePreviewBill();
            break;
          case 'download':
            handleSaveAndDownload();
            break;
          default:
            break;
        }
        return;
      }
      // For all other field updates, delegate to context
      updateBillField(field, value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateBillField]
  );

  /* ---------------------------------------------------------------- */
  /*  Custom field panel handlers                                      */
  /* ---------------------------------------------------------------- */

  const handleOpenCustomFieldPanel = useCallback(() => {
    setCustomFieldPanelOpen(true);
  }, []);

  const handleCloseCustomFieldPanel = useCallback(() => {
    setCustomFieldPanelOpen(false);
  }, []);

  const handleAddCustomField = useCallback(
    (fieldData) => {
      addCustomField(fieldData);
    },
    [addCustomField]
  );

  /* ---------------------------------------------------------------- */
  /*  Build the invoice payload for saving                             */
  /* ---------------------------------------------------------------- */

  function buildInvoicePayload(status) {
    const sellerState = businessProfile?.state || '';
    const buyerState = billData.buyer?.state || '';
    const totals = calculateBillTotals(billData.items, sellerState, buyerState);

    return {
      billType: billData.billType,
      invoiceDate: billData.invoiceDate,
      dueDate: billData.dueDate || undefined,
      buyer: { ...billData.buyer },
      shippingAddress: { ...billData.shippingAddress },
      items: totals.items,
      customFields: billData.customFields,
      notes: billData.notes,
      termsAndConditions: billData.termsAndConditions,
      placeOfSupply: billData.placeOfSupply || billData.buyer?.state || '',
      isInterState: totals.isInterState,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTaxable: totals.totalTaxable,
      totalCGST: totals.totalCGST,
      totalSGST: totals.totalSGST,
      totalIGST: totals.totalIGST,
      totalCess: totals.totalCess,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountInWords: totals.amountInWords,
      seller: businessProfile
        ? {
            businessName: businessProfile.businessName || '',
            gstin: businessProfile.gstin || '',
            address: businessProfile.address || businessProfile.addressLine1 || '',
            city: businessProfile.city || '',
            state: businessProfile.state || '',
            stateCode: businessProfile.stateCode || '',
            phone: businessProfile.phone || '',
            email: businessProfile.email || '',
            logoUrl: businessProfile.logoUrl || businessProfile.logo || '',
          }
        : undefined,
      status,
    };
  }

  /* ---------------------------------------------------------------- */
  /*  Validation                                                       */
  /* ---------------------------------------------------------------- */

  function validateBill() {
    if (!billData.buyer?.name?.trim()) {
      toast.error('Buyer name is required.');
      return false;
    }

    const hasValidItem = billData.items.some(
      (item) => item.description?.trim() && Number(item.ratePerUnit) > 0
    );
    if (!hasValidItem) {
      toast.error('Add at least one item with a description and rate.');
      return false;
    }

    if (!businessProfile) {
      toast.error('Business profile is not set up. Go to Settings to create one.');
      return false;
    }

    return true;
  }

  /* ---------------------------------------------------------------- */
  /*  Save Changes (PUT /api/invoices/:id)                             */
  /* ---------------------------------------------------------------- */

  async function handleSaveChanges() {
    if (!validateBill()) return;

    setSaving(true);
    try {
      const payload = buildInvoicePayload('draft');
      await invoiceApi.update(id, payload);

      toast.success('Invoice updated successfully!');
      navigate(`/bill-preview/${id}`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save changes. Please try again.';
      toast.error(message);
      console.error('Save changes error:', err);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Preview Bill (scroll to preview section)                         */
  /* ---------------------------------------------------------------- */

  function handlePreviewBill() {
    // On mobile, switch to preview tab
    setMobileView('preview');

    // On desktop, scroll to preview section
    if (billPreviewRef.current) {
      billPreviewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Save & Download PDF                                              */
  /* ---------------------------------------------------------------- */

  async function handleSaveAndDownload() {
    if (!validateBill()) return;

    setSaving(true);
    try {
      const payload = buildInvoicePayload('draft');
      await invoiceApi.update(id, payload);

      toast.success('Invoice updated! Generating PDF...');

      // Small delay to let the template render with final data
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await downloadBillAsPDF('bill-print-area', invoiceNumber || 'invoice');
        toast.success('PDF downloaded successfully!');
      } catch (pdfErr) {
        console.error('PDF generation error:', pdfErr);
        toast.error(
          'Invoice saved but PDF generation failed. You can download it from the preview page.'
        );
      }

      navigate(`/bill-preview/${id}`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save invoice. Please try again.';
      toast.error(message);
      console.error('Save & download error:', err);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Build the merged invoice object for the live preview             */
  /* ---------------------------------------------------------------- */

  function buildPreviewInvoice() {
    const sellerState = businessProfile?.state || '';
    const buyerState = billData.buyer?.state || '';

    let totals = calculatedBill;
    if (!totals) {
      try {
        totals = calculateBillTotals(billData.items, sellerState, buyerState);
      } catch {
        totals = {
          items: billData.items,
          isInterState: false,
          subtotal: 0,
          totalDiscount: 0,
          totalTaxable: 0,
          totalCGST: 0,
          totalSGST: 0,
          totalIGST: 0,
          totalCess: 0,
          totalTax: 0,
          roundOff: 0,
          grandTotal: 0,
          amountInWords: '',
        };
      }
    }

    return {
      seller: businessProfile
        ? {
            businessName: businessProfile.businessName || '',
            gstin: businessProfile.gstin || '',
            address:
              businessProfile.address || businessProfile.addressLine1 || '',
            city: businessProfile.city || '',
            state: businessProfile.state || '',
            stateCode: businessProfile.stateCode || '',
            phone: businessProfile.phone || '',
            email: businessProfile.email || '',
            logoUrl: businessProfile.logoUrl || businessProfile.logo || '',
          }
        : {},
      buyer: billData.buyer,
      shippingAddress: billData.shippingAddress,
      billType: billData.billType,
      invoiceNumber: invoiceNumber || 'PREVIEW',
      invoiceDate: billData.invoiceDate,
      dueDate: billData.dueDate,
      placeOfSupply: billData.placeOfSupply || billData.buyer?.state || '',
      isInterState: totals.isInterState,
      items: totals.items || billData.items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTaxable: totals.totalTaxable,
      totalCGST: totals.totalCGST,
      totalSGST: totals.totalSGST,
      totalIGST: totals.totalIGST,
      totalCess: totals.totalCess,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      amountInWords: totals.amountInWords,
      customFields: billData.customFields,
      notes: billData.notes,
      termsAndConditions: billData.termsAndConditions,
      status: 'draft',
    };
  }

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (pageLoading) {
    return <LoadingSpinner text="Loading invoice..." />;
  }

  /* ---------------------------------------------------------------- */
  /*  Error state (invoice not found)                                  */
  /* ---------------------------------------------------------------- */

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg max-w-md text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400 dark:text-red-500 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
            Invoice Not Found
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const previewInvoice = buildPreviewInvoice();

  return (
    <div className="space-y-6 pb-12">
      {/* ============ Page Header ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Go back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Invoice {invoiceNumber ? `#${invoiceNumber}` : ''}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Modify the invoice details below and save your changes.
            </p>
          </div>
        </div>
      </div>

      {/* ============ Mobile View Toggle ============ */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView('form')}
          className={`flex-1 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            mobileView === 'form'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Edit Form
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            mobileView === 'preview'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* ============ Split Screen Layout ============ */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ---- Left Side: Edit Form ---- */}
        <div
          className={`w-full lg:w-1/2 lg:block ${
            mobileView === 'form' ? 'block' : 'hidden'
          }`}
        >
          <div className="space-y-6">
            <ManualBillForm
              billData={billData}
              onUpdate={handleFormAction}
              onUpdateBuyer={updateBuyer}
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddCustomField={handleOpenCustomFieldPanel}
              onRemoveCustomField={removeCustomField}
              onUpdateCustomField={updateCustomField}
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
            />

            {/* Live Tax Summary */}
            {calculatedBill && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tax Summary
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  {calculatedBill.isInterState
                    ? 'Inter-State supply detected (IGST applies)'
                    : 'Intra-State supply detected (CGST + SGST applies)'}
                  {businessProfile?.state
                    ? ` | Seller: ${businessProfile.state}`
                    : ''}
                  {billData.buyer?.state
                    ? ` | Buyer: ${billData.buyer.state}`
                    : ''}
                </p>
                <TaxSummary
                  totals={calculatedBill}
                  isInterState={calculatedBill.isInterState}
                />
                {calculatedBill.amountInWords && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">
                    Amount in words:{' '}
                    <span className="font-medium not-italic">
                      {calculatedBill.amountInWords}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Custom Field Slide-in Panel */}
            <AddCustomFieldPanel
              isOpen={customFieldPanelOpen}
              onClose={handleCloseCustomFieldPanel}
              onAdd={handleAddCustomField}
            />

            {/* ============ Action Buttons ============ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="btn-secondary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>

              <button
                type="button"
                onClick={handlePreviewBill}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Preview Bill
              </button>

              <button
                type="button"
                onClick={handleSaveAndDownload}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                    Saving &amp; Downloading...
                  </>
                ) : (
                  'Save & Download PDF'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ---- Right Side: Live Bill Preview ---- */}
        <div
          ref={billPreviewRef}
          className={`w-full lg:w-1/2 lg:block ${
            mobileView === 'preview' ? 'block' : 'hidden'
          }`}
        >
          <div className="lg:sticky lg:top-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Live Bill Preview
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Preview
              </span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="min-w-[210mm] p-4">
                <BillTemplate
                  invoice={previewInvoice}
                  businessProfile={businessProfile || {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
