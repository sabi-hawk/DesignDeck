import { FontData } from '@lidojs/design-core';
import { uniqBy } from 'lodash';
import { useEditor } from '../../hooks';
import { TextLayerProps } from '../../layers';
import { isTextLayer } from '../../ultils/layer/layers';

export const useUsedFont = () => {
  const { fontFamilyList } = useEditor((state) => {
    const fontFamilyList: FontData[] = [];
    state.pages.forEach((page) => {
      Object.entries(page.layers).forEach(([, layer]) => {
        if (isTextLayer(layer)) {
          const textProps = layer.data.props as TextLayerProps;
          fontFamilyList.push(...textProps.fonts);
        }
      });
    });
    return {
      fontFamilyList: uniqBy(fontFamilyList, 'name'),
    };
  });

  return { usedFonts: fontFamilyList };
};
