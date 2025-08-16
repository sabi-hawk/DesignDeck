import { LayerComponentProps } from '@lidojs/design-core';
import React, { FC, useState } from 'react';

export interface SimpleFrameContentProps extends LayerComponentProps {
  scale: number;
}

export const SimpleFrameContent: FC<SimpleFrameContentProps> = ({
  boxSize,
  scale,
  viewOnly,
}) => {
  const [isLocked, setIsLocked] = useState(false);

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
          left: '-60px',
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
            transform: 'scale(1.1)',
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
          right: '-60px',
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
            transform: 'scale(1.1)',
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