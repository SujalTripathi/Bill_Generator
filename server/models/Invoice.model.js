import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema(
  {
    id: { type: String },
    label: { type: String },
    fieldType: {
      type: String,
      enum: ['text', 'date', 'number', 'textarea', 'signature', 'stampbox', 'checkbox', 'image'],
      default: 'text',
    },
    value: { type: String, default: '' },
    position: {
      type: String,
      enum: ['header', 'below_buyer', 'above_items', 'below_items', 'footer'],
      default: 'header',
    },
    width: { type: String, enum: ['full', 'half'], default: 'half' },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const lineItemSchema = new mongoose.Schema(
  {
    srNo: { type: Number },
    description: { type: String, required: true },
    hsnOrSac: { type: String, default: '' },
    isService: { type: Boolean, default: false },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'Nos' },
    ratePerUnit: { type: Number, required: true, min: 0 },
    mrp: { type: Number },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    gstRate: {
      type: Number,
      enum: [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28],
      default: 18,
    },
    cgstRate: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstRate: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstRate: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    cessRate: { type: Number, default: 0 },
    cessAmount: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },

    // Invoice Identity
    invoiceNumber: { type: String, unique: true },
    billType: {
      type: String,
      enum: [
        'TAX INVOICE',
        'RETAIL BILL',
        'PROFORMA INVOICE',
        'CREDIT NOTE',
        'DELIVERY CHALLAN',
        'PURCHASE ORDER',
      ],
      default: 'TAX INVOICE',
    },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    // Seller snapshot
    seller: {
      businessName: String,
      gstin: String,
      address: String,
      city: String,
      state: String,
      stateCode: String,
      phone: String,
      email: String,
      logoUrl: String,
    },

    // Buyer
    buyer: {
      name: { type: String, required: [true, 'Buyer name is required'] },
      gstin: { type: String, default: '' },
      addressLine1: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, required: [true, 'Buyer state is required'] },
      stateCode: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },

    // Shipping
    shippingAddress: {
      name: { type: String, default: '' },
      addressLine1: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },

    // Line Items
    items: [lineItemSchema],

    // Tax Logic
    isInterState: { type: Boolean, default: false },
    placeOfSupply: { type: String, default: '' },

    // Bill Totals
    subtotal: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalTaxable: { type: Number, default: 0 },
    totalCGST: { type: Number, default: 0 },
    totalSGST: { type: Number, default: 0 },
    totalIGST: { type: Number, default: 0 },
    totalCess: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    amountInWords: { type: String, default: '' },

    // Dynamic Custom Fields
    customFields: [customFieldSchema],

    // Meta
    notes: { type: String, default: '' },
    termsAndConditions: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'cancelled'],
      default: 'draft',
    },
    paymentDate: { type: Date },
    paymentMode: { type: String, default: '' },
    publicToken: { type: String },
    aiInputText: { type: String, default: '' },
  },
  { timestamps: true }
);

invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ publicToken: 1 });

export default mongoose.model('Invoice', invoiceSchema);
