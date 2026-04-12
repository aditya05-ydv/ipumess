import mongoose, { Schema } from 'mongoose';

const RatingSchema = new Schema({
    userId: { type: String, required: true },
    hostel: { type: String, required: true },
    date: { type: String, required: true }, // actual date e.g. "2026-04-06"
    day: { type: String, required: true },  // day name e.g. "Monday"
    mealType: { type: String, required: true },
    itemName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// Prevent duplicate ratings per user per meal
RatingSchema.index({ userId: 1, hostel: 1, day: 1, mealType: 1, itemName: 1 }, { unique: true });

// Index for better query performance
RatingSchema.index({ hostel: 1, date: 1 });
RatingSchema.index({ hostel: 1, date: 1, day: 1 });
RatingSchema.index({ createdAt: 1 }); // for 30 day cleanup

export default mongoose.model('Rating', RatingSchema);
