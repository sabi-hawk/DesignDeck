import { LayerComponentProps } from '@lidojs/design-core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useEditor, useSelectedLayers } from '@lidojs/design-editor';
import React, { FC, useState, useEffect, useCallback } from 'react';

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
  const [animatedElementIds, setAnimatedElementIds] = useState<Set<string>>(new Set());
  const { actions, query } = useEditor();
  const { selectedLayerIds } = useSelectedLayers();

  // Generate unique color for this frame
  const frameColor = generateUniqueColor(layerId);

  // Get scene number for this frame
  const getSceneNumber = (): number => {
    try {
      const allLayers = query.getLayers(0);
      if (!allLayers) return 1;

      const simpleFrames: { frameId: string; position: { x: number; y: number } }[] = [];

      // Find all SimpleFrames
      Object.entries(allLayers).forEach(([id, layer]) => {
        if ((layer.data.type as any) === 'SimpleFrame' && id !== 'ROOT') {
          const frameProps = layer.data.props;
          if (frameProps.position) {
            simpleFrames.push({
              frameId: id,
              position: frameProps.position
            });
          }
        }
      });

      // Sort frames by position (top to bottom, left to right)
      simpleFrames.sort((a, b) => {
        if (Math.abs(a.position.y - b.position.y) > 50) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

      // Find the index of current frame
      const frameIndex = simpleFrames.findIndex(frame => frame.frameId === layerId);
      return frameIndex >= 0 ? frameIndex + 1 : 1;
    } catch (error) {
      console.log('Error getting scene number:', error);
      return 1;
    }
  };

  const sceneNumber = getSceneNumber();

  // Define callback functions for frame selection logic
  const lockFrameAndContents = useCallback(() => {
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
  }, [layerId, boxSize.width, boxSize.height, query, selectedLayerIds, actions]);

  const lockFrameWithAnimatedElements = useCallback((animatedElements: Set<string>) => {
    try {
      // If no animated elements, just select the frame
      if (animatedElements.size === 0) {
        actions.selectLayers(0, [layerId]);
        return;
      }

      // Select the frame and only the animated elements
      const layersToSelect = [layerId, ...Array.from(animatedElements)];

      // Check if we're already selecting the right combination
      const currentSelected = selectedLayerIds.sort();
      const targetSelected = layersToSelect.sort();

      if (JSON.stringify(currentSelected) !== JSON.stringify(targetSelected)) {
        console.log(`🔒 Selecting frame ${layerId} with animated elements:`, Array.from(animatedElements));
        actions.selectLayers(0, layersToSelect);
      }
    } catch (error) {
      console.log('Error selecting frame with animated elements:', error);
    }
  }, [layerId, selectedLayerIds, actions]);

  const unlockFrameAndContents = useCallback(() => {
    try {
      // Select only the frame itself
      actions.selectLayers(0, [layerId]);
    } catch (error) {
      console.log('Error selecting frame only:', error);
    }
  }, [layerId, actions]);

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

  // Store frame lock state and animated elements in DOM data attributes for useDragLayer access
  useEffect(() => {
    try {
      const element = document.querySelector(`.${layerId}`);
      if (element) {
        // Store lock state
        element.setAttribute('data-frame-locked', isLocked.toString());
        // Store animated element IDs as comma-separated string
        element.setAttribute('data-animated-elements', Array.from(animatedElementIds).join(','));
        console.log(`🔒 Updated frame ${layerId} drag state: locked=${isLocked}, animatedElements=[${Array.from(animatedElementIds).join(',')}]`);
      }
    } catch (error) {
      console.log('Error storing frame drag state:', error);
    }
  }, [layerId, isLocked, animatedElementIds]);

  // Listen for animation events
  useEffect(() => {
    // Handle full frame animation (when entire SimpleFrame is animated)
    const handleFrameAnimationStart = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        console.log(`🔒 Auto-locking entire frame ${layerId} due to full frame animation start`);
        setIsLocked(true);
        // Lock all contents when entire frame is animated
        lockFrameAndContents();
      }
    };

    const handleFrameAnimationStop = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        console.log(`🔓 Auto-unlocking entire frame ${layerId} due to full frame animation stop`);
        setIsLocked(false);
        // Clear all animated elements
        setAnimatedElementIds(new Set());
        // Select only frame
        unlockFrameAndContents();
      }
    };

    // Handle individual element animation (when specific elements inside frame are animated)
    const handleElementAnimationStart = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        const elementId = event.detail.elementId;
        console.log(`🔒 Adding element ${elementId} to animated elements in frame ${layerId}`);
        setAnimatedElementIds(prev => new Set([...prev, elementId]));
        // Select frame + animated elements (but don't change lock button state)
        lockFrameWithAnimatedElements(new Set([...animatedElementIds, elementId]));
      }
    };

    const handleElementAnimationStop = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        const elementId = event.detail.elementId;
        console.log(`🔓 Removing element ${elementId} from animated elements in frame ${layerId}`);
        setAnimatedElementIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(elementId);
          // Update selection to only include remaining animated elements
          lockFrameWithAnimatedElements(newSet);
          return newSet;
        });
      }
    };

    // Listen for animation events
    document.addEventListener('animationStart', handleFrameAnimationStart as EventListener);
    document.addEventListener('animationStop', handleFrameAnimationStop as EventListener);
    document.addEventListener('elementAnimationStart', handleElementAnimationStart as EventListener);
    document.addEventListener('elementAnimationStop', handleElementAnimationStop as EventListener);
    
    return () => {
      document.removeEventListener('animationStart', handleFrameAnimationStart as EventListener);
      document.removeEventListener('animationStop', handleFrameAnimationStop as EventListener);
      document.removeEventListener('elementAnimationStart', handleElementAnimationStart as EventListener);
      document.removeEventListener('elementAnimationStop', handleElementAnimationStop as EventListener);
    };
  }, [layerId, animatedElementIds, lockFrameAndContents, lockFrameWithAnimatedElements, unlockFrameAndContents]);

  // Listen for removeElementsFromState events to remove child elements from editor state
  useEffect(() => {
    const handleRemoveElementsFromState = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        console.log(`🗑️ Removing ${event.detail.elementIds.length} child elements from state for frame ${layerId}:`, event.detail.elementIds);
        
        try {
          // Remove each child element from the editor state
          event.detail.elementIds.forEach((elementId: string) => {
            console.log(`🗑️ Removing element ${elementId} from editor state`);
            actions.deleteLayer(0, elementId);
          });
          
          console.log(`✅ Successfully removed ${event.detail.elementIds.length} child elements from editor state`);
        } catch (error) {
          console.error(`❌ Error removing child elements from editor state:`, error);
        }
      }
    };

    // Listen for removeElementsFromState events
    document.addEventListener('removeElementsFromState', handleRemoveElementsFromState as EventListener);
    
    return () => {
      document.removeEventListener('removeElementsFromState', handleRemoveElementsFromState as EventListener);
    };
  }, [layerId, actions]);

  // Listen for removeFrameFromState events to remove the frame itself from editor state
  useEffect(() => {
    const handleRemoveFrameFromState = (event: CustomEvent) => {
      if (event.detail.frameId === layerId) {
        console.log(`🗑️ Removing frame ${layerId} from editor state`);
        try {
          actions.deleteLayer(0, layerId);
          console.log(`✅ Successfully removed frame ${layerId} from editor state`);
        } catch (error) {
          console.error(`❌ Error removing frame from editor state:`, error);
        }
      }
    };

    document.addEventListener('removeFrameFromState', handleRemoveFrameFromState as EventListener);
    
    return () => {
      document.removeEventListener('removeFrameFromState', handleRemoveFrameFromState as EventListener);
    };
  }, [layerId, actions]);

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
      // If frame is manually locked and only the frame is selected, automatically select all contents
      lockFrameAndContents();
    } else if (
      !isLocked &&
      animatedElementIds.size > 0 &&
      selectedLayerIds.includes(layerId) &&
      selectedLayerIds.length === 1
    ) {
      // If frame has animated elements but is not manually locked, select frame + animated elements
      lockFrameWithAnimatedElements(animatedElementIds);
    }
  }, [selectedLayerIds, layerId, isLocked, animatedElementIds, lockFrameAndContents, lockFrameWithAnimatedElements]);

  // Handle click on frame to ensure proper selection
  const handleFrameClick = (e: React.MouseEvent) => {
    if (isLocked) {
      // If frame is manually locked, ensure all contents are selected when clicked
      lockFrameAndContents();
    } else if (animatedElementIds.size > 0) {
      // If frame has animated elements but is not manually locked, select frame + animated elements
      lockFrameWithAnimatedElements(animatedElementIds);
    }
  };

  // Handle mouse down to ensure proper selection before drag starts
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) {
      // If frame is manually locked, ensure all contents are selected before any drag operation
      lockFrameAndContents();
    } else if (animatedElementIds.size > 0) {
      // If frame has animated elements but is not manually locked, select frame + animated elements
      lockFrameWithAnimatedElements(animatedElementIds);
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
      {/* Scene Label - Top Left Corner */}
      <div
        css={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: `${fontSize * 0.8}px`,
          fontWeight: 600,
          fontFamily: 'monospace',
          border: `2px solid ${frameColor}`,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      >
        Scene {sceneNumber}
      </div>

      {/* Lock/Unlock Button - Centered Top (Outside Frame) */}
      <div
        css={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
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
        onClick={toggleLock}
      >
        {isLocked ? '🔒' : '🔓'}
      </div>

      {/* Frame Size Display - Bottom Right (Outside Frame) - Hidden for now */}
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
          display: 'none', // Hidden for now, can be re-enabled later
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
