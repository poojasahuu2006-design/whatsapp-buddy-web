import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: 'WhatsApp Contact' },
    leadStatus: {
      type: String,
      enum: ['New Lead', 'Inquiry', 'Booked Call', 'Converted Client'],
      default: 'New Lead'
    },
    messageCount: { type: Number, default: 1 },
    lastMessage: { type: String },
    lastActive: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Lead = mongoose.model('Lead', leadSchema);
