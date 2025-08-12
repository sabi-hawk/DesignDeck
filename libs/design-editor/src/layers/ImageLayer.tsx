import { ImageContent, ImageContentProps } from '@lidojs/design-layers';
import React from 'react';
import { useEditor, useLayer, useSelectedLayers } from '../hooks';
import { LayerComponent } from '../types';

export interface ImageLayerProps extends ImageContentProps {
  image: ImageContentProps['image'] & {
    thumb: string;
  };
}

const ImageLayer: LayerComponent<ImageLayerProps> = ({
  layerId,
  image,
  boxSize,
  position,
  rotate,
  viewOnly,
  ...props
}) => {
  const { actions, pageIndex, id } = useLayer();
  const { selectedLayerIds } = useSelectedLayers();
  const { imageEditor } = useEditor((state) => ({
    imageEditor: state.imageEditor,
  }));

  return (
    <div
      css={{
        pointerEvents: viewOnly ? 'none' : 'auto',
        visibility:
          imageEditor &&
          imageEditor.pageIndex === pageIndex &&
          imageEditor.layerId === id
            ? 'hidden'
            : undefined,
      }}
      onDoubleClick={() =>
        selectedLayerIds.includes(id) &&
        actions.openImageEditor({
          position,
          rotate,
          boxSize,
          image,
        })
      }
    >
      <ImageContent
        boxSize={boxSize}
        image={image}
        layerId={layerId}
        position={position}
        rotate={rotate}
        viewOnly={viewOnly}
        {...props}
      />
    </div>
  );
};

ImageLayer.info = {
  name: 'Image',
  type: 'Image',
};
export default ImageLayer;
