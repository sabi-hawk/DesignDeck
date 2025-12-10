import { modifiers, normalizeKeyName } from '@lidojs/design-utils';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { keyName } from 'w3c-keyname';
import { copy } from '../ultils/menu-actions/copy';
import { duplicate } from '../ultils/menu-actions/duplicate';
import { paste } from '../ultils/menu-actions/paste';
import { useEditor } from './useEditor';
import { useSelectedLayers } from './useSelectedLayers';

const useShortcut = (
  frameEle: RefObject<HTMLElement | null>,
  pageListRef?: RefObject<HTMLDivElement[]>,
  pageTransform?: { x: number; y: number; scale: number }
) => {
  const { actions, state, activePage, rootLayer, scale, pageSize } = useEditor(
    (state, query) => ({
      rootLayer:
        state.pages[state.activePage] &&
        state.pages[state.activePage].layers.ROOT,
      activePage: state.activePage,
      scale: state.scale,
      pageSize: query.getPageSize(),
    })
  );
  const { selectedLayerIds } = useSelectedLayers();
  const zoomRaf = useRef<number | null>(null);

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
      const frame = frameEle.current;
      if (!frame || !e.ctrlKey) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Smooth exponential zoom like Figma
      const zoomFactor = Math.exp(-e.deltaY / 600);
      const { minScale, maxScale } = getZoomParams();
      const newScale = Math.min(
        Math.max(scale * zoomFactor, minScale),
        maxScale
      );

      // Skip if scale didn't change
      if (Math.abs(newScale - scale) < 0.0001) {
        return;
      }

      // Get cursor position relative to frame viewport
      const frameRect = frame.getBoundingClientRect();
      const cursorX = e.clientX - frameRect.left;
      const cursorY = e.clientY - frameRect.top;

      // Calculate world coordinates using current scroll position
      // We need to find the point in canvas space (world coordinates) that's under the cursor
      const scrollX = frame.scrollLeft + cursorX;
      const scrollY = frame.scrollTop + cursorY;

      // Account for page transform and container offset
      const currentEffectiveScale = scale * (pageTransform?.scale || 1);
      const pageContainerOffset = 56; // marginLeft from DesignFrame

      // Convert current scroll position to world coordinates (canvas space)
      // The page element's actual position in scroll space accounts for:
      // - pageContainerOffset (marginLeft)
      // - pageTransform.x (page translation)
      // - The scale affects the size, but we need world coordinates (unscaled)
      const worldX =
        (scrollX - pageContainerOffset - (pageTransform?.x || 0)) /
        currentEffectiveScale;
      const worldY =
        (scrollY - (pageTransform?.y || 0)) / currentEffectiveScale;

      // Calculate new effective scale after zoom
      const newEffectiveScale = newScale * (pageTransform?.scale || 1);

      // Convert world coordinates back to scroll space with NEW scale
      // This tells us where the world point will be after the scale change
      const newScrollX =
        worldX * newEffectiveScale +
        pageContainerOffset +
        (pageTransform?.x || 0);
      const newScrollY = worldY * newEffectiveScale + (pageTransform?.y || 0);

      // Calculate scroll position to keep cursor at same world position
      // After zoom, the world point should still be under the cursor
      // So: newScrollLeft + cursorX = newScrollX
      const nextScrollLeft = newScrollX - cursorX;
      const nextScrollTop = newScrollY - cursorY;

      // Clamp scroll to valid bounds
      const contentWidth = (pageSize?.width || 10000) * newScale;
      const contentHeight = (pageSize?.height || 10000) * newScale;
      const maxScrollLeft = Math.max(0, contentWidth - frame.clientWidth);
      const maxScrollTop = Math.max(0, contentHeight - frame.clientHeight);

      const clampedScrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, nextScrollLeft)
      );
      const clampedScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, nextScrollTop)
      );

      // Cancel any pending zoom operation to prevent accumulation
      if (zoomRaf.current) {
        cancelAnimationFrame(zoomRaf.current);
      }

      // Apply updates in a single frame to prevent flickering
      // Use flushSync to ensure scale is applied synchronously before setting scroll
      zoomRaf.current = requestAnimationFrame(() => {
        zoomRaf.current = null;

        // Flush the scale update synchronously so the DOM is updated before we set scroll
        flushSync(() => {
          actions.setScale(newScale);
        });

        // Now set scroll position immediately after scale is applied
        // The page should have re-rendered with new dimensions
        frame.scrollLeft = clampedScrollLeft;
        frame.scrollTop = clampedScrollTop;
      });
    };

    const frame = frameEle.current;
    if (frame) {
      frame.addEventListener('wheel', handleZoomDesktop, {
        passive: false,
      });
    }

    return () => {
      if (zoomRaf.current) {
        cancelAnimationFrame(zoomRaf.current);
      }
      if (frame) {
        frame.removeEventListener('wheel', handleZoomDesktop);
      }
    };
  }, [
    actions,
    frameEle,
    scale,
    activePage,
    pageListRef,
    pageTransform,
    pageSize,
  ]);

  useEffect(() => {
    frameEle.current.addEventListener('keydown', handleKeydown);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      frameEle.current?.removeEventListener('keydown', handleKeydown);
    };
  }, [frameEle, handleKeydown]);
};

export default useShortcut;
