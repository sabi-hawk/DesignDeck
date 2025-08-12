import {
  BoxSize,
  Delta,
  getFilterStyle,
  getTransformStyle,
  LayerComponentProps,
} from '@lidojs/design-core';
import React, { FC, useMemo } from 'react';

export interface ImageContentProps extends LayerComponentProps {
  image: {
    url: string;
    position: Delta;
    rotate: number;
    boxSize: BoxSize;
    transparency?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    brightness?: number | null;
    contrast?: number | null;
    grayscale?: number | null;
    saturation?: number | null;
    hueRotate?: number | null;
    blur?: number | null;
  };
}

export const ImageContent: FC<ImageContentProps> = ({
  image,
  boxSize,
  viewOnly,
}) => {
  const { flipVertical, flipHorizontal } = useMemo(() => image, [image]);
  const wrapperStyle = useMemo(
    () => ({
      transform:
        flipVertical || flipHorizontal
          ? `scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`
          : undefined,
      width: boxSize.width,
      height: boxSize.height,
    }),
    [flipHorizontal, flipVertical, boxSize]
  );

  return (
    <div
      css={{
        overflow: 'hidden',
        pointerEvents: viewOnly ? 'none' : 'auto',
        width: boxSize.width,
        height: boxSize.height,
        ...wrapperStyle,
      }}
    >
      <div
        css={{
          width: image.boxSize.width,
          height: image.boxSize.height,
          transform: getTransformStyle({
            position: image.position,
            rotate: image.rotate,
          }),
          position: 'relative',
          userSelect: 'none',
          opacity: image.transparency,
        }}
      >
        <img
          alt={image.url}
          css={{
            objectFit: 'fill',
            width: '100%',
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            filter: getFilterStyle(image),
          }}
          src={image.url}
        />
      </div>
    </div>
  );
};
