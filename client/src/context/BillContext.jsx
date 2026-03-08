import { createContext, useState } from 'react';

export const BillContext = createContext(null);

const emptyBill = {
  billType: 'TAX INVOICE',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  buyer: { name: '', gstin: '', addressLine1: '', city: '', state: '', stateCode: '', phone: '', email: '' },
  shippingAddress: { name: '', addressLine1: '', city: '', state: '', pincode: '' },
  items: [
    { description: '', hsnOrSac: '', isService: false, quantity: 1, unit: 'Nos', ratePerUnit: 0, mrp: null, discountPercent: 0, gstRate: 18, cessRate: 0 },
  ],
  customFields: [],
  notes: '',
  termsAndConditions: '',
  placeOfSupply: '',
  aiInputText: '',
};

export function BillProvider({ children }) {
  const [billData, setBillData] = useState({ ...emptyBill });
  const [calculatedBill, setCalculatedBill] = useState(null);

  const resetBill = () => {
    setBillData({ ...emptyBill, items: [{ ...emptyBill.items[0] }] });
    setCalculatedBill(null);
  };

  const updateBillField = (field, value) => {
    setBillData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBuyer = (field, value) => {
    setBillData((prev) => ({
      ...prev,
      buyer: { ...prev.buyer, [field]: value },
    }));
  };

  const addItem = () => {
    setBillData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', hsnOrSac: '', isService: false, quantity: 1, unit: 'Nos', ratePerUnit: 0, mrp: null, discountPercent: 0, gstRate: 18, cessRate: 0 }],
    }));
  };

  const updateItem = (index, field, value) => {
    setBillData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const removeItem = (index) => {
    setBillData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const addCustomField = (field) => {
    setBillData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { ...field, id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }],
    }));
  };

  const updateCustomField = (id, field, value) => {
    setBillData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((cf) => (cf.id === id ? { ...cf, [field]: value } : cf)),
    }));
  };

  const removeCustomField = (id) => {
    setBillData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((cf) => cf.id !== id),
    }));
  };

  return (
    <BillContext.Provider
      value={{
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
      }}
    >
      {children}
    </BillContext.Provider>
  );
}
