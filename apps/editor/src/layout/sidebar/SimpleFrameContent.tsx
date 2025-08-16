import XIcon from '@duyank/icons/regular/X';
import { useEditor } from '@lidojs/design-editor';
import React, { FC } from 'react';
import { isMobile } from 'react-device-detect';

const SimpleFrameContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { actions } = useEditor((state) => ({
    dragNDrop: state.dragNDrop,
  }));

  const addSimpleFrame = () => {
    actions.addSimpleFrameLayer();
    if (isMobile) {
      onClose();
    }
  };

  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        overflowY: 'auto',
        display: 'flex',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          height: 48,
          borderBottom: '1px solid rgba(57,76,96,.15)',
          padding: '0 20px',
        }}
      >
        <p
          css={{
            lineHeight: '48px',
            fontWeight: 600,
            color: '#181C32',
            flexGrow: 1,
            textAlign: 'center',
          }}
        >
          Advanced Frame
        </p>
        
        {/* Close button */}
        <div
          css={{
            fontSize: 20,
            flexShrink: 0,
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px',
          }}
          onClick={onClose}
        >
          <XIcon />
        </div>
      </div>
      <div
        css={{
          padding: '20px',
          flexGrow: 1,
        }}
      >
        <div
          css={{
            background: 'rgba(64,87,109,.07)',
            border: '1px solid rgba(64,87,109,.15)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            cursor: 'pointer',
            ':hover': {
              background: 'rgba(64,87,109,.1)',
            },
          }}
          onClick={addSimpleFrame}
        >
          <div
            css={{
              width: '100%',
              height: 120,
              background: 'rgba(255, 0, 0, 0.1)',
              border: '2px solid #ff0000',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <div
              css={{
                fontSize: 24,
                color: '#ff0000',
                fontWeight: 600,
              }}
            >
              📷
            </div>
          </div>
          <div
            css={{
              fontSize: 14,
              fontWeight: 600,
              color: '#0d1216',
              marginBottom: 8,
            }}
          >
            Advanced Frame
          </div>
          <div
            css={{
              fontSize: 12,
              color: '#4a5568',
              lineHeight: 1.5,
            }}
          >
            A sophisticated content organization system with intelligent grouping capabilities. Features include:
          </div>
          <div
            css={{
              fontSize: 11,
              color: '#667eea',
              fontWeight: 600,
              marginTop: 8,
              textAlign: 'center',
              background: 'rgba(102, 126, 234, 0.1)',
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            Default: 4000 × 2250 (16:9)
          </div>
        </div>

        <div
          css={{
            background: 'rgba(64,87,109,.05)',
            border: '1px solid rgba(64,87,109,.1)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            css={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0d1216',
              marginBottom: 8,
            }}
          >
            🔒 Intelligent Grouping System
          </div>
          <div
            css={{
              fontSize: 12,
              color: '#4a5568',
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            Advanced content management with smart grouping technology. Lock the frame to create unified content groups that move as cohesive units, or unlock for granular control over individual elements.
          </div>
        </div>

        <div
          css={{
            background: 'rgba(64,87,109,.05)',
            border: '1px solid rgba(64,87,109,.1)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            css={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0d1216',
              marginBottom: 8,
            }}
          >
            📷 Advanced Capture System
          </div>
          <div
            css={{
              fontSize: 12,
              color: '#4a5568',
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            Integrated capture technology positioned at the top-left for future advanced recording, screen capture, and content preservation features.
          </div>
        </div>

        <div
          css={{
            background: 'rgba(64,87,109,.05)',
            border: '1px solid rgba(64,87,109,.1)',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            css={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0d1216',
              marginBottom: 8,
            }}
          >
            📏 Real-Time Metrics Display
          </div>
          <div
            css={{
              fontSize: 12,
              color: '#4a5568',
              lineHeight: 1.5,
            }}
          >
            Dynamic dimension monitoring system providing real-time pixel-perfect measurements at the bottom-right corner. Updates instantaneously during frame manipulation operations.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleFrameContent; 