import Article from '../models/Article.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all articles
// @route   GET /api/v1/articles
// @access  Public
export const getArticles = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) query.category = category;

    const articles = await Article.find(query).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single article
// @route   GET /api/v1/articles/:id
// @access  Public
export const getArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create article (Admin only)
// @route   POST /api/v1/articles
// @access  Private/Admin
export const createArticle = async (req, res, next) => {
  try {
    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update article (Admin only)
// @route   PUT /api/v1/articles/:id
// @access  Private/Admin
export const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!article) {
      return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete article (Admin only)
// @route   DELETE /api/v1/articles/:id
// @access  Private/Admin
export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return next(new ErrorResponse(`Article not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};