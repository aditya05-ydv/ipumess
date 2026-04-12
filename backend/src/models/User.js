import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    roomNumber: { type: String, required: true },
    pin: { type: String, required: true, match: /^\d{4}$/ },
    hostel: {
        type: String,
        required: true,
        enum: ['Shivalik BH1', 'Aravali BH2', 'Satpura GH1', 'Nilgiri GH2']
    },
}, { timestamps: true });
UserSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
export default mongoose.model('User', UserSchema);
