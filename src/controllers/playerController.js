import { Player } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';
import createCsvWriter from 'csv-writer';
import { promises as fs } from 'fs';
import path from 'path';

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

  // Export players to CSV
  export: handleAsyncError(async (req, res) => {
    const { active, platform } = req.query;
    const query = {};
    
    if (active !== undefined) query.active = active === 'true';
    if (platform) query.platform = platform;

    const players = await Player.find(query).sort({ message_date: -1 });

    // Create CSV content
    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: [
        { id: 'message_id', title: 'Message ID' },
        { id: 'message_date', title: 'Message Date' },
        { id: 'sender_id', title: 'Sender ID' },
        { id: 'sender_username', title: 'Sender Username' },
        { id: 'sender_name', title: 'Sender Name' },
        { id: 'group_id', title: 'Group ID' },
        { id: 'group_title', title: 'Group Title' },
        { id: 'group_username', title: 'Group Username' },
        { id: 'message', title: 'Message' },
        { id: 'platform', title: 'Platform' },
        { id: 'rank', title: 'Rank' },
        { id: 'players_count', title: 'Players Count' },
        { id: 'game_mode', title: 'Game Mode' },
        { id: 'active', title: 'Active' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' }
      ]
    });

    const records = players.map(player => ({
      message_id: player.message_id,
      message_date: player.message_date?.toISOString(),
      sender_id: player.sender?.id || '',
      sender_username: player.sender?.username || '',
      sender_name: player.sender?.name || '',
      group_id: player.group?.group_id || '',
      group_title: player.group?.group_title || '',
      group_username: player.group?.group_username || '',
      message: player.message || '',
      platform: player.platform,
      rank: player.rank,
      players_count: player.players_count,
      game_mode: player.game_mode,
      active: player.active,
      createdAt: player.createdAt?.toISOString(),
      updatedAt: player.updatedAt?.toISOString()
    }));

    const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="players_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
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
    const { sender, group } = req.body;
    
    // Check if sender and group information is provided
    if (sender && sender.id && group && group.group_id) {
      // Deactivate all existing active players for this sender in this group
      await Player.updateMany(
        {
          'sender.id': sender.id,
          'group.group_id': group.group_id,
          active: true
        },
        {
          $set: { active: false }
        }
      );
      
      console.log(`Deactivated existing players for sender ${sender.id} in group ${group.group_id}`);
    }
    
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