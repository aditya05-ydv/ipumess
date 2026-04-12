import mongoose, { Schema } from 'mongoose';
const MenuSchema = new Schema({
    hostel: { type: String, required: true },
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    meals: {
        breakfast: [{ type: String }],
        lunch: [{ type: String }],
        snacks: [{ type: String }],
        dinner: [{ type: String }],
    },
}, { timestamps: true });
// Ensure unique combination of hostel and day
MenuSchema.index({ hostel: 1, day: 1 }, { unique: true });
export default mongoose.model('Menu', MenuSchema);
