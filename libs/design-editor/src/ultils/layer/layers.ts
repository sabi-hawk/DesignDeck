import {
  LayerComponentProps,
  LayerId,
  SerializedLayer,
  SerializedLayers,
} from '@lidojs/design-core';
import { createElement, ReactElement } from 'react';
import { v4 } from 'uuid';
import { resolvers } from '../../editor/resolvers';
import {
  FrameLayerProps,
  GroupLayerProps,
  ImageLayerProps,
  RootLayerProps,
  ShapeLayerProps,
  SvgLayerProps,
  TextLayerProps,
} from '../../layers';
import { IframeLayerProps } from '../../layers/IframeLayer';
import { Layer, LayerComponent, LayerData, Layers } from '../../types';
import { resolveComponent } from './resolveComponent';

export const getRandomId = (): LayerId => v4();
export const deserializeLayer = <P extends LayerComponentProps>(
  data: SerializedLayer
): LayerData<P> => {
  const { type, props } = deserializeComponent(data);

  return {
    ...(type as LayerComponent<P>).info,
    comp: type as LayerComponent<P>,
    props,
    locked: data.locked,
    child: data.child,
    parent: data.parent,
  };
};

const deserializeComponent = (data: SerializedLayer): ReactElement => {
  const {
    type: { resolvedName },
    props,
  } = data;
  const component = resolvers[resolvedName];
  return createElement(component, props) as ReactElement;
};

export const serializeLayers = (
  layers: Layers,
  rootTreeId: LayerId
): SerializedLayers => {
  let res: SerializedLayers = {};
  res[rootTreeId] = {
    type: {
      resolvedName: resolveComponent(layers[rootTreeId].data.comp),
    },
    props: layers[rootTreeId].data.props,
    locked: layers[rootTreeId].data.locked,
    child: layers[rootTreeId].data.child,
    parent: layers[rootTreeId].data.parent,
  };
  layers[rootTreeId].data.child.forEach((childId) => {
    res = { ...res, ...serializeLayers(layers, childId) };
  });
  return res;
};

export const isRootLayer = <P extends LayerComponentProps>(
  layer: Layer<RootLayerProps> | Layer<P>
): layer is Layer<RootLayerProps> => layer.data.type === 'Root';

export const isMainLayer = <P extends LayerComponentProps>(layer: Layer<P>) =>
  layer.data.parent === 'ROOT';

export const isGroupLayer = <P extends LayerComponentProps>(
  layer: Layer<GroupLayerProps> | Layer<P>
): layer is Layer<GroupLayerProps> => layer.data.type === 'Group';

export const isTextLayer = <P extends LayerComponentProps>(
  layer: Layer<TextLayerProps> | Layer<P>
): layer is Layer<TextLayerProps> => layer.data.type === 'Text';

export const isFrameLayer = <P extends LayerComponentProps>(
  layer: Layer<FrameLayerProps> | Layer<P>
): layer is Layer<FrameLayerProps> => layer.data.type === 'Frame';

export const isSimpleFrameLayer = <P extends LayerComponentProps>(
  layer: Layer<P>
): layer is Layer<P> => layer.data.type === 'SimpleFrame';

export const isSvgLayer = <P extends LayerComponentProps>(
  layer: Layer<SvgLayerProps> | Layer<P>
): layer is Layer<SvgLayerProps> => layer.data.type === 'Svg';

export const isImageLayer = <P extends LayerComponentProps>(
  layer: Layer<ImageLayerProps> | Layer<P>
): layer is Layer<ImageLayerProps> => layer.data.type === 'Image';

export const isShapeLayer = <P extends LayerComponentProps>(
  layer: Layer<ShapeLayerProps> | Layer<P>
): layer is Layer<ShapeLayerProps> => layer.data.type === 'Shape';

export const isIframeLayer = <P extends LayerComponentProps>(
  layer: Layer<IframeLayerProps> | Layer<P>
): layer is Layer<IframeLayerProps> => layer.data.name === 'Iframe';

export const isScaleOnlyLayer = <P extends LayerComponentProps>(
  layer: Layer<P>
): layer is Layer<P> => layer.data.type === 'ScaleOnly';

export const isScaleAndResizeLayer = <P extends LayerComponentProps>(
  layer: Layer<P>
): layer is Layer<P> => layer.data.type === 'ScaleAndResize';
