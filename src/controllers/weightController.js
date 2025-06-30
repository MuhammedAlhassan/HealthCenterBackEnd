import asyncHandler from 'express-async-handler';
import weightEntry from '../models/weightEntry.js';
import WeightGoal from '../models/WeightGoal.js';

// @desc    Create new weight entry
// @route   POST /api/weight
// @access  Private
const createWeightEntry = asyncHandler(async (req, res) => {
  const { weight, unit, pregnancyWeek, notes } = req.body;

  // Convert lbs to kg for consistent storage
  const weightInKg = unit === 'lbs' ? weight * 0.453592 : weight;

  const entry = await WeightEntry.create({
    userId: req.user._id,
    weight: weightInKg,
    unit,
    pregnancyWeek,
    notes
  });

  res.status(201).json({
    _id: entry._id,
    weight: unit === 'lbs' ? weightInKg * 2.20462 : weightInKg,
    unit,
    pregnancyWeek,
    date: entry.date,
    notes: entry.notes
  });
});

// @desc    Get user's weight entries
// @route   GET /api/weight
// @access  Private
const getWeightEntries = asyncHandler(async (req, res) => {
  const { unit = 'kg', limit } = req.query;
  
  const query = weightEntry.find({ userId: req.user._id })
    .sort({ date: -1 });

  if (limit) {
    query.limit(parseInt(limit));
  }

  const entries = await query;

  // Convert units if requested
  const convertedEntries = entries.map(entry => ({
    ...entry.toObject(),
    weight: unit === 'lbs' ? entry.weight * 2.20462 : entry.weight,
    unit
  }));

  res.json(convertedEntries);
});

// @desc    Delete weight entry
// @route   DELETE /api/weight/:id
// @access  Private
const deleteWeightEntry = asyncHandler(async (req, res) => {
  const entry = await weightEntry.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!entry) {
    res.status(404);
    throw new Error('Weight entry not found');
  }

  res.json({ message: 'Weight entry removed' });
});

// @desc    Get user's weight goal
// @route   GET /api/weight/goal
// @access  Private
const getWeightGoal = asyncHandler(async (req, res) => {
  const { unit = 'kg' } = req.query;
  
  const goal = await WeightGoal.findOne({ userId: req.user._id });

  if (!goal) {
    return res.json(null);
  }

  // Convert units if requested
  const convertedGoal = {
    ...goal.toObject(),
    targetWeight: unit === 'lbs' ? goal.targetWeight * 2.20462 : goal.targetWeight,
    startWeight: unit === 'lbs' ? goal.startWeight * 2.20462 : goal.startWeight,
    unit
  };

  res.json(convertedGoal);
});

// @desc    Set weight goal
// @route   POST /api/weight/goal
// @access  Private
const setWeightGoal = asyncHandler(async (req, res) => {
  const { targetWeight, unit, startWeight, pregnancyWeek } = req.body;

  // Convert to kg for consistent storage
  const targetWeightInKg = unit === 'lbs' ? targetWeight * 0.453592 : targetWeight;
  const startWeightInKg = unit === 'lbs' ? startWeight * 0.453592 : startWeight;

  const goal = await WeightGoal.findOneAndUpdate(
    { userId: req.user._id },
    {
      targetWeight: targetWeightInKg,
      unit,
      startWeight: startWeightInKg,
      pregnancyWeek: pregnancyWeek || 1,
      isActive: true
    },
    { upsert: true, new: true }
  );

  res.json({
    ...goal.toObject(),
    targetWeight: unit === 'lbs' ? goal.targetWeight * 2.20462 : goal.targetWeight,
    startWeight: unit === 'lbs' ? goal.startWeight * 2.20462 : goal.startWeight,
    unit
  });
});

