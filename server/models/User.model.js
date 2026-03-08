import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: { type: String, required: true },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'business'],
      default: 'free',
    },
    invoiceCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
