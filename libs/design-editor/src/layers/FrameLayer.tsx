import { FrameContent, FrameContentProps } from '@lidojs/design-layers';
import React, { useContext, useEffect, useState } from 'react';
import { EditorContext } from '../editor/EditorContext';
import { useEditor, useLayer, useSelectedLayers } from '../hooks';
import { LayerComponent } from '../types';

export interface FrameLayerProps extends FrameContentProps {
  image:
    | (FrameContentProps['image'] & {
        thumb: string;
      })
    | null;
}

const FrameLayer: LayerComponent<FrameLayerProps> = ({
  layerId,
  clipPath,
  image,
  color,
  gradientBackground,
  boxSize,
  position,
  rotate,
  scale,
  viewOnly,
  ...props
}) => {
  const { config } = useContext(EditorContext);
  const { actions, pageIndex, id } = useLayer();
  const { selectedLayerIds } = useSelectedLayers();
  const [imageData, setImageData] = useState<FrameLayerProps['image']>(null);
  const { imageEditor } = useEditor((state) => ({
    imageEditor: state.imageEditor,
  }));

  const openEditor = () => {
    if (image && selectedLayerIds.includes(id)) {
      actions.openImageEditor({
        boxSize,
        position,
        rotate,
        image: {
          boxSize: {
            width: image.boxSize.width * scale,
            height: image.boxSize.height * scale,
          },
          position: {
            x: image.position.x * scale,
            y: image.position.y * scale,
          },
          rotate: image.rotate || 0,
          url: image.url,
          flipVertical: image.flipVertical,
          flipHorizontal: image.flipHorizontal,
        },
      });
    }
  };

  useEffect(() => {
    const getImageSetting = () => {
      const imgRatio =
        config.frame.defaultImage.width / config.frame.defaultImage.height;
      const boxRatio = boxSize.width / boxSize.height;
      const w =
        imgRatio > boxRatio
          ? (boxSize.height / scale) * imgRatio
          : boxSize.width / scale;
      const h =
        imgRatio > boxRatio
          ? boxSize.height / scale
          : (boxSize.width / scale) * imgRatio;
      const res: FrameLayerProps['image'] = {
        boxSize: {
          width: w,
          height: h,
        },
        position: {
          x: -(w - boxSize.width / scale) / 2,
          y: -(h - boxSize.height / scale) / 2,
        },
        rotate: 0,
        url: config.frame.defaultImage.url,
        thumb: config.frame.defaultImage.url,
      };
      return res;
    };
    if (!image && !color && !gradientBackground) {
      setImageData(getImageSetting());
    } else {
      setImageData(image);
    }
  }, [
    image,
    color,
    gradientBackground,
    config.frame.defaultImage.width,
    config.frame.defaultImage.height,
    config.frame.defaultImage.url,
    boxSize.width,
    boxSize.height,
    scale,
  ]);

  return (
    <div
      css={{
        transformOrigin: '0 0',
      }}
      style={{
        width: boxSize.width / scale,
        height: boxSize.height / scale,
        transform: `scale(${scale})`,
        visibility:
          imageEditor &&
          imageEditor.pageIndex === pageIndex &&
          imageEditor.layerId === id
            ? 'hidden'
            : undefined,
      }}
      onDoubleClick={openEditor}
    >
      <FrameContent
        boxSize={boxSize}
        clipPath={clipPath}
        color={color}
        gradientBackground={gradientBackground}
        image={imageData}
        layerId={layerId}
        position={position}
        rotate={rotate}
        scale={scale}
        viewOnly={viewOnly}
        {...props}
      />
    </div>
  );
};

FrameLayer.info = {
  name: 'Frame',
  type: 'Frame',
};
export default FrameLayer;
