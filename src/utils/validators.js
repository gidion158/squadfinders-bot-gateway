import mongoose from 'mongoose';

export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateMessageId = (id) => {
  return !isNaN(id) && Number.isInteger(parseInt(id, 10));
};