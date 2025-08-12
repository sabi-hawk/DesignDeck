import {
  BoxSize,
  Delta,
  getFilterStyle,
  getGradientBackground,
  getTransformStyle,
  GradientStyle,
  LayerComponentProps,
} from '@lidojs/design-core';
import React, { FC, useMemo } from 'react';

export interface FrameContentProps extends LayerComponentProps {
  clipPath: string;
  scale: number;
  color: string | null;
  gradientBackground?: {
    colors: string[];
    style: GradientStyle;
  } | null;
  image: {
    url: string;
    position: Delta;
    rotate: number;
    boxSize: BoxSize;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    brightness?: number | null;
    contrast?: number | null;
    grayscale?: number | null;
    saturation?: number | null;
    hueRotate?: number | null;
    blur?: number | null;
    viewOnly?: boolean;
  } | null;
}

export const FrameContent: FC<FrameContentProps> = ({
  clipPath,
  image,
  color,
  scale,
  gradientBackground,
  boxSize,
  viewOnly,
}) => {
  const { flipVertical, flipHorizontal } = useMemo(
    () => ({
      flipVertical: image?.flipVertical,
      flipHorizontal: image?.flipHorizontal,
    }),
    [image]
  );
  const wrapperStyle = useMemo(
    () => ({
      transform:
        flipVertical || flipHorizontal
          ? `scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`
          : undefined,
      width: boxSize.width / scale,
      height: boxSize.height / scale,
    }),
    [flipVertical, flipHorizontal, boxSize.width, boxSize.height, scale]
  );

  return (
    <div
      css={{
        overflow: 'hidden',
        pointerEvents: viewOnly ? 'none' : 'auto',
      }}
    >
      <div
        css={{
          width: '100%',
          height: '100%',
          clipPath: `path("${clipPath}")`,
          background: gradientBackground
            ? getGradientBackground(
                gradientBackground.colors,
                gradientBackground.style
              )
            : color ?? undefined,
        }}
      >
        {image && (
          <div css={wrapperStyle}>
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
        )}
      </div>
    </div>
  );
};
