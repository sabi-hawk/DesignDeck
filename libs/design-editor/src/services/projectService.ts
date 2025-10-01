import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  canvasData: any;
  thumbnail?: string;
  isPublic: boolean;
  tags: string[];
  lastModified: string;
  createdAt: string;
}

export interface ProjectListResponse {
  success: boolean;
  count: number;
  data: Omit<Project, 'canvasData'>[];
}

export interface SaveCanvasRequest {
  projectId?: string;
  canvasData: any;
  thumbnail?: string;
}

class ProjectService {
  // Get all projects for current user
  async getProjects(): Promise<ProjectListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      return data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }

  // Get single project with full canvas data
  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch project');
      }

      return data.data;
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData: {
    name: string;
    description?: string;
    canvasData: any;
    thumbnail?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      return data.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId: string, projectData: {
    name?: string;
    description?: string;
    canvasData?: any;
    thumbnail?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update project');
      }

      return data.data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  // Save current canvas state
  async saveCanvas(saveData: SaveCanvasRequest): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/save`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(saveData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save canvas');
      }

      return data.data;
    } catch (error) {
      console.error('Save canvas error:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
