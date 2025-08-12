import {
  Delta,
  LayerComponentProps,
  LayerId,
  SerializedLayer,
  SerializedLayerTree,
} from '@lidojs/design-core';
import { mergeWithoutArray } from '@lidojs/design-utils';
import { cloneDeep } from 'lodash';
import { Layer, Layers } from '../../types';
import { deserializeLayer, getRandomId } from './layers';

const decodeLayer = (serializedLayer: SerializedLayer, parentId: LayerId) => {
  const newId = getRandomId();
  return {
    id: newId,
    data: deserializeLayer({
      ...cloneDeep(serializedLayer),
      parent: parentId,
      child: [],
    }),
  };
};

export const deserializeLayerTree = (
  { rootId, layers }: SerializedLayerTree,
  parentId: LayerId = 'ROOT',
  position?: Delta
) => {
  const layerObjList: Record<LayerId, Layer<LayerComponentProps>> = {};
  const layer = decodeLayer(layers[rootId], parentId);
  const deserializeChild = (layerId: LayerId, newParentId: LayerId) => {
    const res: [LayerId, Layer<LayerComponentProps>][] = [];
    layers[layerId].child.forEach((childId) => {
      const childLayer = decodeLayer(layers[childId], newParentId);
      res.push([childLayer.id, childLayer]);
      layer.data.child.push(childLayer.id);
    });
    return res;
  };
  const child = deserializeChild(rootId, layer.id);
  const layerList: Layers = Object.fromEntries([...child]);
  Object.entries(layerList).forEach(([layerId, layer]) => {
    layerObjList[layerId] = layer;
  });
  layerObjList[layer.id] = {
    id: layer.id,
    data: mergeWithoutArray(layer.data, {
      props: {
        position,
      },
    }),
  };
  return {
    layerObjList,
    rootId: layer.id,
  };
};
