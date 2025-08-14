import XIcon from '@duyank/icons/regular/X';
import { LayerId, SerializedLayers } from '@lidojs/design-core';
import { useEditor } from '@lidojs/design-editor';
import React, { FC } from 'react';
import { isMobile } from 'react-device-detect';
import {
  addABodyText,
  addAHeading,
  addASubheading,
} from '../../constant/text-effects';

const TextContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { actions } = useEditor();

  const handleAddText = (data: {
    rootId: LayerId;
    layers: SerializedLayers;
  }) => {
    actions.addTextLayer(data);
    if (isMobile) {
      onClose();
    }
  };

  const handleDrag = (
    event: React.DragEvent,
    data: { rootId: LayerId; layers: SerializedLayers }
  ) => {
    const { clientX, clientY } = event;
    actions.startDragNDrop({ layer: 'Text', data }, { x: clientX, y: clientY });
    event.dataTransfer.clearData('text/plain');
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ layer: 'Text', data })
    );
    event.dataTransfer.setDragImage(new Image(), 0, 0);
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
          }}
        >
          Text
        </p>
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
          }}
          onClick={onClose}
        >
          <XIcon />
        </div>
      </div>
      <div
        css={{ flexDirection: 'column', overflowY: 'auto', display: 'flex' }}
      >
        <div
          css={{
            padding: 16,
            display: 'flex',
            gap: 8,
            flexDirection: 'column',
          }}
        >
          <div
            css={{
              fontSize: 28,
              lineHeight: 1,
              padding: '16px 16px',
              fontWeight: 700,
              background: '#EBECF0',
              borderRadius: 4,
              cursor: 'pointer',
              '-webkit-user-drag': 'element',
            }}
            draggable={true}
            onClick={() => handleAddText(addAHeading)}
            onDragStart={(e) => handleDrag(e, addAHeading)}
          >
            Add a heading
          </div>
          <div
            css={{
              fontSize: 18,
              lineHeight: 1,
              padding: '16px',
              fontWeight: 700,
              background: '#EBECF0',
              borderRadius: 4,
              cursor: 'pointer',
              '-webkit-user-drag': 'element',
            }}
            onClick={() => handleAddText(addASubheading)}
            onDragStart={(e) => handleDrag(e, addASubheading)}
          >
            Add a subheading
          </div>
          <div
            css={{
              fontSize: 12,
              lineHeight: 1,
              padding: '16px',
              fontWeight: 700,
              background: '#EBECF0',
              borderRadius: 4,
              cursor: 'pointer',
              '-webkit-user-drag': 'element',
            }}
            onClick={() => handleAddText(addABodyText)}
            onDragStart={(e) => handleDrag(e, addABodyText)}
          >
            Add a little bit of body text
          </div>
        </div>
        <div
          css={{
            flexGrow: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
            gridGap: 8,
            padding: '16px',
          }}
        ></div>
      </div>
    </div>
  );
};

export default TextContent;
