import mongoose from 'mongoose';

const messageLogSchema = new mongoose.Schema(
  {
    senderNumber: { type: String, required: true, index: true },
    senderName: { type: String, default: 'Customer' },
    customerMessage: { type: String, required: true },
    aiReply: { type: String, required: true },
    toolUsed: { type: String, default: 'None' },
    status: { type: String, enum: ['delivered', 'failed', 'skipped'], default: 'delivered' }
  },
  { timestamps: true }
);

export const MessageLog = mongoose.model('MessageLog', messageLogSchema);
