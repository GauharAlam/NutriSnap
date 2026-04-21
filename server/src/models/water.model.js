import mongoose from 'mongoose';

const waterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String, // Stored as 'YYYY-MM-DD'
    required: true,
    index: true,
  },
  amountMl: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

// Prevent duplicate entries for the same user on the same day
waterSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Water = mongoose.model('Water', waterSchema);
