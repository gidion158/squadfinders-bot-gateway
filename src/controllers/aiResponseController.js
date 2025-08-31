import { AIResponse } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';

export const aiResponseController = {
  // Get all AI responses with filtering and pagination
  getAll: handleAsyncError(async (req, res) => {
    const { is_lfg, page = 1, limit = 100 } = req.query;
    const query = {};
    
    if (is_lfg !== undefined) query.is_lfg = is_lfg === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [aiResponses, total] = await Promise.all([
      AIResponse.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AIResponse.countDocuments(query)
    ]);

    res.json({
      data: aiResponses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Get AI response by ID or message_id
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let aiResponse;

    if (validateObjectId(id)) {
      aiResponse = await AIResponse.findById(id);
    } else if (validateMessageId(id)) {
      aiResponse = await AIResponse.findOne({ message_id: parseInt(id, 10) });
    }

    if (!aiResponse) {
      return res.status(404).json({ error: 'AI Response not found' });
    }

    res.json(aiResponse);
  }),

  // Create new AI response
  create: handleAsyncError(async (req, res) => {
    const aiResponse = new AIResponse(req.body);
    await aiResponse.save();
    res.status(201).json(aiResponse);
  }),

  // Update AI response
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let aiResponse;

    if (validateObjectId(id)) {
      aiResponse = await AIResponse.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (validateMessageId(id)) {
      aiResponse = await AIResponse.findOneAndUpdate(
        { message_id: parseInt(id, 10) },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!aiResponse) {
      return res.status(404).json({ error: 'AI Response not found' });
    }

    res.json(aiResponse);
  }),

  // Delete AI response
  delete: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let aiResponse;

    if (validateObjectId(id)) {
      aiResponse = await AIResponse.findByIdAndDelete(id);
    } else if (validateMessageId(id)) {
      aiResponse = await AIResponse.findOneAndDelete({ message_id: parseInt(id, 10) });
    }

    if (!aiResponse) {
      return res.status(404).json({ error: 'AI Response not found' });
    }

    res.json({ message: 'AI Response deleted successfully' });
  })
};