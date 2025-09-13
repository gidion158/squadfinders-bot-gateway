import { CanceledUser } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId } from '../utils/validators.js';

export const canceledUserController = {
  // Get all canceled users with pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, username } = req.query;
    const query = {};
    
    if (username) query.username = username;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      CanceledUser.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CanceledUser.countDocuments(query)
    ]);

    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Get canceled user by ID
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await CanceledUser.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'Canceled user not found' });
    }

    res.json(user);
  }),

  // Check if user is canceled by user_id or username
  isCanceled: handleAsyncError(async (req, res) => {
    const { user_id, username } = req.query;

    if (!user_id && !username) {
      return res.status(400).json({ error: 'Either user_id or username is required' });
    }

    const query = {};
    if (user_id) query.user_id = user_id;
    if (username) query.username = username;

    const user = await CanceledUser.findOne(query);

    res.json({
      is_canceled: !!user,
      user: user || null
    });
  }),

  // Create new canceled user
  create: handleAsyncError(async (req, res) => {
    const user = new CanceledUser(req.body);
    await user.save();
    res.status(201).json(user);
  }),

  // Update canceled user
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await CanceledUser.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ error: 'Canceled user not found' });
    }

    res.json(user);
  }),

  // Delete canceled user
  delete: handleAsyncError(async (req, res) => {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await CanceledUser.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'Canceled user not found' });
    }

    res.json({ message: 'Canceled user deleted successfully' });
  })
};