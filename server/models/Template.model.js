import mongoose from 'mongoose';

const templateCustomFieldSchema = new mongoose.Schema(
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

const templateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: [true, 'Template name is required'], trim: true },
    description: { type: String, default: '' },
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
    defaultCustomFields: [templateCustomFieldSchema],
    defaultTerms: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Template', templateSchema);
