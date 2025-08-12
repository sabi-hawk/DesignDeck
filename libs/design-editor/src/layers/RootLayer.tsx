import { RootContent, RootContentProps } from '@lidojs/design-layers';
import React, { Fragment, PropsWithChildren } from 'react';
import { useLayer } from '../hooks';
import { LayerComponent } from '../types';

export interface RootLayerProps extends Omit<RootContentProps, 'image'> {
  image?: (RootContentProps['image'] & { thumb: string }) | null;
}

const RootLayer: LayerComponent<PropsWithChildren<RootLayerProps>> = ({
  layerId,
  boxSize,
  children,
  color,
  gradientBackground,
  image,
  position,
  rotate,
  scale,
}) => {
  const { actions } = useLayer();

  const openEditor = () => {
    if (image) {
      actions.openImageEditor({
        boxSize,
        position,
        rotate,
        image,
      });
    }
  };

  return (
    <Fragment>
      <RootContent
        boxSize={boxSize}
        color={color}
        gradientBackground={gradientBackground}
        image={image}
        layerId={layerId}
        position={position}
        rotate={rotate}
        scale={scale}
        onDoubleClick={openEditor}
      />
      {children}
    </Fragment>
  );
};

RootLayer.info = {
  name: 'Main',
  type: 'Root',
};
export default RootLayer;
