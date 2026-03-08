import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: { type: String, required: [true, 'Business name is required'], trim: true },
    gstin: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          return v === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: 'Invalid GSTIN format',
      },
    },
    businessType: {
      type: String,
      enum: ['shop', 'service', 'manufacturer', 'trader', 'freelancer'],
      default: 'shop',
    },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, required: [true, 'State is required'] },
    stateCode: { type: String, default: '' },
    pincode: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logoUrl: { type: String, default: '' },

    // Bank Details
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    upiId: { type: String, default: '' },

    // Invoice Settings
    invoicePrefix: { type: String, default: 'INV' },
    currentFinancialYear: { type: String, default: '' },
    lastInvoiceNumber: { type: Number, default: 0 },

    // Default Terms
    defaultTerms: { type: String, default: 'Payment due within 30 days.' },
    defaultNotes: { type: String, default: '' },

    // Theme
    primaryColor: { type: String, default: '#1a56db' },
    templateStyle: {
      type: String,
      enum: ['classic', 'modern', 'minimal'],
      default: 'classic',
    },
  },
  { timestamps: true }
);

export default mongoose.model('BusinessProfile', businessProfileSchema);
