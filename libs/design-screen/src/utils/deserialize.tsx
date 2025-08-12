import {
  LayerComponentProps,
  LayerId,
  SerializedLayer,
  SerializedPage,
  TransformLayer,
} from '@lidojs/design-core';
import { createElement, ReactElement } from 'react';
import { resolvers } from './resolvers';

const renderLayer = (
  layers: Record<LayerId, SerializedLayer>,
  layerId: LayerId
): ReactElement => {
  const child = layers[layerId].child.map((lId) =>
    renderWrapperLayer(layers, lId)
  );
  return createElement(
    resolvers[layers[layerId].type.resolvedName],
    {
      ...(layers[layerId].props as LayerComponentProps),
      key: layerId,
      layerId,
    },
    child
  );
};

export const renderWrapperLayer = (
  layers: Record<LayerId, SerializedLayer>,
  layerId: LayerId
) => {
  return createElement(
    TransformLayer,
    { ...(layers[layerId].props as LayerComponentProps), key: layerId },
    renderLayer(layers, layerId)
  );
};
export const renderPages = (serializedPages: SerializedPage[]) => {
  return serializedPages.map((serializedPage) => {
    return renderWrapperLayer(serializedPage.layers, 'ROOT');
  });
};
