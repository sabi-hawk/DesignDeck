import { LayerComponentProps } from '@lidojs/design-core';
import React, { useEffect, useMemo } from 'react';
import { useEditor, useSelectedLayers } from '../hooks';
import {
  FrameLayerProps,
  ImageLayerProps,
  RootLayerProps,
  ShapeLayerProps,
  SvgLayerProps,
  TextLayerProps,
} from '../layers';

import { IframeLayerProps } from '../layers/IframeLayer';
import { Layer } from '../types';
import {
  isFrameLayer,
  isGroupLayer,
  isIframeLayer,
  isImageLayer,
  isRootLayer,
  isShapeLayer,
  isSvgLayer,
  isTextLayer,
} from '../ultils/layer/layers';
import CommonSettings from './CommonSettings';
import FrameSettings from './FrameSettings';
import IframeSettings from './IframeSettings';
import ImageSettings from './ImageSettings';
import RootSettings from './RootSettings';
import ShapeSettings from './ShapeSettings';
import SvgSettings from './SvgSetting';
import TextSettings from './TextSettings';

const LayerSettings = () => {
  const { selectedLayers, selectedLayerIds, layerIdList } = useSelectedLayers();
  const { actions, query, activePage, sidebar, isPageLocked } = useEditor(
    (state) => ({
      sidebar: state.sidebar,
      activePage: state.activePage,
      isPageLocked:
        state.pages[state.activePage] &&
        state.pages[state.activePage].layers.ROOT.data.locked,
    })
  );

  const {
    rootLayer,
    textLayers,
    shapeLayers,
    svgLayers,
    frameLayers,
    imageLayers,
    iframeLayers,
  } = useMemo(() => {
    return selectedLayers.reduce(
      (acc, layer) => {
        if (layer.data.locked) {
          return acc;
        }

        const addingToList = (layer: Layer<LayerComponentProps>) => {
          if (isSvgLayer(layer)) {
            acc.svgLayers.push(layer);
          } else if (isTextLayer(layer)) {
            acc.textLayers.push(layer);
          } else if (isShapeLayer(layer)) {
            acc.shapeLayers.push(layer);
          } else if (isFrameLayer(layer)) {
            acc.frameLayers.push(layer);
          } else if (isImageLayer(layer)) {
            acc.imageLayers.push(layer);
          } else if (isIframeLayer(layer)) {
            acc.iframeLayers.push(layer);
          }
        };

        if (isRootLayer(layer)) {
          acc.rootLayer = layer;
        } else if (isGroupLayer(layer)) {
          const childList = query.getChildLayers(activePage, layer.id);
          childList.forEach((child) => {
            addingToList(child);
          });
        } else {
          addingToList(layer);
        }
        return acc;
      },
      {
        textLayers: [],
        shapeLayers: [],
        rootLayer: null,
        svgLayers: [],
        frameLayers: [],
        imageLayers: [],
        iframeLayers: [],
      } as {
        textLayers: Layer<TextLayerProps>[];
        shapeLayers: Layer<ShapeLayerProps>[];
        rootLayer: Layer<RootLayerProps> | null;
        svgLayers: Layer<SvgLayerProps>[];
        frameLayers: Layer<FrameLayerProps>[];
        imageLayers: Layer<ImageLayerProps>[];
        iframeLayers: Layer<IframeLayerProps>[];
      }
    );
  }, [activePage, query, selectedLayers]);
  useEffect(() => {
    const layerType: string[] = [];
    if (sidebar && sidebar !== 'LAYER_MANAGEMENT') {
      selectedLayers.forEach((layer) => {
        layerType.push(layer.data.type);
      });

      if (
        sidebar &&
        layerType.includes('Text') &&
        !['FONT_FAMILY', 'TEXT_EFFECT', 'CHOOSING_COLOR'].includes(sidebar)
      ) {
        actions.setSidebar();
      } else if (
        sidebar &&
        (layerType.includes('Shape') || layerType.includes('Root')) &&
        !['CHOOSING_COLOR', 'IMAGE_MANIPULATION'].includes(sidebar)
      ) {
        actions.setSidebar();
      } else if (
        sidebar &&
        ['IMAGE_MANIPULATION'].includes(sidebar) &&
        !layerType.includes('Frame') &&
        !layerType.includes('Image') &&
        !layerType.includes('Root')
      ) {
        actions.setSidebar();
      } else if (
        sidebar &&
        layerType.includes('Frame') &&
        ['IMAGE_MANIPULATION'].includes(sidebar) &&
        frameLayers.length === 1 &&
        !frameLayers[0].data.props.image
      ) {
        actions.setSidebar();
      } else if (
        sidebar &&
        layerType.includes('Root') &&
        ['IMAGE_MANIPULATION'].includes(sidebar) &&
        !rootLayer.data.props.image
      ) {
        actions.setSidebar();
      }
    }
    // layer props shouldn't affect this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebar, selectedLayerIds, actions]);
  return (
    <div
      css={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 14,
        fontWeight: 600,
        padding: '0 8px',
      }}
    >
      <div
        css={{
          display: 'grid',
          alignItems: 'center',
          gridAutoFlow: 'column',
          gridGap: 8,
          paddingRight: 20,
        }}
      >
        {rootLayer && !isPageLocked && <RootSettings layer={rootLayer} />}
        {/* cannot support editing multiple image */}
        {layerIdList.length === 1 &&
          imageLayers.length === 1 &&
          !isPageLocked && <ImageSettings layers={imageLayers} />}
        {frameLayers.length > 0 && !isPageLocked && (
          <FrameSettings layers={frameLayers} />
        )}
        {/* TODO: too complex */}
        {layerIdList.length === shapeLayers.length &&
          shapeLayers.length > 0 &&
          !isPageLocked && <ShapeSettings layers={shapeLayers} />}
        {/* TODO: too complex */}
        {layerIdList.length === textLayers.length &&
          textLayers.length > 0 &&
          !isPageLocked && <TextSettings layers={textLayers} />}
        {svgLayers.length === 1 && !isPageLocked && (
          <SvgSettings layer={svgLayers[0]} />
        )}
        {iframeLayers.length === 1 && !isPageLocked && (
          <IframeSettings layer={iframeLayers[0]} />
        )}
        <CommonSettings />
      </div>
    </div>
  );
};

export default LayerSettings;
