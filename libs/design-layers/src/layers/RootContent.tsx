import {
  getGradientBackground,
  GradientStyle,
  LayerComponentProps,
} from '@lidojs/design-core';
import React, { FC, HTMLProps, PropsWithChildren } from 'react';
import { ImageContent, ImageContentProps } from './ImageContent';

export interface RootContentProps
  extends LayerComponentProps,
    Omit<HTMLProps<HTMLDivElement>, 'color'> {
  color: string | null;
  gradientBackground: {
    colors: string[];
    style: GradientStyle;
  } | null;
  image?: (ImageContentProps['image'] & { transparency: number }) | null;
  video?: {
    url: string;
    position: { x: number; y: number };
    rotate: number;
    boxSize: { width: number; height: number };
    transparency?: number;
    flipVertical?: boolean;
    flipHorizontal?: boolean;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    autoPlay?: boolean;
  } | null;
}

export const RootContent: FC<PropsWithChildren<RootContentProps>> = ({
  boxSize,
  color,
  gradientBackground,
  image,
  video,
  position,
  rotate,
  layerId,
  children,
  ...props
}) => {
  return (
    <div
      className={layerId}
      css={{
        position: 'absolute',
        overflow: 'hidden',
        pointerEvents: 'auto',
        width: boxSize.width,
        height: boxSize.height,
      }}
      {...props}
    >
      {children ?? (
        <>
          <div
            css={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: boxSize.width,
              height: boxSize.height,
              background: gradientBackground
                ? getGradientBackground(
                    gradientBackground.colors,
                    gradientBackground.style
                  )
                : color || '#fff',
            }}
          />
          {image && (
            <ImageContent
              boxSize={boxSize}
              image={image}
              layerId={layerId}
              position={position}
              rotate={rotate}
            />
          )}
          {video && (
            <video
              src={video.url}
              autoPlay={video.autoPlay}
              loop
              muted
              css={{
                position: 'absolute',
                objectFit: 'fill',
                width: '100%',
                height: '100%',
                opacity: video.transparency !== undefined ? 1 - video.transparency / 100 : 1,
                filter: [
                  video.flipHorizontal ? 'scaleX(-1)' : '',
                  video.flipVertical ? 'scaleY(-1)' : '',
                  video.brightness !== undefined ? `brightness(${video.brightness}%)` : '',
                  video.contrast !== undefined ? `contrast(${video.contrast}%)` : '',
                  video.saturation !== undefined ? `saturate(${video.saturation}%)` : '',
                ].filter(Boolean).join(' '),
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
