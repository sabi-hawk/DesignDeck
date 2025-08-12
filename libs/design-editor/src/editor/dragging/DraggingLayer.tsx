import {
  FontData,
  LayerComponentProps,
  LayerId,
  SerializedLayers,
} from '@lidojs/design-core';
import { FontStyle } from '@lidojs/design-layers';
import { mergeWithoutArray } from '@lidojs/design-utils';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useEditor } from '../../hooks';
import { Layer } from '../../types';
import { deserializeLayerTree } from '../../ultils/layer/deserializeLayerTree';
import { isTextLayer } from '../../ultils/layer/layers';
import { RenderLayer } from './RenderLayer';

export const DraggingLayer: FC<{
  layers: SerializedLayers;
  parentId: LayerId;
}> = ({ layers, parentId }) => {
  const { scale } = useEditor((state) => ({ scale: state.scale }));
  const [layerList, setLayerList] =
    useState<Record<LayerId, Layer<LayerComponentProps>>>();
  const [rootId, setRootId] = useState<LayerId>();
  useEffect(() => {
    const { layerObjList, rootId } = deserializeLayerTree(
      { layers, rootId: parentId },
      'ROOT',
      {
        x: 0,
        y: 0,
      }
    );
    setLayerList(layerObjList);
    setRootId(rootId);
  }, [layers, parentId]);

  const fonts = useMemo(() => {
    const fontFamilyList: FontData[] = [];
    if (layerList) {
      Object.entries(layerList).forEach(([, layer]) => {
        if (isTextLayer(layer)) {
          fontFamilyList.push(...layer.data.props.fonts);
        }
      });
    }
    return fontFamilyList;
  }, [layerList]);

  return (
    layerList && (
      <div
        css={{
          width: layerList[rootId].data.props.boxSize.width,
          height: layerList[rootId].data.props.boxSize.height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          position: 'relative',
        }}
      >
        {fonts.map((font) => (
          <FontStyle key={font.name} font={font} />
        ))}
        <RenderLayer
          layerId={rootId}
          layers={mergeWithoutArray(layerList, {
            rootId: {
              data: {
                props: {
                  position: {
                    x: 0,
                    y: 0,
                  },
                },
              },
            },
          })}
        />
      </div>
    )
  );
};
