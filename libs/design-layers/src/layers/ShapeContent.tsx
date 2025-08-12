import {
  getGradientBackground,
  GradientStyle,
  LayerComponentProps,
  ShapeBorderStyle,
  ShapeType,
} from '@lidojs/design-core';
import React, { FC } from 'react';
import { getShapePath } from './shape';

export interface ShapeContentProps extends LayerComponentProps {
  shape: ShapeType;
  roundedCorners: number;
  color: string | null;
  gradientBackground: {
    colors: string[];
    style: GradientStyle;
  } | null;
  border: {
    style: ShapeBorderStyle;
    weight: number;
    color: string;
  } | null;
  scale: number;
}

export const ShapeContent: FC<ShapeContentProps> = ({
  layerId,
  boxSize,
  shape,
  color,
  gradientBackground,
  roundedCorners = 0,
  scale = 1,
  border,
}) => {
  const getDashArray = () => {
    switch (border?.style) {
      case 'longDashes':
        return `${border.weight * 6}, ${border.weight}`;
      case 'shortDashes':
        return `${border.weight * 3}, ${border.weight}`;
      case `dots`:
        return `${border.weight}, ${border.weight}`;
      default:
        return undefined;
    }
  };
  return (
    <div
      css={{
        position: 'relative',
        width: boxSize.width / scale,
        height: boxSize.height / scale,
      }}
    >
      <div
        css={{
          clipPath: `path("${getShapePath(shape, {
            width: boxSize.width / scale,
            height: boxSize.height / scale,
            roundedCorners,
          })}")`,
          width: '100%',
          height: '100%',
          background: gradientBackground
            ? getGradientBackground(
                gradientBackground.colors,
                gradientBackground.style
              )
            : color || '#fff',
        }}
      />
      {border ? (
        <svg
          css={{ position: 'absolute', inset: 0 }}
          viewBox={`0 0 ${boxSize.width / scale} ${boxSize.height / scale}`}
        >
          {roundedCorners || (border && shape === 'circle') ? (
            <defs>
              <clipPath id={`roundedCorners_${layerId}`}>
                <path
                  d={getShapePath(shape, {
                    width: boxSize.width / scale,
                    height: boxSize.height / scale,
                    roundedCorners,
                  })}
                />
              </clipPath>
            </defs>
          ) : null}
          <path
            clipPath={`url(#roundedCorners_${layerId})`}
            d={getShapePath(shape, {
              width: boxSize.width / scale,
              height: boxSize.height / scale,
              roundedCorners,
            })}
            fill={'none'}
            stroke={border.color}
            strokeDasharray={getDashArray()}
            strokeLinecap={'butt'}
            strokeWidth={border.weight}
          />
        </svg>
      ) : null}
    </div>
  );
};
