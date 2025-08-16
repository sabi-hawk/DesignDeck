import { SimpleFrameContent, SimpleFrameContentProps } from '@lidojs/design-layers';
import React, { PropsWithChildren } from 'react';
import { useLayer } from '../hooks';
import { LayerComponent } from '../types';

const SimpleFrameLayer: LayerComponent<PropsWithChildren<SimpleFrameContentProps>> = ({
  layerId,
  boxSize,
  children,
  position,
  rotate,
  scale,
  ...props
}) => {
  const { actions } = useLayer();

  return (
    <>
      <SimpleFrameContent
        boxSize={boxSize}
        layerId={layerId}
        position={position}
        rotate={rotate}
        scale={scale}
        {...props}
      />
      {children}
    </>
  );
};

SimpleFrameLayer.info = {
  name: 'SimpleFrame',
  type: 'SimpleFrame' as any,
};
export default SimpleFrameLayer; 