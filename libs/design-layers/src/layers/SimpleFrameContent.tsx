import { LayerComponentProps } from '@lidojs/design-core';
import { useEditor, useSelectedLayers } from '@lidojs/design-editor';
import React, { FC, useState, useEffect } from 'react';

export interface SimpleFrameContentProps extends LayerComponentProps {
  scale: number;
}

export const SimpleFrameContent: FC<SimpleFrameContentProps> = ({
  boxSize,
  scale,
  viewOnly,
  layerId,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const { actions, query } = useEditor();
  const { selectedLayerIds } = useSelectedLayers();

  // Get direct access to editor state for more reliable selection checking
  const editorState = useEditor((state) => state);

  // Check if nothing is selected and unlock if needed
  useEffect(() => {
    // Check if selection is effectively empty (nothing or just ROOT)
    const currentSelectedLayers = editorState.selectedLayers[0] || [];
    
    const hasRealSelection = (selectedLayerIds.length === 0 || 
                             (selectedLayerIds.length === 1 && selectedLayerIds[0] === 'ROOT')) &&
                            (currentSelectedLayers.length === 0 || 
                             (currentSelectedLayers.length === 1 && currentSelectedLayers[0] === 'ROOT'));
    
    if (hasRealSelection) {
      // Nothing is selected (or just ROOT), so unlock the frame
      setIsLocked(false);
    } else if ((selectedLayerIds.length === 1 && selectedLayerIds[0] === layerId) || 
               (currentSelectedLayers.length === 1 && currentSelectedLayers[0] === layerId)) {
      // Only the frame itself is selected, so unlock
      setIsLocked(false);
    } else if ((selectedLayerIds.length > 1 && selectedLayerIds.includes(layerId)) ||
               (currentSelectedLayers.length > 1 && currentSelectedLayers.includes(layerId))) {
      // Multiple layers selected including frame, keep it locked
      // Don't change lock state
    }
    // If multiple layers are selected (including frame + contents), keep it locked
  }, [selectedLayerIds, layerId, isLocked, editorState.selectedLayers]);

  // Also add a periodic check to ensure lock state is correct
  useEffect(() => {
    const checkLockState = () => {
      if (selectedLayerIds.length === 0 && isLocked) {
        setIsLocked(false);
      }
    };

    const interval = setInterval(checkLockState, 200);
    return () => clearInterval(interval);
  }, [selectedLayerIds, isLocked]);

  const toggleLock = () => {
    if (!viewOnly) {
      const newLockState = !isLocked;
      setIsLocked(newLockState);
      
      if (newLockState) {
        // When locking: Select the frame and all contents
        lockFrameAndContents();
      } else {
        // When unlocking: Select only the frame
        unlockFrameAndContents();
      }
    }
  };

  const lockFrameAndContents = () => {
    try {
      // Get all layers on the current page
      const allLayers = query.getLayers(0); // Assuming page 0
      if (!allLayers) return;
      
      const frameLayers: string[] = [];
      
      // Get the frame's position (should be 0,0 relative to itself, but let's check)
      const frameLayer = allLayers[layerId];
      if (!frameLayer) return;
      
      const framePos = frameLayer.data.props.position;
      const frameLeft = framePos.x;
      const frameTop = framePos.y;
      const frameRight = frameLeft + boxSize.width;
      const frameBottom = frameTop + boxSize.height;
      
      // Find layers that are inside this frame's boundaries
      Object.entries(allLayers).forEach(([id, layer]) => {
        if (id === layerId || id === 'ROOT') return; // Skip frame itself and root
        
        const layerPos = layer.data.props.position;
        const layerSize = layer.data.props.boxSize;
        
        // Check if layer is inside the frame boundaries
        const layerLeft = layerPos.x;
        const layerTop = layerPos.y;
        const layerRight = layerLeft + layerSize.width;
        const layerBottom = layerTop + layerSize.height;
        
        // Check if layer is completely or partially inside the frame
        if (
          layerLeft < frameRight &&
          layerRight > frameLeft &&
          layerTop < frameBottom &&
          layerBottom > frameTop
        ) {
          frameLayers.push(id);
        }
      });

      // Select the frame and all contents
      const layersToSelect = [layerId, ...frameLayers];
      actions.selectLayers(0, layersToSelect);
      
    } catch (error) {
      console.log('Error selecting frame contents:', error);
    }
  };

  const unlockFrameAndContents = () => {
    try {
      // Select only the frame itself
      actions.selectLayers(0, [layerId]);
    } catch (error) {
      console.log('Error selecting frame only:', error);
    }
  };

  // Calculate icon size based on frame size for better visibility
  const iconSize = Math.max(48, Math.min(boxSize.width, boxSize.height) * 0.08);
  const fontSize = Math.max(16, Math.min(boxSize.width, boxSize.height) * 0.035);

  return (
    <div
      css={{
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: viewOnly ? 'none' : 'auto',
      }}
      style={{
        width: boxSize.width / scale,
        height: boxSize.height / scale,
        transform: `scale(${scale})`,
      }}
    >
      {/* Camera Icon - Top Left (Outside Frame) */}
      <div
        css={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          marginLeft: '-120px',
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid rgba(0, 0, 0, 0.15)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10,
          fontSize: `${fontSize * 1.5}px`,
          ':hover': {
            background: 'rgba(255, 255, 255, 1)',
            transform: 'translateX(-50%) scale(1.1)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        📷
      </div>

      {/* Lock/Unlock Button - Top Right (Outside Frame) */}
      <div
        css={{
          position: 'absolute',
          top: '-60px',
          right: '50%',
          transform: 'translateX(50%)',
          marginRight: '-120px',
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px solid rgba(0, 0, 0, 0.15)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10,
          fontSize: `${fontSize * 1.5}px`,
          ':hover': {
            background: 'rgba(255, 255, 255, 1)',
            transform: 'translateX(50%) scale(1.1)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
        onClick={toggleLock}
      >
        {isLocked ? '🔒' : '🔓'}
      </div>

      {/* Frame Size Display - Bottom Right (Outside Frame) */}
      <div
        css={{
          position: 'absolute',
          bottom: '-60px',
          right: '-60px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          fontFamily: 'monospace',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {Math.round(boxSize.width)} × {Math.round(boxSize.height)}
      </div>

      {/* Main Frame - Clean Red Border */}
      <div
        css={{
          width: '100%',
          height: '100%',
          border: '4px solid #ff0000',
          background: 'rgba(255, 0, 0, 0.02)',
          position: 'relative',
          boxShadow: '0 0 0 2px #ff0000, inset 0 0 0 2px #ff0000',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            border: '2px solid #ff0000',
            background: 'transparent',
            pointerEvents: 'none',
            opacity: 0.8,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '4px',
            left: '4px',
            right: '4px',
            bottom: '4px',
            border: '1px dashed #ff0000',
            background: 'transparent',
            pointerEvents: 'none',
            opacity: 0.9,
          }
        }}
      />
    </div>
  );
}; 