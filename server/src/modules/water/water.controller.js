import { Water } from '../../models/water.model.js';
import { AppError } from '../../utils/app-error.js';

export const getWaterToday = async (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  let water = await Water.findOne({ userId: req.user.id, date });

  if (!water) {
    water = { amountMl: 0, date };
  }

  res.status(200).json({
    success: true,
    data: water,
  });
};

export const addWater = async (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  const { amount } = req.body; // e.g. 250

  if (!amount || amount <= 0) {
    throw new AppError('Invalid water amount', 400);
  }

  let water = await Water.findOne({ userId: req.user.id, date });

  if (!water) {
    water = await Water.create({
      userId: req.user.id,
      date,
      amountMl: amount,
    });
  } else {
    water.amountMl += amount;
    await water.save();
  }

  res.status(200).json({
    success: true,
    data: water,
  });
};
