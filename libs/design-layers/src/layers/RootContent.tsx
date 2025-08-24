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
}

export const RootContent: FC<PropsWithChildren<RootContentProps>> = ({
  boxSize,
  color,
  gradientBackground,
  image,
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
        </>
      )}
    </div>
  );
};
