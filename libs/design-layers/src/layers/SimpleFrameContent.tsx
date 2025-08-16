import {
  LayerComponentProps,
} from '@lidojs/design-core';
import React, { FC } from 'react';

export interface SimpleFrameContentProps extends LayerComponentProps {
  scale: number;
}

export const SimpleFrameContent: FC<SimpleFrameContentProps> = ({
  boxSize,
  scale,
  viewOnly,
}) => {
  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        border: '4px solid #ff0000',
        background: 'rgba(255, 0, 0, 0.02)',
        pointerEvents: viewOnly ? 'none' : 'auto',
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
      style={{
        width: boxSize.width / scale,
        height: boxSize.height / scale,
        transform: `scale(${scale})`,
      }}
    />
  );
}; 