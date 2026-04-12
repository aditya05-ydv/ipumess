import mongoose, { Schema } from 'mongoose';
const PollSchema = new Schema({
    hostel: { type: String, required: true },
    question: { type: String, required: true },
    options: [
        {
            text: { type: String, required: true },
            votes: { type: Number, default: 0 }
        }
    ],
    type: { type: String, enum: ['user', 'admin'], required: true }, // 'user' = user poll, 'admin' = admin poll
    createdBy: { type: String, default: 'admin' }, // userId or adminId
    votedUsers: [
    {
        userId: { type: String, required: true },
        optionIndex: { type: Number, required: true, default: 0 },
        votedAt: { type: Date, default: Date.now }
    }
],
    expiresAt: { type: Date, required: true }, // Auto-expires after 24 hours
    isActive: { type: Boolean, default: true }, // Becomes false after 24 hours
}, { timestamps: true });

// Index for better query performance
PollSchema.index({ hostel: 1, createdAt: -1 });
PollSchema.index({ expiresAt: 1 });

export default mongoose.model('Poll', PollSchema);
