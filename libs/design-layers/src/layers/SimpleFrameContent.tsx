import { LayerComponentProps } from '@lidojs/design-core';
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
  
  // Generate unique color for this frame
  const frameColor = generateUniqueColor(layerId);
  
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

  // Only unlock when user manually clicks the lock button
  // Remove automatic unlocking logic to maintain persistent lock state

  const toggleLock = () => {
    if (!viewOnly) {
      setIsLocked(!isLocked);
    }
  };

  // Calculate icon size based on frame size for better visibility
  const iconSize = Math.max(48, Math.min(boxSize.width, boxSize.height) * 0.08);
  const fontSize = Math.max(16, Math.min(boxSize.width, boxSize.height) * 0.035);

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

             {/* Main Frame - Unique Color Border */}
       <div
         css={{
           width: '100%',
           height: '100%',
           border: `4px solid ${frameColor}`,
           background: `${frameColor}08`, // Very light background with the same color
           position: 'relative',
           boxShadow: `0 0 0 2px ${frameColor}, inset 0 0 0 2px ${frameColor}`,
           cursor: isLocked ? 'move' : 'default',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: '-3px',
             left: '-3px',
             right: '-3px',
             bottom: '-3px',
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
             border: `1px dashed ${frameColor}`,
             background: 'transparent',
             pointerEvents: 'none',
             opacity: 0.9,
           }
                   }}
        />
    </div>
  );
}; 