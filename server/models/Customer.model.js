import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: [true, 'Customer name is required'], trim: true },
    gstin: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    pincode: { type: String, default: '' },
    totalInvoices: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ userId: 1, name: 1 });

export default mongoose.model('Customer', customerSchema);
