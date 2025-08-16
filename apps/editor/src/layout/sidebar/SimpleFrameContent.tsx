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
          SimpleFrame
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
          flexDirection: 'column',
          overflowY: 'auto',
          display: 'flex',
          padding: '16px',
        }}
      >
        <div
          css={{
            cursor: 'pointer',
            border: '2px dotted #ff0000',
            background: 'transparent',
            width: '100%',
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            marginBottom: '16px',
            ':hover': {
              background: 'rgba(255, 0, 0, 0.05)',
            },
          }}
          onClick={addSimpleFrame}
        >
          <div
            css={{
              textAlign: 'center',
              color: '#ff0000',
              fontWeight: 600,
            }}
          >
            <div css={{ fontSize: '16px', marginBottom: '8px' }}>
              Simple Frame
            </div>
            <div css={{ fontSize: '12px', opacity: 0.7 }}>
              4000 × 2250 (16:9)
            </div>
          </div>
        </div>
        
        <div
          css={{
            padding: '16px',
            background: 'rgba(64,87,109,.07)',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#0d1216',
          }}
        >
          <div css={{ fontWeight: 600, marginBottom: '8px' }}>
            About SimpleFrame:
          </div>
          <ul css={{ margin: 0, paddingLeft: '16px' }}>
            <li>Transparent rectangle with red dotted border</li>
            <li>16:9 aspect ratio (1920×1080)</li>
            <li>Can be dragged and resized</li>
            <li>Maintains aspect ratio when resizing</li>
            <li>Perfect for content organization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleFrameContent; 