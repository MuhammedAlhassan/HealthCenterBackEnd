import asyncHandler from 'express-async-handler';
import voiceAnalysis from '../models/voiceAnalysis.js';
import { analyzeWithNLP } from '../services/nlpService.js';

// @desc    Analyze voice symptoms
// @route   POST /api/voice/analyze
// @access  Private
const analyzeVoiceSymptoms = asyncHandler(async (req, res) => {
  const { transcript, sessionId, language } = req.body;
  const userId = req.user._id;

  if (!transcript || transcript.trim().length < 10) {
    res.status(400);
    throw new Error('Please provide a detailed symptom description (at least 10 characters)');
  }

  try {
    // Analyze the transcript using NLP service
    const analysis = await analyzeWithNLP(transcript);

    // Save the analysis to database
    const voiceAnalysis = await voiceAnalysis.create({
      userId,
      transcript,
      analysis,
      sessionId,
      language: language || 'en-US'
    });

    res.status(201).json(voiceAnalysis);
  } catch (error) {
    console.error('Voice analysis error:', error);
    res.status(500);
    throw new Error('Failed to analyze symptoms. Please try again.');
  }
});

// @desc    Get user's voice analysis history
// @route   GET /api/voice/history
// @access  Private
const getVoiceAnalysisHistory = asyncHandler(async (req, res) => {
  const analyses = await VoiceAnalysis.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('createdAt analysis.severity analysis.possibleConditions');

  res.json(analyses);
});

// @desc    Get specific voice analysis by ID
// @route   GET /api/voice/:id
// @access  Private
const getVoiceAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await VoiceAnalysis.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  res.json(analysis);
});

export {
  analyzeVoiceSymptoms,
  getVoiceAnalysisHistory,
  getVoiceAnalysisById
};