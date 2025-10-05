import { useEditor } from '@lidojs/design-editor';
import React from 'react';
import { useProgress } from '../../contexts/ProgressContext';

interface SaveProgressButtonProps {
  onSave?: (project: any) => void;
}

const SaveProgressButton: React.FC<SaveProgressButtonProps> = ({ onSave }) => {
  const { query } = useEditor();
  const state = useEditor((state) => state);
  const { saveProgress, isSaving, currentProject } = useProgress();

  const handleSave = async () => {
    try {
      // Manual extraction of only the data we need (avoiding circular references)
      const cleanState = {
        selectedLayers: state.selectedLayers,
        hoveredLayer: state.hoveredLayer,
        openMenu: state.openMenu,
        scale: state.scale,
        activePage: state.activePage,
        animatedLayers: state.animatedLayers,
        controlBox: state.controlBox,
        dragData: state.dragData,
        dragNDrop: state.dragNDrop,
        fontList: state.fontList,
        guideline: state.guideline,
        pages: state.pages ? state.pages.map((page: any) => ({
          ...page,
          layers: page.layers ? Object.fromEntries(
            Object.entries(page.layers).map(([layerId, layer]: [string, any]) => [
              layerId,
              {
                ...layer,
                // Remove comp property to avoid circular references
                comp: undefined,
                // Also remove comp and editor from data property
                data: layer.data ? {
                  ...layer.data,
                  comp: undefined,
                  editor: undefined
                } : layer.data
              }
            ])
          ) : {}
        })) : [],
        resizeData: state.resizeData,
        rotateData: state.rotateData,
        selectData: state.selectData,
        sidebar: state.sidebar,
      };
      
      console.log('🔄 Saving cleaned state with project ID:', currentProject?._id);
      console.log('📊 Cleaned state to save:', cleanState);
      
      const result = await saveProgress(cleanState, currentProject?._id);
      if (result.success && result.project) {
        console.log('✅ Save successful, project:', result.project);
        onSave?.(result.project);
      }
    } catch (error) {
      console.error('❌ Error serializing state:', error);
    }
  };

  return (
    <button
      disabled={isSaving}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: isSaving 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: isSaving ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSaving 
          ? 'none' 
          : '0 4px 12px rgba(16, 185, 129, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={handleSave}
      onMouseEnter={(e) => {
        if (!isSaving) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSaving) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        }
      }}
    >
      {isSaving ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-2.293-2.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          <span>Save</span>
        </>
      )}
    </button>
  );
};

export default SaveProgressButton;