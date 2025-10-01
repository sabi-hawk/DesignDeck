import React, { useState } from 'react';
import { css } from '@emotion/react';
import { projectService } from '../services/projectService';

interface SaveButtonProps {
  onSave: (projectId?: string) => void;
  onLoad: (projectId: string) => void;
  currentProjectId?: string;
  canvasData: any;
}

const buttonStyles = css`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #5a67d8;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const dropdownStyles = css`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
`;

const dropdownItemStyles = css`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f7fafc;
  font-size: 0.875rem;
  color: #4a5568;
  
  &:hover {
    background: #f7fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const containerStyles = css`
  position: relative;
  display: inline-block;
`;

const loadingStyles = css`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const SaveButton: React.FC<SaveButtonProps> = ({ 
  onSave, 
  onLoad, 
  currentProjectId, 
  canvasData 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await projectService.saveCanvas({
        projectId: currentProjectId,
        canvasData,
        thumbnail: '' // You can generate a thumbnail here
      });
      
      onSave(result._id);
      setShowDropdown(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAs = async () => {
    const name = prompt('Enter project name:');
    if (!name) return;

    setLoading(true);
    try {
      const result = await projectService.createProject({
        name,
        canvasData,
        thumbnail: ''
      });
      
      onSave(result._id);
      setShowDropdown(false);
    } catch (error) {
      console.error('Save as error:', error);
      alert('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProjects = async () => {
    try {
      const response = await projectService.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Load projects error:', error);
      alert('Failed to load projects');
    }
  };

  const handleLoadProject = (projectId: string) => {
    onLoad(projectId);
    setShowDropdown(false);
  };

  return (
    <div css={containerStyles}>
      <button 
        css={buttonStyles} 
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
      >
        {loading ? (
          <div css={loadingStyles} />
        ) : (
          '💾'
        )}
        {currentProjectId ? 'Save' : 'Save Project'}
      </button>
      
      {showDropdown && (
        <div css={dropdownStyles}>
          <div css={dropdownItemStyles} onClick={handleSave}>
            {currentProjectId ? 'Save Changes' : 'Save Project'}
          </div>
          <div css={dropdownItemStyles} onClick={handleSaveAs}>
            Save As New Project
          </div>
          <div 
            css={dropdownItemStyles} 
            onClick={handleLoadProjects}
          >
            Load Project
          </div>
          {projects.length > 0 && (
            <>
              <div css={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
              {projects.map(project => (
                <div 
                  key={project._id}
                  css={dropdownItemStyles}
                  onClick={() => handleLoadProject(project._id)}
                >
                  {project.name}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
