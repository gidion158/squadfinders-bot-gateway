import { UserSeen } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId } from '../utils/validators.js';

export const userSeenController = {
  // Get all user seen records with pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, user_id, username, active } = req.query;
    const query = {};
    
    if (user_id) query.user_id = user_id;
    if (username) query.username = username;
    if (active !== undefined) query.active = active === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [records, total] = await Promise.all([
      UserSeen.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserSeen.countDocuments(query)
    ]);

    res.json({
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Get user seen record by ID
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid record ID' });
    }

    const record = await UserSeen.findById(id);

    if (!record) {
      return res.status(404).json({ error: 'User seen record not found' });
    }

    res.json(record);
  }),

  // Create new user seen record
  create: handleAsyncError(async (req, res) => {
    const record = new UserSeen(req.body);
    await record.save();
    res.status(201).json(record);
  }),

  // Update user seen record
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid record ID' });
    }

    const record = await UserSeen.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!record) {
      return res.status(404).json({ error: 'User seen record not found' });
    }

    res.json(record);
  }),

  // Delete user seen record
  delete: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid record ID' });
    }

    const record = await UserSeen.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ error: 'User seen record not found' });
    }

    res.json({ message: 'User seen record deleted successfully' });
  })
};