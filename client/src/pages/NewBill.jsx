import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBill } from '../hooks/useBill';
import invoiceApi from '../api/invoice.api';
import businessApi from '../api/business.api';
import customerApi from '../api/customer.api';
import AIInputBox from '../components/forms/AIInputBox';
import ManualBillForm from '../components/forms/ManualBillForm';
import AddCustomFieldPanel from '../components/forms/AddCustomFieldPanel';
import BillTemplate from '../components/bill/BillTemplate';
import TaxSummary from '../components/bill/TaxSummary';
import { calculateBillTotals } from '../utils/billCalculator';
import { stateList } from '../utils/stateList';
import { downloadBillAsPDF } from '../utils/pdfGenerator';
import LoadingSpinner from '../components/shared/LoadingSpinner';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TABS = {
  AI: 'ai',
  MANUAL: 'manual',
};

const billTypes = [
  'TAX INVOICE',
  'RETAIL BILL',
  'PROFORMA INVOICE',
  'CREDIT NOTE',
  'DELIVERY CHALLAN',
  'PURCHASE ORDER',
];

/* ------------------------------------------------------------------ */
/*  NewBill Page                                                       */
/* ------------------------------------------------------------------ */

export default function NewBill() {
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
  const [activeTab, setActiveTab] = useState(TABS.AI);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /* Business profile and customers */
  const [businessProfile, setBusinessProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [customers, setCustomers] = useState([]);

  /* Templates */
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  /* Custom field panel */
  const [customFieldPanelOpen, setCustomFieldPanelOpen] = useState(false);

  /* Mobile preview modal */
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  /* Ref for bill preview scroll target */
  const billPreviewRef = useRef(null);

  /* ---------------------------------------------------------------- */
  /*  On mount: reset bill state and fetch data                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    // Reset any old bill data when navigating to New Bill
    resetBill();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      setPageLoading(true);
      setProfileError(false);

      const results = await Promise.allSettled([
        businessApi.get(),
        customerApi.getAll(),
        invoiceApi.getAll({ type: 'template' }).catch(() => ({ data: [] })),
      ]);

      if (cancelled) return;

      // --- Business Profile ---
      const profileResult = results[0];
      if (profileResult.status === 'fulfilled') {
        const profileData =
          profileResult.value?.data?.profile ||
          profileResult.value?.data?.business ||
          profileResult.value?.data?.data ||
          null;
        if (profileData && (profileData.businessName || profileData.state)) {
          setBusinessProfile(profileData);
        } else {
          setProfileError(true);
        }
      } else {
        const errStatus = profileResult.reason?.response?.status;
        // 404 means profile not set up yet, not a server error
        if (errStatus === 404) {
          setProfileError(true);
        } else {
          setProfileError(true);
          console.error('Failed to load business profile:', profileResult.reason);
        }
      }

      // --- Customers ---
      const customersResult = results[1];
      if (customersResult.status === 'fulfilled') {
        const customerList =
          customersResult.value?.data?.customers ||
          customersResult.value?.data?.data ||
          customersResult.value?.data ||
          [];
        setCustomers(Array.isArray(customerList) ? customerList : []);
      }

      // --- Templates ---
      const templatesResult = results[2];
      if (templatesResult.status === 'fulfilled') {
        const templateList =
          templatesResult.value?.data?.templates ||
          templatesResult.value?.data?.data ||
          templatesResult.value?.data ||
          [];
        setTemplates(Array.isArray(templateList) ? templateList : []);
      }

      setPageLoading(false);
    }

    fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

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
  /*  AI Generate handler                                              */
  /* ---------------------------------------------------------------- */

  const handleAIGenerate = useCallback(
    async (text) => {
      setAiLoading(true);

      try {
        const res = await invoiceApi.parse(text);

        const parsed =
          res.data?.invoice ||
          res.data?.data ||
          res.data?.parsed ||
          res.data ||
          {};

        // Build a merged bill object from the parsed result
        setBillData((prev) => {
          const mergedBuyer = {
            ...prev.buyer,
            ...(parsed.buyer || {}),
          };

          // If parsed buyer has a state, auto-fill stateCode
          if (mergedBuyer.state && !mergedBuyer.stateCode) {
            const entry = stateList.find(
              (s) => s.name.toLowerCase() === mergedBuyer.state.toLowerCase()
            );
            if (entry) {
              mergedBuyer.stateCode = entry.code;
            }
          }

          const mergedItems =
            parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0
              ? parsed.items.map((item) => ({
                  description: item.description || '',
                  hsnOrSac: item.hsnOrSac || item.hsn || item.sac || '',
                  isService: item.isService || false,
                  quantity: Number(item.quantity) || 1,
                  unit: item.unit || 'Nos',
                  ratePerUnit: Number(item.ratePerUnit) || Number(item.rate) || 0,
                  mrp: item.mrp != null ? Number(item.mrp) : null,
                  discountPercent: Number(item.discountPercent) || Number(item.discount) || 0,
                  gstRate: item.gstRate != null ? Number(item.gstRate) : 18,
                  cessRate: Number(item.cessRate) || 0,
                }))
              : prev.items;

          return {
            ...prev,
            billType: parsed.billType || prev.billType,
            invoiceDate: parsed.invoiceDate || prev.invoiceDate,
            dueDate: parsed.dueDate || prev.dueDate,
            buyer: mergedBuyer,
            shippingAddress: parsed.shippingAddress
              ? { ...prev.shippingAddress, ...parsed.shippingAddress }
              : prev.shippingAddress,
            items: mergedItems,
            customFields: parsed.customFields && Array.isArray(parsed.customFields)
              ? parsed.customFields.map((cf, idx) => ({
                  ...cf,
                  id: cf.id || `cf-ai-${Date.now()}-${idx}`,
                }))
              : prev.customFields,
            notes: parsed.notes || prev.notes,
            termsAndConditions: parsed.termsAndConditions || prev.termsAndConditions,
            placeOfSupply: parsed.placeOfSupply || prev.placeOfSupply,
            aiInputText: text,
          };
        });

        // Switch to manual tab so user can review and edit
        setActiveTab(TABS.MANUAL);
        toast.success('Bill generated successfully! Review your bill below.');
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to parse bill. Please try again or use the manual form.';
        toast.error(message);
        console.error('AI parse error:', err);
      } finally {
        setAiLoading(false);
      }
    },
    [setBillData]
  );

  /* ---------------------------------------------------------------- */
  /*  Template selection handler                                       */
  /* ---------------------------------------------------------------- */

  const handleTemplateSelect = useCallback(
    (templateId) => {
      if (!templateId) return;

      const template = templates.find(
        (t) => t._id === templateId || t.id === templateId
      );
      if (!template) return;

      setBillData((prev) => ({
        ...prev,
        billType: template.billType || prev.billType,
        items:
          template.items && Array.isArray(template.items) && template.items.length > 0
            ? template.items.map((item) => ({
                description: item.description || '',
                hsnOrSac: item.hsnOrSac || '',
                isService: item.isService || false,
                quantity: Number(item.quantity) || 1,
                unit: item.unit || 'Nos',
                ratePerUnit: Number(item.ratePerUnit) || 0,
                mrp: item.mrp != null ? Number(item.mrp) : null,
                discountPercent: Number(item.discountPercent) || 0,
                gstRate: item.gstRate != null ? Number(item.gstRate) : 18,
                cessRate: Number(item.cessRate) || 0,
              }))
            : prev.items,
        customFields:
          template.customFields && Array.isArray(template.customFields)
            ? template.customFields.map((cf, idx) => ({
                ...cf,
                id: cf.id || `cf-tpl-${Date.now()}-${idx}`,
              }))
            : prev.customFields,
        notes: template.notes || prev.notes,
        termsAndConditions: template.termsAndConditions || prev.termsAndConditions,
      }));

      toast.success('Template applied! Customize the details as needed.');
    },
    [templates, setBillData]
  );

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
            addressLine1: customer.addressLine1 || customer.address || prev.buyer.addressLine1,
            city: customer.city || prev.buyer.city,
            state: customer.state || prev.buyer.state,
            stateCode: stateEntry ? stateEntry.code : customer.stateCode || prev.buyer.stateCode,
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
            handleSaveDraft();
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
      status,
    };
  }

  /* ---------------------------------------------------------------- */
  /*  Validation                                                       */
  /* ---------------------------------------------------------------- */

  function validateBill() {
    if (!billData.buyer?.name?.trim()) {
      toast.error('Buyer name is required.');
      // Focus the buyer name field
      const buyerNameEl = document.getElementById('buyerName');
      if (buyerNameEl) {
        buyerNameEl.focus();
        buyerNameEl.classList.add('!border-red-500', 'ring-2', 'ring-red-200');
        setTimeout(() => buyerNameEl.classList.remove('!border-red-500', 'ring-2', 'ring-red-200'), 3000);
      }
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
  /*  Save as Draft                                                    */
  /* ---------------------------------------------------------------- */

  async function handleSaveDraft() {
    if (!validateBill()) return;

    setSaving(true);
    try {
      const payload = buildInvoicePayload('draft');
      const res = await invoiceApi.create(payload);

      const savedInvoice =
        res.data?.invoice || res.data?.data || res.data;
      const invoiceId = savedInvoice?._id || savedInvoice?.id;

      toast.success('Draft saved successfully!');
      resetBill();

      if (invoiceId) {
        navigate(`/bill-preview/${invoiceId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save draft. Please try again.';
      toast.error(message);
      console.error('Save draft error:', err);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Preview Bill (scroll to preview section)                         */
  /* ---------------------------------------------------------------- */

  function handlePreviewBill() {
    // On mobile, open full-screen modal instead of scroll
    if (window.innerWidth < 1024) {
      setMobilePreviewOpen(true);
      return;
    }
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
      const res = await invoiceApi.create(payload);

      const savedInvoice =
        res.data?.invoice || res.data?.data || res.data;
      const invoiceNumber =
        savedInvoice?.invoiceNumber || billData.billType || 'invoice';
      const invoiceId = savedInvoice?._id || savedInvoice?.id;

      // Update billData with the real invoice number so the template shows it in PDF
      setBillData((prev) => ({ ...prev, _savedInvoiceNumber: invoiceNumber }));

      toast.success('Invoice saved! Generating PDF...');

      // Delay to let the template re-render with the real invoice number
      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        await downloadBillAsPDF('bill-print-area', invoiceNumber);
        toast.success('PDF downloaded successfully!');
      } catch (pdfErr) {
        console.error('PDF generation error:', pdfErr);
        toast.error('Invoice saved but PDF generation failed. You can download it from the preview page.');
      }

      resetBill();

      if (invoiceId) {
        navigate(`/bill-preview/${invoiceId}`);
      } else {
        navigate('/dashboard');
      }
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
            address: businessProfile.address || businessProfile.addressLine1 || '',
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
      invoiceNumber: billData._savedInvoiceNumber || 'PREVIEW',
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
    return <LoadingSpinner text="Preparing bill editor..." />;
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const previewInvoice = buildPreviewInvoice();

  return (
    <div className="space-y-6 pb-12">
      {/* ============ Page Header ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Bill
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Use AI to auto-generate or fill in the form manually.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                'Reset all fields? This will clear everything you have entered.'
              )
            ) {
              resetBill();
              setActiveTab(TABS.AI);
            }
          }}
          className="self-start sm:self-auto text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          Reset Bill
        </button>
      </div>

      {/* ============ Profile Warning ============ */}
      {profileError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Business profile not found.</span>{' '}
            Tax calculations require your business state. Please{' '}
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              set up your business profile
            </button>{' '}
            first for accurate GST computations.
          </p>
        </div>
      )}

      {/* ============ Tab Switcher ============ */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab(TABS.AI)}
          className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === TABS.AI
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          AI Generate
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.MANUAL)}
          className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === TABS.MANUAL
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Manual Form
        </button>
      </div>

      {/* ============ TAB 1: AI Generate ============ */}
      {activeTab === TABS.AI && (
        <div className="space-y-5">
          {/* Bill Type Selector */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ai-bill-type" className="label-text">
                  Bill Type
                </label>
                <select
                  id="ai-bill-type"
                  className="input-field"
                  value={billData.billType}
                  onChange={(e) => updateBillField('billType', e.target.value)}
                  disabled={aiLoading}
                >
                  {billTypes.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Picker */}
              <div>
                <label htmlFor="ai-template" className="label-text">
                  Start from template
                </label>
                <select
                  id="ai-template"
                  className="input-field"
                  defaultValue=""
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  disabled={aiLoading || templates.length === 0}
                >
                  <option value="">
                    {templates.length === 0
                      ? 'No templates available'
                      : 'Select a template...'}
                  </option>
                  {templates.map((t) => (
                    <option key={t._id || t.id} value={t._id || t.id}>
                      {t.name || t.billType || 'Unnamed Template'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AI Input Box */}
          <AIInputBox onGenerate={handleAIGenerate} loading={aiLoading} />
        </div>
      )}

      {/* ============ TAB 2: Manual Form ============ */}
      {activeTab === TABS.MANUAL && (
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
        </div>
      )}

      {/* ============ Live Bill Preview (hidden on mobile) ============ */}
      <div ref={billPreviewRef} className="hidden lg:block space-y-4">
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

        {/* ============ Action Buttons ============ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveDraft}
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
              'Save as Draft'
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

      {/* ============ Mobile Floating Preview Button ============ */}
      <button
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        title="Preview Bill"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* ============ Mobile Preview Modal ============ */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bill Preview</h2>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable preview */}
          <div className="flex-1 overflow-auto p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[210mm]">
                <BillTemplate
                  invoice={previewInvoice}
                  businessProfile={businessProfile || {}}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer - Action Buttons */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={() => { setMobilePreviewOpen(false); handleSaveDraft(); }}
              disabled={saving}
              className="flex-1 btn-secondary text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => { setMobilePreviewOpen(false); handleSaveAndDownload(); }}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save & Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
