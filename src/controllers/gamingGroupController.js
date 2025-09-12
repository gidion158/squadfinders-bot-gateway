import { GamingGroup } from '../models/index.js';
import { handleAsyncError } from '../utils/errorHandler.js';

export const gamingGroupController = {
  // Get all active gaming groups
  getActiveGroups: handleAsyncError(async (req, res) => {
    const groups = await GamingGroup.find({ active: true })
      .select('name')
      .sort({ name: 1 });

    res.json({
      groups: groups.map(group => group.name)
    });
  })
};
