import {
  CursorPosition,
  distanceBetweenPoints,
  getTransformStyle,
} from '@lidojs/design-core';
import { getPosition } from '@lidojs/design-utils';
import { throttle } from 'lodash';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { isMobile } from 'react-device-detect';
import { GestureEvent } from '../types';
import { useEditor } from './useEditor';

export const useZoomPage = (
  frameRef: RefObject<HTMLDivElement | null>,
  pageListRef: RefObject<HTMLDivElement[]>,
  pageContainerRef: RefObject<HTMLDivElement | null>
) => {
  const transformRef = useRef<{
    isMoving: boolean;
    isZoom: boolean;
    touchStart: [CursorPosition, CursorPosition];
    lastTouch: [CursorPosition, CursorPosition];
    start: CursorPosition;
    last: CursorPosition;
  }>({
    isMoving: false,
    isZoom: false,
    touchStart: [
      { clientX: 0, clientY: 0 },
      { clientX: 0, clientY: 0 },
    ],
    lastTouch: [
      { clientX: 0, clientY: 0 },
      { clientX: 0, clientY: 0 },
    ],
    start: { clientX: 0, clientY: 0 },
    last: { clientX: 0, clientY: 0 },
  });
  const [pageTransform, setPageTransform] = useState<{
    x: number;
    y: number;
    scale: number;
  }>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const {
    actions,
    scale,
    activePage,
    pageSize,
    isDragging,
    isRotating,
    isResizing,
    openImageEditor,
    openTextEditor,
    pageLength,
  } = useEditor((state, query) => {
    return {
      scale: state.scale,
      activePage: state.activePage,
      pageSize: query.getPageSize(),
      isDragging: state.dragData.status,
      isRotating: state.rotateData.status,
      isResizing: state.resizeData.status,
      openImageEditor: !!state.imageEditor,
      openTextEditor: !!state.textEditor,
      pageLength: state.pages.length,
    };
  });

  const pageZoomStart = useCallback(() => {
    transformRef.current.isZoom = true;
    transformRef.current.isMoving = false;
  }, []);

  const pageZoomMove = useCallback(
    (change: number, cursorX?: number, cursorY?: number) => {
      if (
        frameRef.current &&
        transformRef.current.isZoom &&
        pageListRef.current
      ) {
        const { x, y } = pageTransform;

        // 🎯 CURSOR-CENTERED ZOOM: If cursor position is provided, zoom towards it
        if (cursorX !== undefined && cursorY !== undefined) {
          // Calculate current page element position
          const pageElement = pageListRef.current[activePage];
          const pageRect = pageElement.getBoundingClientRect();
          const containerRect = frameRef.current.getBoundingClientRect();

          // Calculate cursor position relative to current page position
          const relativeCursorX =
            cursorX - (pageRect.left - containerRect.left);
          const relativeCursorY = cursorY - (pageRect.top - containerRect.top);

          // Calculate what content point is under the cursor
          const contentX = relativeCursorX / scale;
          const contentY = relativeCursorY / scale;

          // Calculate new position to keep that content point under cursor
          const newScale = change;
          const newX = cursorX - contentX * scale * newScale;
          const newY = cursorY - contentY * scale * newScale;

          pageListRef.current[activePage].style.transform = getTransformStyle({
            position: { x: newX, y: newY },
            scale: newScale,
          });
          return;
        }

        // ORIGINAL CENTER-BASED ZOOM (fallback)
        const headerHeight = 70;
        const footerHeight = 72;
        const offset = 16;
        const containerWidth = window.innerWidth - offset * 2;
        const containerHeight =
          window.innerHeight - headerHeight - footerHeight - offset * 2;
        const oldPageW = pageSize.width * scale;
        const oldPageH = pageSize.height * scale;
        const perfectX = (containerWidth - oldPageW) / 2;
        const perfectY = (containerHeight - oldPageH) / 2;
        const changeX = perfectX === x ? 0 : x - perfectX;
        const changeY = perfectY === y ? 0 : y - perfectY;
        pageListRef.current[activePage].style.transform = getTransformStyle({
          position: {
            x: x + changeX * (change - 1),
            y: y + changeY * (change - 1),
          },
          scale: change,
        });
      }
    },
    [
      activePage,
      frameRef,
      pageListRef,
      pageSize.height,
      pageSize.width,
      pageTransform,
      scale,
    ]
  );

  const pageZoomEnd = useCallback(
    (change: number) => {
      if (
        frameRef.current &&
        transformRef.current.isZoom &&
        pageListRef.current
      ) {
        transformRef.current.isZoom = false;
        let zoom = change;
        const { x, y } = pageTransform;
        const headerHeight = 70;
        const footerHeight = 72;
        const offset = 16;
        const containerWidth = window.innerWidth - offset * 2;
        const containerHeight =
          window.innerHeight - headerHeight - footerHeight - offset * 2;
        let pageW = pageSize.width * scale * zoom;
        if (pageW < containerWidth) {
          zoom = containerWidth / scale / pageSize.width;
          pageW = containerWidth;
        }
        const oldPageW = pageSize.width * scale;
        const pageH = pageSize.height * scale * zoom;
        const oldPageH = pageSize.height * scale;
        const perfectX = (containerWidth - oldPageW) / 2;
        const perfectY = (containerHeight - oldPageH) / 2;
        const changeX =
          (pageW - oldPageW) / 2 -
          (perfectX === x ? 0 : x - perfectX) * (zoom - 1);
        const changeY =
          (pageH - oldPageH) / 2 -
          (perfectY === y ? 0 : y - perfectY) * (zoom - 1);

        const newX = Math.max(
          -(pageW - containerWidth),
          Math.min(x - changeX, 0)
        );
        const newY = Math.max(
          -(pageH - containerHeight / 2),
          Math.min(y - changeY, containerHeight / 2)
        );

        if (zoom > change) {
          //state change doesn't rerender
          pageListRef.current[activePage].style.transform = getTransformStyle({
            position: { x: newX, y: newY },
            scale: 1,
          });
        }
        setPageTransform({ scale: 1, x: newX, y: newY });
        // Use consistent zoom parameters
        const frameWidth = 1920;
        const frameHeight = 1080;
        const padding = 200;
        const targetWidth = frameWidth + padding * 2;
        const targetHeight = frameHeight + padding * 2;
        const referenceViewportWidth = 1400 * 0.75; // 1050 - consistent with new zoom level
        const referenceViewportHeight = 900 * 0.75; // 675 - consistent with new zoom level
        const maxScale = Math.min(
          referenceViewportWidth / targetWidth,
          referenceViewportHeight / targetHeight
        );
        const minScale = 0.01;

        // Apply new zoom limits
        const newScale = Math.min(Math.max(scale * zoom, minScale), maxScale);
        actions.setScale(newScale);
      }
    },
    [
      frameRef,
      pageListRef,
      pageTransform,
      pageSize.width,
      pageSize.height,
      scale,
      actions,
      activePage,
    ]
  );

  // Desktop Ctrl/Cmd + wheel cursor-centered zoom (application-level entry)
  useEffect(() => {
    const onDesktopZoom = (ev: Event) => {
      const e = ev as CustomEvent<{
        factor: number;
        clientX: number;
        clientY: number;
        containerLeft: number;
        containerTop: number;
      }>;

      if (!frameRef.current || !pageListRef.current) return;

      // Compute new scale with same limits used by PageControl defaults
      const newScale = Math.max(0.01, scale * e.detail.factor);

      const pageEl = pageListRef.current[activePage];
      if (!pageEl) return;

      // Cursor position relative to frame container
      const cursorX = e.detail.clientX - e.detail.containerLeft;
      const cursorY = e.detail.clientY - e.detail.containerTop;

      // Use actual DOM offsets (includes margins) instead of state
      const containerRect = frameRef.current.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();
      const offsetX = pageRect.left - containerRect.left; // visual left of page within container
      const offsetY = pageRect.top - containerRect.top; // visual top of page within container
      const wrapperScale = pageTransform.scale || 1; // usually 1

      // Map screen -> content coords before zoom
      const contentX = (cursorX - offsetX) / (scale * wrapperScale);
      const contentY = (cursorY - offsetY) / (scale * wrapperScale);

      // New position to keep the same content point under the cursor
      const newX = cursorX - contentX * (newScale * wrapperScale);
      const newY = cursorY - contentY * (newScale * wrapperScale);

      // Apply immediate style for responsiveness
      pageEl.style.transform = getTransformStyle({
        position: { x: newX, y: newY },
        scale: wrapperScale,
      });

      // Commit state
      setPageTransform({ scale: wrapperScale, x: newX, y: newY });
      actions.setScale(newScale);
    };

    document.addEventListener('lido:zoom', onDesktopZoom as EventListener);
    return () => {
      document.removeEventListener('lido:zoom', onDesktopZoom as EventListener);
    };
  }, [actions, activePage, frameRef, pageListRef, pageTransform, scale]);
  const handleZoomStart = useCallback(
    (e: React.TouchEvent) => {
      const { touches } = e.nativeEvent;
      if (touches.length !== 2) {
        return;
      }
      transformRef.current.touchStart = [touches[0], touches[1]];
      transformRef.current.lastTouch = [touches[0], touches[1]];
      pageZoomStart();
    },
    [pageZoomStart]
  );
  const handleZoomMove = useCallback(
    () =>
      throttle((e: React.TouchEvent) => {
        const { touches } = e.nativeEvent;
        if (touches.length !== 2) {
          return;
        }
        const start = distanceBetweenPoints(
          transformRef.current.touchStart[0],
          transformRef.current.touchStart[1]
        );
        const current = distanceBetweenPoints(touches[0], touches[1]);
        const scale = current / start;
        transformRef.current.lastTouch = [touches[0], touches[1]];
        pageZoomMove(scale);
      }, 16),
    [pageZoomMove]
  );
  const handleZoomEnd = useCallback(
    (e: React.TouchEvent) => {
      const { touches } = e.nativeEvent;
      if (transformRef.current.isZoom) {
        const start = distanceBetweenPoints(
          transformRef.current.touchStart[0],
          transformRef.current.touchStart[1]
        );
        const current = distanceBetweenPoints(
          transformRef.current.lastTouch[0],
          transformRef.current.lastTouch[1]
        );
        const scale = current / start;
        transformRef.current.lastTouch = [touches[0], touches[1]];
        pageZoomEnd(scale);
      }
    },
    [pageZoomEnd]
  );

  const handleMoveStart = (e: TouchEvent) => {
    const { clientX, clientY } = getPosition(e);
    transformRef.current.isMoving = true;
    transformRef.current.start = {
      clientX,
      clientY,
    };
    transformRef.current.last = {
      clientX,
      clientY,
    };
  };
  const handleMove = (e: React.TouchEvent) => {
    if (!transformRef.current.isMoving) {
      return;
    }
    const headerHeight = 70;
    const footerHeight = 72;
    const offset = 16;
    const containerWidth = window.innerWidth - offset * 2;
    const containerHeight =
      window.innerHeight - headerHeight - footerHeight - offset * 2;
    if (
      transformRef.current.isZoom ||
      !transformRef.current.isMoving ||
      containerWidth >= pageSize.width * scale
    )
      return;
    const { clientX, clientY } = getPosition(e.nativeEvent);
    transformRef.current.last = {
      clientX,
      clientY,
    };

    const pageW = pageSize.width * scale;
    const pageH = pageSize.height * scale;
    const x = Math.max(
      -(pageW - containerWidth),
      Math.min(
        pageTransform.x + clientX - transformRef.current.start.clientX,
        0
      )
    );
    const y = Math.max(
      -(pageH - containerHeight / 2),
      Math.min(
        pageTransform.y + clientY - transformRef.current.start.clientY,
        containerHeight / 2
      )
    );
    if (pageListRef.current) {
      pageListRef.current[activePage].style.transform = getTransformStyle({
        position: { x, y },
        scale: pageTransform.scale,
      });
    }
  };

  const handleMoveEnd = () => {
    if (!transformRef.current.isMoving) {
      return;
    }
    const headerHeight = 70;
    const footerHeight = 72;
    const offset = 16;
    const containerWidth = window.innerWidth - offset * 2;
    const containerHeight =
      window.innerHeight - headerHeight - footerHeight - offset * 2;
    if (
      transformRef.current.isZoom ||
      !transformRef.current.isMoving ||
      containerWidth >= pageSize.width * scale
    )
      return;
    const { clientX, clientY } = transformRef.current.last;
    const moveX = clientX - transformRef.current.start.clientX;
    const pageW = pageSize.width * scale;
    const pageH = pageSize.height * scale;
    const x = Math.max(
      -(pageW - containerWidth),
      Math.min(pageTransform.x + moveX, 0)
    );
    const y = Math.max(
      -(pageH - containerHeight / 2),
      Math.min(
        pageTransform.y + clientY - transformRef.current.start.clientY,
        containerHeight / 2
      )
    );
    setPageTransform({ scale: pageTransform.scale, x, y });
    transformRef.current.isMoving = false;
  };

  const handleMovePage = (e: React.TouchEvent) => {
    if (
      !pageContainerRef.current ||
      transformRef.current.isZoom ||
      !transformRef.current.isMoving ||
      isRotating ||
      isResizing ||
      isDragging ||
      openImageEditor ||
      openTextEditor
    )
      return;
    const { clientX, clientY } = getPosition(e.nativeEvent);
    transformRef.current.last = {
      clientX,
      clientY,
    };
    const offset = 16;
    const moveX = clientX - transformRef.current.start.clientX;
    const containerWidth = window.innerWidth - offset * 2;
    if (containerWidth >= pageSize.width * scale) {
      pageContainerRef.current.style.transform = getTransformStyle({
        position: { x: -(window.innerWidth * activePage) + moveX, y: 0 },
      });
    }
  };
  const handleMovePageEnd = () => {
    if (
      !pageContainerRef.current ||
      transformRef.current.isZoom ||
      !transformRef.current.isMoving ||
      isRotating ||
      isResizing ||
      isDragging ||
      openImageEditor ||
      openTextEditor
    )
      return;
    const { clientX } = transformRef.current.last;
    const offset = 16;
    const moveX = clientX - transformRef.current.start.clientX;
    const containerWidth = window.innerWidth - offset * 2;
    if (containerWidth >= pageSize.width * scale) {
      if (
        moveX <= -(window.innerWidth * 0.35) &&
        activePage + 1 <= pageLength - 1
      ) {
        pageContainerRef.current.style.transform = getTransformStyle({
          position: { x: -(window.innerWidth * (activePage + 1)), y: 0 },
        });
        actions.setActivePage(Math.min(activePage + 1, pageLength - 1));
      } else if (moveX >= window.innerWidth * 0.35 && activePage - 1 >= 0) {
        pageContainerRef.current.style.transform = getTransformStyle({
          position: { x: -(window.innerWidth * (activePage - 1)), y: 0 },
        });
        actions.setActivePage(Math.max(activePage - 1, 0));
      } else {
        pageContainerRef.current.style.transform = getTransformStyle({
          position: { x: -(window.innerWidth * activePage), y: 0 },
        });
      }
    }
  };

  useEffect(() => {
    const updateSize = () => {
      if (frameRef.current) {
        // Define fixed 100% zoom level (same as in PageControl)
        const frameWidth = 1920;
        const frameHeight = 1080;
        const padding = 200;
        const targetWidth = frameWidth + padding * 2; // 2320
        const targetHeight = frameHeight + padding * 2; // 1480

        // Use same reference viewport as PageControl for consistency
        // Adjusted to make current 75% zoom level become the new 100%
        const referenceViewportWidth = 1400 * 0.75; // 1050 - makes zoom more zoomed out
        const referenceViewportHeight = 900 * 0.75; // 675 - makes zoom more zoomed out

        const defaultScale = Math.min(
          referenceViewportWidth / targetWidth,
          referenceViewportHeight / targetHeight
        ); // This is our 100% zoom level

        // Set default zoom to exactly 100%
        actions.setScale(defaultScale);

        // Center the viewport on the frame area (center of 10,000x10,000 canvas)
        // The center of the canvas is at (5000, 5000)
        // We want to scroll so that this center area is visible
        if (frameRef.current && !isMobile) {
          setTimeout(() => {
            const canvasCenter = {
              x: pageSize.width / 2, // 5000
              y: pageSize.height / 2, // 5000
            };

            // Calculate scroll position to center the frame area
            if (frameRef.current) {
              const scrollX =
                canvasCenter.x * defaultScale -
                frameRef.current.clientWidth / 2;
              const scrollY =
                canvasCenter.y * defaultScale -
                frameRef.current.clientHeight / 2;

              frameRef.current.scrollLeft = Math.max(0, scrollX);
              frameRef.current.scrollTop = Math.max(0, scrollY);
            }
          }, 100); // Small delay to ensure DOM is ready
        }

        if (isMobile) {
          const x =
            (window.innerWidth - pageSize.width * defaultScale - 16 * 2) / 2;
          const headerHeight = 70;
          const footerHeight = 72;
          const offsetTop = 16;
          const y =
            (window.innerHeight -
              pageSize.height * defaultScale -
              headerHeight -
              footerHeight -
              offsetTop) /
            2;
          setPageTransform({ scale: 1, x, y });
        }
      }
    };
    updateSize();
  }, [actions, frameRef, pageSize, setPageTransform]);
  useEffect(() => {
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
      pageZoomStart();
      document.addEventListener('gesturechange', handleGestureChange);
      document.addEventListener('gestureend', handleGestureEnd, { once: true });
    };
    const handleGestureChange = throttle((e: Event) => {
      pageZoomMove((e as GestureEvent).scale);
      e.preventDefault();
    }, 16);
    const handleGestureEnd = (e: Event) => {
      pageZoomEnd((e as GestureEvent).scale);
      e.preventDefault();
      document.removeEventListener('gesturechange', handleGestureChange);
      document.removeEventListener('gestureend', handleGestureEnd);
    };
    document.addEventListener('gesturestart', handleGestureStart);
    return () => {
      document.removeEventListener('gesturestart', handleGestureStart);
    };
  }, [
    scale,
    pageTransform,
    setPageTransform,
    actions,
    pageZoomStart,
    pageZoomMove,
    pageZoomEnd,
  ]);
  return {
    pageTransform,
    onZoomStart: handleZoomStart,
    onZoomMove: handleZoomMove,
    onZoomEnd: handleZoomEnd,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
    onMovePage: handleMovePage,
    onMovePageEnd: handleMovePageEnd,
  };
};
