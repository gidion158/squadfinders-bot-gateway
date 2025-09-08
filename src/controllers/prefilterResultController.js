import { PrefilterResult } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';
import { validateObjectId, validateMessageId } from '../utils/validators.js';
import createCsvWriter from 'csv-writer';

export const prefilterResultController = {
  // Get all prefilter results with filtering and pagination
  getAll: handleAsyncError(async (req, res) => {
    const { page = 1, limit = 100, maybe_lfg, min_confidence, max_confidence } = req.query;
    const query = {};
    
    if (maybe_lfg !== undefined) query.maybe_lfg = maybe_lfg === 'true';
    if (min_confidence !== undefined) query.confidence = { ...query.confidence, $gte: parseFloat(min_confidence) };
    if (max_confidence !== undefined) query.confidence = { ...query.confidence, $lte: parseFloat(max_confidence) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [results, total] = await Promise.all([
      PrefilterResult.find(query)
        .sort({ message_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PrefilterResult.countDocuments(query)
    ]);

    res.json({
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  }),

  // Export prefilter results to CSV
  export: handleAsyncError(async (req, res) => {
    const { maybe_lfg, min_confidence, max_confidence } = req.query;
    const query = {};
    
    if (maybe_lfg !== undefined) query.maybe_lfg = maybe_lfg === 'true';
    if (min_confidence !== undefined) query.confidence = { ...query.confidence, $gte: parseFloat(min_confidence) };
    if (max_confidence !== undefined) query.confidence = { ...query.confidence, $lte: parseFloat(max_confidence) };

    const results = await PrefilterResult.find(query).sort({ message_date: -1 });

    // Create CSV content
    const csvWriter = createCsvWriter.createObjectCsvStringifier({
      header: [
        { id: 'message_id', title: 'Message ID' },
        { id: 'message', title: 'Message' },
        { id: 'message_date', title: 'Message Date' },
        { id: 'maybe_lfg', title: 'Maybe LFG' },
        { id: 'confidence', title: 'Confidence' },
        { id: 'createdAt', title: 'Created At' },
        { id: 'updatedAt', title: 'Updated At' }
      ]
    });

    const records = results.map(result => ({
      message_id: result.message_id,
      message: result.message,
      message_date: result.message_date?.toISOString(),
      maybe_lfg: result.maybe_lfg,
      confidence: result.confidence,
      createdAt: result.createdAt?.toISOString(),
      updatedAt: result.updatedAt?.toISOString()
    }));

    const csvContent = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="prefilter_results_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  }),

  // Get prefilter result by ID or message_id
  getById: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let result;

    if (validateObjectId(id)) {
      result = await PrefilterResult.findById(id);
    } else if (validateMessageId(id)) {
      result = await PrefilterResult.findOne({ message_id: parseInt(id, 10) });
    }

    if (!result) {
      return res.status(404).json({ error: 'Prefilter result not found' });
    }

    res.json(result);
  }),

  // Create new prefilter result
  create: handleAsyncError(async (req, res) => {
    const result = new PrefilterResult(req.body);
    await result.save();
    res.status(201).json(result);
  }),

  // Update prefilter result
  update: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let result;

    if (validateObjectId(id)) {
      result = await PrefilterResult.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    } else if (validateMessageId(id)) {
      result = await PrefilterResult.findOneAndUpdate(
        { message_id: parseInt(id, 10) },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!result) {
      return res.status(404).json({ error: 'Prefilter result not found' });
    }

    res.json(result);
  }),

  // Delete prefilter result
  delete: handleAsyncError(async (req, res) => {
    const { id } = req.params;
    let result;

    if (validateObjectId(id)) {
      result = await PrefilterResult.findByIdAndDelete(id);
    } else if (validateMessageId(id)) {
      result = await PrefilterResult.findOneAndDelete({ message_id: parseInt(id, 10) });
    }

    if (!result) {
      return res.status(404).json({ error: 'Prefilter result not found' });
    }

    res.json({ message: 'Prefilter result deleted successfully' });
  })
};