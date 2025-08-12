import { ShapeContent, ShapeContentProps } from '@lidojs/design-layers';
import React, { FC } from 'react';

export type ShapeLayerProps = ShapeContentProps;
const ShapeLayer: FC<ShapeLayerProps> = ({
  layerId,
  boxSize,
  shape,
  color,
  gradientBackground,
  roundedCorners = 0,
  scale = 1,
  rotate,
  position,
  border,
}) => {
  return (
    <div
      css={{
        transformOrigin: '0 0',
      }}
      style={{
        width: boxSize.width / (scale || 1),
        height: boxSize.height / (scale || 1),
        transform: `scale(${scale || 1})`,
      }}
    >
      <ShapeContent
        border={border}
        boxSize={boxSize}
        color={color}
        gradientBackground={gradientBackground}
        layerId={layerId}
        position={position}
        rotate={rotate}
        roundedCorners={roundedCorners}
        scale={scale}
        shape={shape}
      />
    </div>
  );
};

export default ShapeLayer;
