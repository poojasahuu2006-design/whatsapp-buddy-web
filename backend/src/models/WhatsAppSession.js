import mongoose from 'mongoose';

const whatsAppSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: 'default'
    },
    files: {
      type: Map,
      of: String,
      default: {}
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export const WhatsAppSession = mongoose.model('WhatsAppSession', whatsAppSessionSchema);
