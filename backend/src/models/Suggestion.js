import mongoose, { Schema } from 'mongoose';

const SuggestionSchema = new Schema({
  // Stored in DB (hidden from user)
  name: { type: String, required: true },
  roomNumber: { type: String, required: true },
  hostel: {
    type: String,
    required: true,
    enum: ['Shivalik BH1', 'Aravali BH2', 'Satpura GH1', 'Nilgiri GH2']
  },
  suggestionText: { type: String, required: true },
  recipientType: {
    type: String,
    required: true,
    enum: ['mess_secretary', 'hostel_warden', 'chief_warden']
  },
  date: { type: Date, default: Date.now },
  // Auto-delete after 3 months via TTL index
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  }
}, { timestamps: true });

// TTL index - MongoDB auto-deletes after 3 months
SuggestionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Suggestion', SuggestionSchema);