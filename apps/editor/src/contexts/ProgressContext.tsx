import axios from 'axios';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';

// API URL - uses environment variable for production, falls back to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Project {
  _id: string;
  name: string;
  description?: string;
  canvasData: any;
  animationState?: any;
  thumbnail?: string;
  isPublic: boolean;
  tags: string[];
  lastModified: string;
  createdAt: string;
}

interface ProgressContextType {
  currentProject: Project | null;
  isSaving: boolean;
  isLoading: boolean;
  hasLoadedInitial: boolean;
  saveProgress: (editorState: any, animationState: any, projectId?: string, projectName?: string) => Promise<{ success: boolean; message: string; project?: Project }>;
  loadLatestProject: () => Promise<{ success: boolean; project?: Project }>;
  loadProject: (projectId: string) => Promise<{ success: boolean; project?: Project }>;
  clearCurrentProject: () => void;
  resetLoadState: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const { showToast } = useToast();

  const saveProgress = useCallback(async (editorState: any, animationState: any, projectId?: string, projectName?: string) => {
    try {
      setIsSaving(true);
      
      console.log('💾 Saving complete editor state:', editorState);
      console.log('🎬 Saving animation state:', animationState);
      
      const payload: any = {
        editorState, // Send complete editor state
        animationState, // Send animation state
        thumbnail: '', // You can generate a thumbnail from canvas data
      };

      if (projectId) {
        payload.projectId = projectId;
      }

      if (projectName) {
        payload.name = projectName;
      }

      const response = await axios.post(`${API_BASE_URL}/api/projects/save`, payload);
      
      if (response.data.success) {
        const project = response.data.data;
        setCurrentProject(project);
        showToast({
          type: 'success',
          title: 'Progress Saved!',
          message: `Your design has been saved${projectId ? '' : ' as a new project'}.`,
        });
        return { success: true, message: 'Progress saved successfully', project };
      } else {
        showToast({
          type: 'error',
          title: 'Save Failed',
          message: response.data.message || 'Failed to save progress',
        });
        return { success: false, message: response.data.message || 'Failed to save progress' };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save progress';
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: message,
      });
      return { success: false, message };
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const loadLatestProject = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading || hasLoadedInitial) {
      return { success: false };
    }

    try {
      setIsLoading(true);
      console.log('🔄 Loading latest project...');
      const response = await axios.get(`${API_BASE_URL}/api/projects/latest`);
      
      if (response.data.success) {
        const project = response.data.data;
        setCurrentProject(project);
        setHasLoadedInitial(true);
        console.log('✅ Project loaded successfully:', project.name);
        showToast({
          type: 'info',
          title: 'Project Loaded',
          message: `Loaded your latest project: ${project.name}`,
        });
        return { success: true, project };
      } else {
        setHasLoadedInitial(true);
        console.log('ℹ️ No projects found');
        return { success: false };
      }
    } catch (error: any) {
      setHasLoadedInitial(true);
      console.error('❌ Error loading latest project:', error);
      
      // Don't show error toast for "no projects found" - this is normal for new users
      if (error.response?.status !== 404) {
        showToast({
          type: 'error',
          title: 'Load Failed',
          message: 'Failed to load latest project',
        });
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [showToast, isLoading, hasLoadedInitial]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}`);
      
      if (response.data.success) {
        const project = response.data.data;
        setCurrentProject(project);
        showToast({
          type: 'info',
          title: 'Project Loaded',
          message: `Loaded project: ${project.name}`,
        });
        return { success: true, project };
      } else {
        showToast({
          type: 'error',
          title: 'Load Failed',
          message: response.data.message || 'Failed to load project',
        });
        return { success: false };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load project';
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: message,
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const clearCurrentProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  const resetLoadState = useCallback(() => {
    setHasLoadedInitial(false);
    console.log('🔄 Reset load state - ready to load project on login');
  }, []);

  const value: ProgressContextType = {
    currentProject,
    isSaving,
    isLoading,
    hasLoadedInitial,
    saveProgress,
    loadLatestProject,
    loadProject,
    clearCurrentProject,
    resetLoadState,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
