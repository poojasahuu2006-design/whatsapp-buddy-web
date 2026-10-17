import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    clientPhone: { type: String, required: true },
    clientName: { type: String, default: 'WhatsApp User' },
    summary: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    hostEmail: { type: String, default: 'poojasahuu2006@gmail.com' },
    status: { type: String, default: 'confirmed' }
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
