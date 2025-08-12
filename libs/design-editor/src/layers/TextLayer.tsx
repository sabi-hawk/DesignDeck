import { TextContent, TextContentProps } from '@lidojs/design-layers';
import { createEditor } from '@lidojs/text-editor';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useEditor, useLayer, useSelectedLayers } from '../hooks';
import { LayerComponent } from '../types';

export type TextLayerProps = TextContentProps & { viewOnly?: boolean };

const TextLayer: LayerComponent<TextLayerProps> = ({
  text,
  boxSize,
  scale,
  fonts,
  colors,
  fontSizes,
  effect,
  rotate,
  position,
  viewOnly,
  ...props
}) => {
  const { actions, id, pageIndex } = useLayer();
  const { selectedLayerIds } = useSelectedLayers();
  const { textEditor } = useEditor((state) => ({
    textEditor: state.textEditor,
  }));
  useEffect(() => {
    if (!viewOnly) {
      const editor = createEditor({ content: text });
      editor && actions.setTextEditor(editor);
    }
    // editor shouldn't re-create
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleStartUpdate = useCallback(() => {
    if (selectedLayerIds.includes(id)) {
      actions.openTextEditor();
    }
  }, [actions, id, selectedLayerIds]);

  const isEditing = useMemo(() => {
    if (!textEditor) return false;
    return textEditor.pageIndex === pageIndex && textEditor.layerId === id;
  }, [id, pageIndex, textEditor]);

  return (
    <div
      css={{
        transformOrigin: '0 0',
        position: 'relative',
      }}
      style={{
        width: boxSize.width / scale,
        height: boxSize.height / scale,
        transform: `scale(${scale})`,
        opacity: isEditing ? 0 : 1,
      }}
      onDoubleClick={handleStartUpdate}
    >
      <TextContent
        boxSize={boxSize}
        colors={colors}
        effect={effect}
        fontSizes={fontSizes}
        fonts={fonts}
        position={position}
        rotate={rotate}
        scale={scale}
        text={text}
        {...props}
      />
    </div>
  );
};

TextLayer.info = {
  name: 'Text',
  type: 'Text',
};

export default TextLayer;