// @desc    Get weight progress data
// @route   GET /api/weight/progress
// @access  Private
const getWeightProgress = asyncHandler(async (req, res) => {
  const { unit = 'kg' } = req.query;
  
  // Get all entries sorted by date
  const entries = await weightEntry.find({ userId: req.user._id })
    .sort({ date: 1 });

  // Get current goal
  const goal = await WeightGoal.findOne({ userId: req.user._id });

  // Convert units if needed
  const convertedEntries = entries.map(entry => ({
    date: entry.date,
    week: entry.pregnancyWeek,
    weight: unit === 'lbs' ? entry.weight * 2.20462 : entry.weight,
    unit
  }));

  let convertedGoal = null;
  if (goal) {
    convertedGoal = {
      targetWeight: unit === 'lbs' ? goal.targetWeight * 2.20462 : goal.targetWeight,
      startWeight: unit === 'lbs' ? goal.startWeight * 2.20462 : goal.startWeight,
      unit
    };
  }

  // Calculate BMI if height is provided in user profile
  let bmi = null;
  if (req.user.height) {
    const latestWeight = entries.length > 0 ? 
      (unit === 'lbs' ? entries[entries.length - 1].weight * 0.453592 : entries[entries.length - 1].weight) : 
      null;
    
    if (latestWeight) {
      const heightInMeters = req.user.height / 100; // assuming height is in cm
      bmi = (latestWeight / (heightInMeters * heightInMeters)).toFixed(1);
    }
  }

  res.json({
    entries: convertedEntries,
    goal: convertedGoal,
    bmi,
    recommendations: generateRecommendations(convertedEntries, convertedGoal, bmi)
  });
});

// Helper function to generate recommendations
const generateRecommendations = (entries, goal, bmi) => {
  const recommendations = [];
  
  if (!entries || entries.length === 0) {
    return recommendations;
  }

  const currentWeight = entries[entries.length - 1].weight;
  const currentWeek = entries[entries.length - 1].week;

  // BMI-based recommendations
  if (bmi) {
    if (bmi < 18.5) {
      recommendations.push({
        type: 'info',
        message: 'Based on your BMI, recommended weight gain is 12.5-18 kg (28-40 lbs) during pregnancy'
      });
    } else if (bmi >= 18.5 && bmi < 25) {
      recommendations.push({
        type: 'info',
        message: 'Based on your BMI, recommended weight gain is 11.5-16 kg (25-35 lbs) during pregnancy'
      });
    } else if (bmi >= 25 && bmi < 30) {
      recommendations.push({
        type: 'info',
        message: 'Based on your BMI, recommended weight gain is 7-11.5 kg (15-25 lbs) during pregnancy'
      });
    } else if (bmi >= 30) {
      recommendations.push({
        type: 'info',
        message: 'Based on your BMI, recommended weight gain is 5-9 kg (11-20 lbs) during pregnancy'
      });
    }
  }

  // Goal progress
  if (goal) {
    const progress = ((currentWeight - goal.startWeight) / (goal.targetWeight - goal.startWeight)) * 100;
    
    if (progress > 110) {
      recommendations.push({
        type: 'warning',
        message: `You're gaining weight faster than recommended. Consider discussing with your healthcare provider.`
      });
    } else if (progress < 90 && currentWeek > 20) {
      recommendations.push({
        type: 'warning',
        message: `You're gaining weight slower than recommended. Make sure you're getting proper nutrition.`
      });
    }
  }

  // Weekly gain analysis
  if (entries.length > 1) {
    const weeklyGains = [];
    for (let i = 1; i < entries.length; i++) {
      const weekDiff = entries[i].week - entries[i-1].week;
      if (weekDiff > 0) {
        const weightDiff = entries[i].weight - entries[i-1].weight;
        weeklyGains.push(weightDiff / weekDiff);
      }
    }

    if (weeklyGains.length > 0) {
      const avgWeeklyGain = weeklyGains.reduce((a, b) => a + b, 0) / weeklyGains.length;
      
      if (avgWeeklyGain > 0.5 && currentWeek < 20) {
        recommendations.push({
          type: 'notice',
          message: 'Your average weekly weight gain is higher than typical for this pregnancy stage'
        });
      }
    }
  }

  return recommendations;
};

export {
  createWeightEntry,
  getWeightEntries,
  deleteWeightEntry,
  getWeightGoal,
  setWeightGoal,
  getWeightProgress
};