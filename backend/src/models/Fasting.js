// ============================================================
// FASTING REGISTER FEATURE - MODEL
// To remove this feature: delete this entire file
// ============================================================

import mongoose from 'mongoose';

const fastingEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now },
});

const fastingRegisterSchema = new mongoose.Schema({
    hostel: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false },
    festivalName: { type: String, default: 'Fasting Register', trim: true },
    activatedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    entries: [fastingEntrySchema],
}, { timestamps: true });

const Fasting = mongoose.model('Fasting', fastingRegisterSchema);

export default Fasting;

// ============================================================
// END FASTING REGISTER FEATURE - MODEL
// ============================================================