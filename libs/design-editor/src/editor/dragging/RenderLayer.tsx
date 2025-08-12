import {
  getTransformStyle,
  LayerComponentProps,
  LayerId,
} from '@lidojs/design-core';
import { createElement, FC } from 'react';
import { Layer } from '../../types';

export const RenderLayer: FC<{
  layers: Record<LayerId, Layer<LayerComponentProps>>;
  layerId: LayerId;
}> = ({ layers, layerId }) => {
  return createElement(
    layers[layerId].data.comp,
    {
      ...layers[layerId].data.props,
      layerId: layers[layerId].id,
      viewOnly: true,
    },
    layers[layerId].data.child.map((c) => (
      <div
        key={c}
        css={{
          touchAction: 'pan-x pan-y pinch-zoom',
          pointerEvents: 'none',
          position: 'absolute',
        }}
        style={{
          width: layers[c].data.props.boxSize.width,
          height: layers[c].data.props.boxSize.height,
          transform: getTransformStyle({
            position: layers[c].data.props.position,
            rotate: layers[c].data.props.rotate,
          }),
          opacity: layers[c].data.props.transparency,
        }}
      >
        <RenderLayer layerId={c} layers={layers} />
      </div>
    ))
  );
};
