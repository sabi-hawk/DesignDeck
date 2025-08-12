import { LayerComponentProps, PageContext } from '@lidojs/design-core';
import { useContext } from 'react';
import { Layer } from '../types';
import { useEditor } from './useEditor';

export const useSelectedLayers = () => {
  const { pageIndex } = useContext(PageContext);
  const { selectedLayerIds, selectedLayers, layerList, layerIdList } =
    useEditor((state, query) => {
      const pI =
        typeof pageIndex === 'undefined' ? state.activePage : pageIndex;
      const layerIds = (state.selectedLayers[pI] || []).filter((layerId) => {
        return state.pages[pI] && state.pages[pI].layers[layerId];
      });
      const layerList = layerIds.reduce((acc, cur) => {
        const child = query.getChildLayers(pI, cur);
        if (child.length > 0) {
          acc.push(...child);
        }
        return acc;
      }, [] as Layer<LayerComponentProps>[]);
      const selectedLayers = layerIds.map(
        (layerId) => state.pages[pI].layers[layerId]
      );
      return {
        selectedLayerIds: layerIds,
        selectedLayers: selectedLayers,
        layerList: [...selectedLayers, ...layerList],
        layerIdList: [...layerIds, ...layerList.map((l) => l.id)],
      };
    });

  return { selectedLayerIds, selectedLayers, layerList, layerIdList };
};
