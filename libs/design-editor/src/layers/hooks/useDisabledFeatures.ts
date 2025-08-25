import { useMemo } from 'react';
import { useSelectedLayers } from '../../hooks';
import {
  isFrameLayer,
  isGroupLayer,
  isScaleAndResizeLayer,
  isScaleOnlyLayer,
  isShapeLayer,
  isSvgLayer,
  isTextLayer,
  isSimpleFrameLayer,
} from '../../ultils/layer/layers';

export const useDisabledFeatures = () => {
  const { selectedLayers } = useSelectedLayers();
  const scalable = useMemo(
    () =>
      !!selectedLayers.find(
        (layer) =>
          isTextLayer(layer) ||
          isGroupLayer(layer) ||
          isFrameLayer(layer) ||
          isShapeLayer(layer) ||
          isScaleOnlyLayer(layer) ||
          isScaleAndResizeLayer(layer)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(selectedLayers.map((l) => l.id))]
  );
  return useMemo(() => {
    const disable = {
      vertical: selectedLayers.length > 1,
      horizontal: selectedLayers.length > 1,
      corners: false,
      locked: false,
      rotate: false,
      scalable: !scalable,
    };
    selectedLayers.forEach((layer) => {
      if (layer.data.locked) {
        disable.locked = true;
        disable.vertical = true;
        disable.horizontal = true;
        disable.corners = true;
        disable.rotate = true;
      }
      if (isTextLayer(layer)) {
        disable.vertical = true;
      }
      if (isFrameLayer(layer) || isSvgLayer(layer) || isScaleOnlyLayer(layer)) {
        disable.horizontal = true;
        disable.vertical = true;
        disable.scalable = false;
      }
      if (isSimpleFrameLayer(layer)) {
        disable.horizontal = true;
        disable.vertical = true;
        disable.corners = true;
        disable.scalable = false;
      }
      if (isGroupLayer(layer)) {
        disable.horizontal = true;
        disable.vertical = true;
      }
      if (isScaleAndResizeLayer(layer)) {
        disable.horizontal = false;
        disable.vertical = false;
      }
    });
    return disable;
  }, [scalable, selectedLayers]);
};
