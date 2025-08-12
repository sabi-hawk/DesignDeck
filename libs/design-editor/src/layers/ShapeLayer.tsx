import { ShapeContent, ShapeContentProps } from '@lidojs/design-layers';
import React from 'react';
import { LayerComponent } from '../types';

export type ShapeLayerProps = ShapeContentProps;
const ShapeLayer: LayerComponent<ShapeLayerProps> = ({
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

ShapeLayer.info = {
  name: 'Shape',
  type: 'Shape',
};
export default ShapeLayer;
