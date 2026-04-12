import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema({
  hostel: {
    type: String,
    required: true,
    unique: true,
    enum: ['Shivalik BH1', 'Aravali BH2', 'Satpura GH1', 'Nilgiri GH2'],
  },
  name: { type: String, required: true, default: 'Hostel Admin' },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Admin', AdminSchema);
