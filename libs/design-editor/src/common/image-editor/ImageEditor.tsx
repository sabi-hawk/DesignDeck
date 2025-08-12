import {
  getTransformStyle,
  positionOfObjectInsideAnother,
  scalePath,
} from '@lidojs/design-core';
import React, { useMemo, useRef } from 'react';
import { useEditor } from '../../hooks';
import { isFrameLayer } from '../../ultils/layer/layers';
import ImageEditorControl from './ImageEditorControl';

const ImageEditor = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const { imageEditor, originalLayer, scale } = useEditor((state) => {
    const imageEditor = state.imageEditor;
    return {
      imageEditor,
      scale: state.scale,
      originalLayer: imageEditor
        ? state.pages[imageEditor.pageIndex].layers[imageEditor.layerId]
        : null,
    };
  });

  const layer = imageEditor?.image ?? imageEditor?.video;
  const wrapperStyle = useMemo(
    () => ({
      transform:
        imageEditor.image.flipVertical || imageEditor.image.flipHorizontal
          ? `scale(${imageEditor.image.flipHorizontal ? -1 : 1}, ${
              imageEditor.image.flipVertical ? -1 : 1
            })`
          : undefined,
      width: '100%',
      height: '100%',
    }),
    [imageEditor.image.flipHorizontal, imageEditor.image.flipVertical]
  );
  if (!imageEditor || !originalLayer || !layer) {
    return null;
  }
  const mergeData = positionOfObjectInsideAnother(
    imageEditor,
    layer,
    imageEditor.image
  );

  return (
    <div css={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        css={{
          width: layer.boxSize.width * scale,
          height: layer.boxSize.height * scale,
          left: 0,
          top: 0,
          position: 'absolute',
          transform: getTransformStyle({
            position: {
              x: mergeData.x * scale,
              y: mergeData.y * scale,
            },
            rotate: mergeData.rotate,
          }),
          opacity: 0.5,
        }}
      >
        <div css={{ width: '100%', height: '100%' }}>
          {imageEditor.image && (
            <img
              alt={layer.url}
              crossOrigin="anonymous"
              css={{
                display: 'block',
                height: '100%',
                width: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                objectFit: 'fill',
                ...wrapperStyle,
              }}
              src={layer.url}
            />
          )}
          {imageEditor.video && (
            <video
              crossOrigin="anonymous"
              css={{ objectFit: 'fill', width: '100%', height: '100%' }}
              src={layer.url}
            />
          )}
        </div>
      </div>
      <div
        ref={boxRef}
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: imageEditor.boxSize.width * scale,
          height: imageEditor.boxSize.height * scale,
          transform: getTransformStyle({
            position: {
              x: imageEditor.position.x * scale,
              y: imageEditor.position.y * scale,
            },
            rotate: imageEditor.rotate,
          }),
          overflow: 'hidden',
          clipPath: isFrameLayer(originalLayer)
            ? `path("${scalePath(
                originalLayer.data.props.clipPath,
                originalLayer.data.props.scale * scale
              )}")`
            : undefined,
        }}
      >
        <div
          css={{
            width: layer.boxSize.width * scale,
            height: layer.boxSize.height * scale,
            transform: getTransformStyle({
              position: {
                x: !imageEditor.image.flipHorizontal
                  ? layer.position.x * scale
                  : (imageEditor.boxSize.width -
                      layer.boxSize.width -
                      layer.position.x) *
                    scale,
                y: !imageEditor.image.flipVertical
                  ? layer.position.y * scale
                  : (imageEditor.boxSize.height -
                      layer.boxSize.height -
                      layer.position.y) *
                    scale,
              },
              rotate: layer.rotate,
            }),
            opacity: 1,
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          <div css={{ width: '100%', height: '100%' }}>
            {imageEditor.image && (
              <img
                alt={layer.url}
                crossOrigin="anonymous"
                css={{
                  display: 'block',
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  pointerEvents: 'none',
                  objectFit: 'fill',
                  ...wrapperStyle,
                }}
                src={layer.url}
              />
            )}
            {imageEditor.video && (
              <video
                crossOrigin="anonymous"
                css={{ objectFit: 'fill', width: '100%', height: '100%' }}
                src={layer.url}
              />
            )}
          </div>
        </div>
      </div>
      <ImageEditorControl />
    </div>
  );
};

export default ImageEditor;
