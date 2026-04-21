import mongoose from 'mongoose';

const progressPhotoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  weight: {
    type: Number,
    default: null,
  },
  imagePath: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const ProgressPhoto = mongoose.model('ProgressPhoto', progressPhotoSchema);
