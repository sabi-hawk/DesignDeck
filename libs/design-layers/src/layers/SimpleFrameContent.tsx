import { LayerComponentProps } from '@lidojs/design-core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useEditor, useSelectedLayers } from '@lidojs/design-editor';
import React, { FC, useState, useEffect } from 'react';

export interface SimpleFrameContentProps extends LayerComponentProps {
  scale: number;
}

// Generate a unique color based on the layerId
const generateUniqueColor = (layerId: string): string => {
  // Use the layerId to generate a consistent but unique color
  let hash = 0;
  for (let i = 0; i < layerId.length; i++) {
    const char = layerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate hue, saturation, and lightness values
  const hue = Math.abs(hash) % 360; // 0-359 degrees
  const saturation = 60 + (Math.abs(hash) % 40); // 60-99%
  const lightness = 45 + (Math.abs(hash) % 20); // 45-64%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const SimpleFrameContent: FC<SimpleFrameContentProps> = ({
  boxSize,
  scale,
  viewOnly,
  layerId,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const { actions, query } = useEditor();
  const { selectedLayerIds } = useSelectedLayers();

  // Generate unique color for this frame
  const frameColor = generateUniqueColor(layerId);
  // Get direct access to editor state for more reliable selection checking
  const editorState = useEditor((state) => state);

  // Store the color in the DOM element's data attribute when component mounts
  useEffect(() => {
    try {
      // Store the color as a data attribute on the DOM element
      const element = document.querySelector(`.${layerId}`);
      if (element) {
        element.setAttribute('data-frame-color', frameColor);
        console.log(`🎨 Stored frame color for ${layerId}: ${frameColor}`);
      }
    } catch (error) {
      console.log('Error storing frame color:', error);
    }
  }, [layerId, frameColor]);

  // Listen for animation start events to auto-lock the frame
  useEffect(() => {
    const handleAnimationStart = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        console.log(`🔒 Auto-locking frame ${layerId} due to animation start`);
        setIsLocked(true);
        // Also trigger the lock behavior to select frame and contents
        lockFrameAndContents();
      }
    };

    const handleAnimationStop = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        console.log(`🔓 Auto-unlocking frame ${layerId} due to animation stop`);
        setIsLocked(false);
        // Also trigger the unlock behavior to select only frame
        unlockFrameAndContents();
      }
    };

    // Listen for custom animation events
    document.addEventListener('animationStart', handleAnimationStart as EventListener);
    document.addEventListener('animationStop', handleAnimationStop as EventListener);
    
    return () => {
      document.removeEventListener('animationStart', handleAnimationStart as EventListener);
      document.removeEventListener('animationStop', handleAnimationStop as EventListener);
    };
  }, [layerId]);

  // Only unlock when user manually clicks the lock button
  // Remove automatic unlocking logic to maintain persistent lock state

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

  // Add effect to maintain lock behavior when frame is selected
  useEffect(() => {
    if (
      isLocked &&
      selectedLayerIds.includes(layerId) &&
      selectedLayerIds.length === 1
    ) {
      // If frame is locked and only the frame is selected, automatically select contents too
      lockFrameAndContents();
    }
  }, [selectedLayerIds, layerId, isLocked]);

  // Handle click on frame to ensure contents are selected when locked
  const handleFrameClick = (e: React.MouseEvent) => {
    if (isLocked) {
      // If frame is locked, ensure contents are selected when clicked
      // Don't stop propagation - let the selection system work
      lockFrameAndContents();
    }
  };

  // Handle mouse down to ensure contents are selected before drag starts
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) {
      // If frame is locked, ensure contents are selected before any drag operation
      // Make selection happen immediately in the same event cycle
      lockFrameAndContents();
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

      // Check if we're already selecting the right combination
      const currentSelected = selectedLayerIds.sort();
      const targetSelected = layersToSelect.sort();

      if (JSON.stringify(currentSelected) !== JSON.stringify(targetSelected)) {
        actions.selectLayers(0, layersToSelect);
      }
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
  const fontSize = Math.max(
    16,
    Math.min(boxSize.width, boxSize.height) * 0.035
  );

  return (
    <div
      className={layerId}
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
      onClick={handleFrameClick}
      onMouseDown={handleMouseDown}
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
          // border: '4px solid #ff0000',
          // background: 'rgba(255, 0, 0, 0.02)',
          border: `4px solid ${frameColor}`,
          background: `${frameColor}08`, // Very light background with the same color
          position: 'relative',
          // boxShadow: '0 0 0 2px #ff0000, inset 0 0 0 2px #ff0000',
          boxShadow: `0 0 0 2px ${frameColor}, inset 0 0 0 2px ${frameColor}`,
          cursor: isLocked ? 'move' : 'default',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            // border: '2px solid #ff0000',
            border: `2px solid ${frameColor}`,
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
            // border: '1px dashed #ff0000',
            border: `1px dashed ${frameColor}`,
            background: 'transparent',
            pointerEvents: 'none',
            opacity: 0.9,
          },
        }}
        onClick={handleFrameClick}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
