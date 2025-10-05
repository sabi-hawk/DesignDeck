const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  saveCanvas,
  getLatestProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', getProjects);

// @route   GET /api/projects/latest
// @desc    Get latest project for user
// @access  Private
router.get('/latest', getLatestProject);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', getProject);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('canvasData')
    .notEmpty()
    .withMessage('Canvas data is required')
], createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('canvasData')
    .optional()
    .notEmpty()
    .withMessage('Canvas data cannot be empty')
], updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', deleteProject);

// @route   POST /api/projects/save
// @desc    Save current canvas state
// @access  Private
router.post('/save', [
  body('canvasData')
    .notEmpty()
    .withMessage('Canvas data is required')
], saveCanvas);

module.exports = router;
