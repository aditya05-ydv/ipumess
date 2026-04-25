import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    roomNumber: { type: String, required: true },
    password: { type: String, required: true }, // was 'pin', now hashed password
    hostel: {
        type: String,
        required: true,
        enum: ['Shivalik BH1', 'Aravali BH2', 'Satpura GH1', 'Nilgiri GH2']
    },
    isFirstLogin: { type: Boolean, default: true }, // true = still using default password
}, { timestamps: true });

UserSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model('User', UserSchema);