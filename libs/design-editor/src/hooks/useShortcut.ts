import { modifiers, normalizeKeyName } from '@lidojs/design-utils';
import { RefObject, useCallback, useEffect } from 'react';
import { keyName } from 'w3c-keyname';
import { copy } from '../ultils/menu-actions/copy';
import { duplicate } from '../ultils/menu-actions/duplicate';
import { paste } from '../ultils/menu-actions/paste';
import { useEditor } from './useEditor';
import { useSelectedLayers } from './useSelectedLayers';

const useShortcut = (frameEle: RefObject<HTMLElement | null>) => {
  const { actions, state, activePage, rootLayer, scale } = useEditor(
    (state) => ({
      rootLayer:
        state.pages[state.activePage] &&
        state.pages[state.activePage].layers.ROOT,
      activePage: state.activePage,
      scale: state.scale,
    })
  );
  const { selectedLayerIds } = useSelectedLayers();

  // Helper function for consistent zoom parameters
  const getZoomParams = () => {
    const frameWidth = 1920;
    const frameHeight = 1080;
    const padding = 200;
    const targetWidth = frameWidth + padding * 2;
    const targetHeight = frameHeight + padding * 2;
    const referenceViewportWidth = 1400;
    const referenceViewportHeight = 900;
    const maxScale = Math.min(
      referenceViewportWidth / targetWidth,
      referenceViewportHeight / targetHeight
    );
    const minScale = 0.01;
    return { minScale, maxScale };
  };
  const handlePaste = useCallback(async () => {
    await paste({ actions });
    actions.hideContextMenu();
  }, [actions]);
  const handleCopy = useCallback(async () => {
    await copy(state, { pageIndex: activePage, layerIds: selectedLayerIds });
    actions.hideContextMenu();
  }, [actions, state, activePage, selectedLayerIds]);

  const handleDuplicate = useCallback(() => {
    duplicate(state, {
      pageIndex: activePage,
      layerIds: selectedLayerIds,
      actions,
    });
    actions.hideContextMenu();
  }, [state, activePage, selectedLayerIds, actions]);

  const handleDelete = useCallback(() => {
    if (!selectedLayerIds.includes('ROOT')) {
      actions.deleteLayer(state.activePage, selectedLayerIds);
    }
  }, [selectedLayerIds, state, actions]);

  const backwardDisabled =
    rootLayer?.data.child.findIndex((i) => selectedLayerIds.includes(i)) === 0;
  const forwardDisabled =
    rootLayer?.data.child.findLastIndex((i) => selectedLayerIds.includes(i)) ===
    (rootLayer?.data.child.length || 0) - 1;
  const handleForward = useCallback(() => {
    if (!forwardDisabled) {
      actions.bringForward(activePage, selectedLayerIds);
    }
  }, [actions, activePage, forwardDisabled, selectedLayerIds]);
  const handleToFront = useCallback(() => {
    if (!forwardDisabled) {
      actions.bringToFront(activePage, selectedLayerIds);
    }
  }, [actions, activePage, forwardDisabled, selectedLayerIds]);
  const handleBackward = useCallback(() => {
    if (!backwardDisabled) {
      actions.sendBackward(activePage, selectedLayerIds);
    }
  }, [actions, activePage, backwardDisabled, selectedLayerIds]);
  const handleToBack = useCallback(() => {
    if (!backwardDisabled) {
      actions.sendToBack(activePage, selectedLayerIds);
    }
  }, [actions, activePage, backwardDisabled, selectedLayerIds]);
  const handleZoomIn = useCallback(() => {
    const { minScale, maxScale } = getZoomParams();

    // Convert current scale to percentage, add 10%, convert back
    const currentPercentage =
      ((scale - minScale) / (maxScale - minScale)) * 100;
    const newPercentage = Math.min(currentPercentage + 10, 100);
    const newScale = minScale + (newPercentage / 100) * (maxScale - minScale);

    actions.setScale(newScale);
  }, [actions, scale]);
  const handleZoomOut = useCallback(() => {
    const { minScale, maxScale } = getZoomParams();

    // Convert current scale to percentage, subtract 10%, convert back
    const currentPercentage =
      ((scale - minScale) / (maxScale - minScale)) * 100;
    const newPercentage = Math.max(currentPercentage - 10, 0);
    const newScale = minScale + (newPercentage / 100) * (maxScale - minScale);

    actions.setScale(newScale);
  }, [actions, scale]);
  const handleZoomReset = useCallback(() => {
    // Reset to 100% in new system (which shows frame area with padding)
    const { maxScale } = getZoomParams();
    actions.setScale(maxScale);
  }, [actions]);
  const handleKeydown = useCallback(
    async (e: KeyboardEvent) => {
      const name = keyName(e);
      const key = modifiers(name, e);
      const isSelectedLayer = selectedLayerIds.length > 0;
      //contain shortcut in blur mode
      switch (key) {
        case normalizeKeyName('Mod-a'):
          actions.selectAllLayers();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-z'):
          actions.history.undo();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-y'):
          actions.history.redo();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-v'):
          await handlePaste();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-c'):
          isSelectedLayer && (await handleCopy());
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-d'):
          isSelectedLayer && (await handleDuplicate());
          e.preventDefault();
          break;

        case normalizeKeyName('Mod-]'):
          isSelectedLayer && handleForward();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-Alt-]'):
          isSelectedLayer && handleToFront();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-['):
          isSelectedLayer && handleBackward();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-Alt-['):
          isSelectedLayer && handleToBack();
          e.preventDefault();
          break;
        case normalizeKeyName('Delete'):
        case normalizeKeyName('Backspace'):
          isSelectedLayer && handleDelete();
          e.preventDefault();
          break;
        case normalizeKeyName('ArrowLeft'):
          actions.moveSelectedLayers('left', 1);
          e.preventDefault();
          break;
        case normalizeKeyName('ArrowRight'):
          actions.moveSelectedLayers('right', 1);
          e.preventDefault();
          break;
        case normalizeKeyName('ArrowUp'):
          actions.moveSelectedLayers('top', 1);
          e.preventDefault();
          break;
        case normalizeKeyName('ArrowDown'):
          actions.moveSelectedLayers('bottom', 1);
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-0'):
          handleZoomReset();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod--'):
          handleZoomOut();
          e.preventDefault();
          break;
        case normalizeKeyName('Mod-='):
          handleZoomIn();
          e.preventDefault();
          break;
      }
    },
    [
      selectedLayerIds.length,
      actions,
      handlePaste,
      handleCopy,
      handleDuplicate,
      handleForward,
      handleToFront,
      handleBackward,
      handleToBack,
      handleDelete,
      handleZoomReset,
      handleZoomOut,
      handleZoomIn,
    ]
  );

  useEffect(() => {
    const handleZoomDesktop = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      const factor = Math.exp(-e.deltaY / 600);
      if (!frameEle.current) return;
      const rect = frameEle.current.getBoundingClientRect();
      const payload = {
        factor,
        clientX: e.clientX,
        clientY: e.clientY,
        containerLeft: rect.left,
        containerTop: rect.top,
      };
      // Dispatch a custom zoom event for the zoom system to handle (cursor-centered)
      const evt = new CustomEvent('lido:zoom', { detail: payload });
      document.dispatchEvent(evt);
      e.preventDefault();
      e.stopPropagation();
    };

    frameEle.current?.addEventListener('wheel', handleZoomDesktop, {
      passive: false,
    });
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      frameEle.current?.removeEventListener('wheel', handleZoomDesktop);
    };
  }, [actions, frameEle, scale]);

  useEffect(() => {
    frameEle.current.addEventListener('keydown', handleKeydown);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      frameEle.current?.removeEventListener('keydown', handleKeydown);
    };
  }, [frameEle, handleKeydown]);
};

export default useShortcut;
