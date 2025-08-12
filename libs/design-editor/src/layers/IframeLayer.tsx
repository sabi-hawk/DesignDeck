import { IframeContent, IframeContentProps } from '@lidojs/design-layers';
import React from 'react';
import { LayerComponent } from '../types';

export type IframeLayerProps = IframeContentProps;

const IframeLayer: LayerComponent<IframeLayerProps> = ({
  scale = 1,
  boxSize,
  ...props
}) => {
  return (
    <div
      css={{
        transformOrigin: '0 0',
        pointerEvents: 'none',
      }}
      style={{
        width: boxSize.width / scale,
        height: boxSize.height / scale,
        transform: `scale(${scale})`,
      }}
    >
      <IframeContent boxSize={boxSize} {...props} />
    </div>
  );
};

IframeLayer.info = {
  name: 'Iframe',
  type: 'ScaleAndResize',
};
export default IframeLayer;
