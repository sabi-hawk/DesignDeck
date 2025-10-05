const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ lastModified: -1 })
      .select('-canvasData'); // Don't send full canvas data in list

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting projects'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting project'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, canvasData, thumbnail, isPublic, tags } = req.body;

    const project = await Project.create({
      userId: req.user.id,
      name,
      description,
      canvasData,
      thumbnail,
      isPublic,
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, canvasData, thumbnail, isPublic, tags } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        name,
        description,
        canvasData,
        thumbnail,
        isPublic,
        tags: tags || [],
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
};

// @desc    Get latest project for user (for auto-loading)
// @route   GET /api/projects/latest
// @access  Private
exports.getLatestProject = async (req, res) => {
  try {
    const project = await Project.findOne({ userId: req.user.id })
      .sort({ lastModified: -1 })
      .limit(1);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'No projects found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get latest project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting latest project'
    });
  }
};

// @desc    Save current canvas state
// @route   POST /api/projects/save
// @access  Private
exports.saveCanvas = async (req, res) => {
  try {
    const { projectId, editorState, canvasData, thumbnail } = req.body;
    
    // Use editorState if available, otherwise fall back to canvasData
    const dataToSave = editorState || canvasData;
    
    console.log('💾 Saving data for user:', req.user.id);
    console.log('📊 Data type:', editorState ? 'editorState' : 'canvasData');
    console.log('📦 Data preview:', dataToSave ? 'Available' : 'Missing');

    if (projectId) {
      // Update existing project
      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId: req.user.id },
        {
          canvasData: dataToSave, // Store the data as canvasData
          thumbnail,
          lastModified: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Canvas saved successfully',
        data: project
      });
    } else {
      // Create new project with simple default name
      const project = await Project.create({
        userId: req.user.id,
        name: `My Design Project`,
        canvasData: dataToSave, // Store the data as canvasData
        thumbnail,
        isPublic: false
      });

      res.status(201).json({
        success: true,
        message: 'Canvas saved as new project',
        data: project
      });
    }
  } catch (error) {
    console.error('Save canvas error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving canvas'
    });
  }
};
