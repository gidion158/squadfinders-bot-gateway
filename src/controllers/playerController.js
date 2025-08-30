import { Player } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';

export const playerController = {
  // Get all players with filtering and pagination
  getAll: handleAsyncError(async (req, res) => {
    const { active, platform, page = 1, limit = 100 } = req.query;
    const query = {};
    
    if (active !== undefined) query.active = active === 'true';
    if (platform) query.platform = platform;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [players, total] = await Promise.all([
      Player.find(query)
        .sort({ message_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Player.countDocuments(query)
    ]);

    res.json({
      data: players,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Get player by ID or message_id
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let player;

    if (validateObjectId(id)) {
      player = await Player.findById(id);
    } else if (validateMessageId(id)) {
      player = await Player.findOne({ message_id: parseInt(id, 10) });
    }

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  }),

  // Create new player
  create: handleAsyncError(async (req, res) => {
    const player = new Player(req.body);
    await player.save();
    res.status(201).json(player);
  }),

  // Update player
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let player;

    if (validateObjectId(id)) {
      player = await Player.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (validateMessageId(id)) {
      player = await Player.findOneAndUpdate(
        { message_id: parseInt(id, 10) },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  }),

  // Delete player
  delete: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let player;

    if (validateObjectId(id)) {
      player = await Player.findByIdAndDelete(id);
    } else if (validateMessageId(id)) {
      player = await Player.findOneAndDelete({ message_id: parseInt(id, 10) });
    }

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player deleted successfully' });
  })
};