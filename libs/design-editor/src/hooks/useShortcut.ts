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

      // Find the page element to get its actual rendered position
      const pageElement = pageListRef?.current?.[activePage];
      let worldX = 0;
      let worldY = 0;

      if (pageElement && pageTransform && pageSize) {
        // Get the page element's bounding rect (this accounts for all CSS transforms)
        const pageRect = pageElement.getBoundingClientRect();

        // Calculate position relative to page element's top-left corner in viewport
        const relativeX = e.clientX - pageRect.left;
        const relativeY = e.clientY - pageRect.top;

        // The page element has an inner div with transform: scale(scale * transform.scale)
        // So the effective scale applied to the content is:
        const currentEffectiveScale = scale * (pageTransform.scale || 1);

        // Convert viewport-relative position to world coordinates (canvas space)
        // The page element's bounding rect already accounts for the outer transform,
        // so we just need to divide by the effective scale to get world coordinates
        worldX = relativeX / currentEffectiveScale;
        worldY = relativeY / currentEffectiveScale;
      } else {
        // Fallback: use scroll-based calculation
        const scrollX = frame.scrollLeft + cursorX;
        const scrollY = frame.scrollTop + cursorY;
        const pageContainerOffset = 56;
        const currentEffectiveScale = scale * (pageTransform?.scale || 1);
        worldX =
          (scrollX - pageContainerOffset - (pageTransform?.x || 0)) /
          currentEffectiveScale;
        worldY = (scrollY - (pageTransform?.y || 0)) / currentEffectiveScale;
      }

      // Calculate new effective scale after zoom
      const newEffectiveScale = newScale * (pageTransform?.scale || 1);

      // Now calculate where the world point will be after zoom
      // We need to find where this world point will appear in viewport coordinates
      let nextScrollLeft = 0;
      let nextScrollTop = 0;

      if (pageElement && pageTransform && pageSize) {
        // Get page element position in viewport (will change after scale update)
        // But we can calculate where it should be
        const pageRect = pageElement.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();

        // Calculate page position in scroll coordinates
        const pageScrollX = pageRect.left - frameRect.left + frame.scrollLeft;
        const pageScrollY = pageRect.top - frameRect.top + frame.scrollTop;

        // World point in new scale space (relative to page element's top-left)
        const newPageX = worldX * newEffectiveScale;
        const newPageY = worldY * newEffectiveScale;

        // Calculate scroll to keep cursor at same world position
        // After zoom: scrollLeft + cursorX = pageScrollX + newPageX
        // But pageScrollX will change after scale, so we need to account for that
        // Actually, we want: cursorX = (pageScrollX + newPageX) - scrollLeft
        // So: scrollLeft = pageScrollX + newPageX - cursorX
        nextScrollLeft = pageScrollX + newPageX - cursorX;
        nextScrollTop = pageScrollY + newPageY - cursorY;
      } else {
        // Fallback calculation
        const pageContainerOffset = 56;
        const newScrollX =
          worldX * newEffectiveScale +
          pageContainerOffset +
          (pageTransform?.x || 0);
        const newScrollY = worldY * newEffectiveScale + (pageTransform?.y || 0);
        nextScrollLeft = newScrollX - cursorX;
        nextScrollTop = newScrollY - cursorY;
      }

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

        // After scale is applied, recalculate page position if we have page element
        // because the page element's size has changed
        if (pageElement && pageTransform && pageSize) {
          const frameRect = frame.getBoundingClientRect();
          const pageRect = pageElement.getBoundingClientRect();

          // Recalculate page position in scroll coordinates after scale change
          const pageScrollX = pageRect.left - frameRect.left + frame.scrollLeft;
          const pageScrollY = pageRect.top - frameRect.top + frame.scrollTop;

          // Recalculate scroll position with updated page position
          const newPageX = worldX * newEffectiveScale;
          const newPageY = worldY * newEffectiveScale;

          const correctedScrollLeft = pageScrollX + newPageX - cursorX;
          const correctedScrollTop = pageScrollY + newPageY - cursorY;

          // Clamp to bounds
          const contentWidth = pageSize.width * newScale;
          const contentHeight = pageSize.height * newScale;
          const maxScrollLeft = Math.max(0, contentWidth - frame.clientWidth);
          const maxScrollTop = Math.max(0, contentHeight - frame.clientHeight);

          frame.scrollLeft = Math.max(
            0,
            Math.min(maxScrollLeft, correctedScrollLeft)
          );
          frame.scrollTop = Math.max(
            0,
            Math.min(maxScrollTop, correctedScrollTop)
          );
        } else {
          // Fallback: use pre-calculated values
          frame.scrollLeft = clampedScrollLeft;
          frame.scrollTop = clampedScrollTop;
        }
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
