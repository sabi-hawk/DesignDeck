// SquaresFourBoldIcon import removed since PageSettings functionality is commented out
// PlusIcon import removed since Add Page functionality is commented out
import {
  getTransformStyle,
  isElementInViewport,
  isPointInsideBox,
  LayerComponentProps,
  rectangleInsideAnother,
  SerializedPage,
  visualCorners,
} from '@lidojs/design-core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { GlobalStyle } from '@lidojs/design-layers';
import { getPosition, isMouseEvent, isTouchEvent } from '@lidojs/design-utils';
import React, {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  // useState removed since PageSettings state is no longer needed
} from 'react';
import { isMobile } from 'react-device-detect';
import { useEditor, useSelectedLayers } from '../hooks';
import useClickOutside from '../hooks/useClickOutside';
import { useDragLayer } from '../hooks/useDragLayer';
import { useSelectLayer } from '../hooks/useSelectLayer';
import useShortcut from '../hooks/useShortcut';
import { useTrackingShiftKey } from '../hooks/useTrackingShiftKey';
import { useZoomPage } from '../hooks/useZoomPage';
import LayerContextMenu from '../layers/core/context-menu/LayerContextMenu';
import SelectionBox from '../layers/core/SelectionBox';
import { useUsedFont } from '../layers/hooks/useUsedFont';
// PageSettings import removed since it's no longer needed for single canvas approach
// import PageSettings from '../settings/PageSettings';
import DesignPage from './DesignPage';
import { DraggingLayer } from './dragging/DraggingLayer';
import { EditorContext } from './EditorContext';
import Timeline from './timeline/Timeline';

interface DesignFrameProps {
  data: SerializedPage[];
}

const DesignFrame: FC<DesignFrameProps> = ({ data }) => {
  const shiftKeyRef = useTrackingShiftKey();
  const frameRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement[]>([]);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const draggingItemRef = useRef<HTMLDivElement>(null);
  const { usedFonts } = useUsedFont();
  const [showTimeline, setShowTimeline] = useState(true);
  const {
    config: { assetPath },
  } = useContext(EditorContext);
  // PageSettings state removed since it's no longer needed for single canvas approach
  // const [showPageSettings, setShowPageSettings] = useState(false);
  useShortcut(frameRef);
  const {
    actions,
    scale,
    pages,
    hoveredPage,
    hoveredLayer,
    selectStatus,
    rotateData,
    resizeData,
    controlBox,
    activePage,
    dragData,
    imageEditor,
    pageSize,
    dragNDrop,
  } = useEditor((state, query) => {
    const hoveredPage = parseInt(Object.keys(state.hoveredLayer)[0]);
    const hoverLayerId = state.hoveredLayer[hoveredPage];
    return {
      scale: state.scale,
      pages: state.pages,
      hoveredPage,
      hoveredLayer: hoverLayerId
        ? state.pages[hoveredPage].layers[hoverLayerId]
        : null,
      selectStatus: state.selectData.status,
      rotateData: state.rotateData,
      resizeData: state.resizeData,
      controlBox: state.controlBox,
      activePage: state.activePage,
      dragData: state.dragData,
      imageEditor: state.imageEditor,
      pageSize: query.getPageSize(),
      dragNDrop: state.dragNDrop,
    };
  });
  const {
    pageTransform,
    onZoomStart,
    onZoomMove,
    onZoomEnd,
    onMoveStart,
    onMove,
    onMoveEnd,
    onMovePage,
    onMovePageEnd,
  } = useZoomPage(frameRef, pageRef, pageContainerRef);
  useEffect(() => {
    actions.setData(data);
  }, [data, actions]);

  useClickOutside(
    contextMenuRef,
    () => {
      actions.hideContextMenu();
    },
    'mousedown',
    { capture: true }
  );

  useEffect(() => {
    const drop = () => {
      actions.endDragNDrop();
    };
    window.addEventListener('dragend', drop);
    return () => {
      window.removeEventListener('dragend', drop);
    };
  });
  const boxRef = useRef<HTMLDivElement>(null);
  const { selectedLayerIds } = useSelectedLayers();

  const handleScroll = () => {
    if (!dragData.status && !selectStatus) {
      const viewport = frameRef.current as HTMLDivElement;
      //change active page
      if (
        pageRef.current[activePage] &&
        !isElementInViewport(viewport, pageRef.current[activePage])
      ) {
        pageRef.current.some((page, pageIndex) => {
          if (isElementInViewport(viewport, page)) {
            actions.selectLayers(pageIndex, 'ROOT');
            return true;
          }
          return false;
        });
      }
    }
  };

  const { tmpSelected, onSelectStart } = useSelectLayer({
    frameRef: frameRef,
    pageListRef: pageRef,
    selectionBoxRef: boxRef,
  });

  const { onDragStart } = useDragLayer({
    frameRef,
    pageListRef: pageRef,
  });

  useEffect(() => {
    const updatePosition = (e: DragEvent) => {
      if (draggingItemRef.current) {
        draggingItemRef.current.style.top = `${
          e.clientY -
          ((
            dragNDrop.data.layers[dragNDrop.data.rootId]
              .props as unknown as LayerComponentProps
          ).boxSize.height *
            scale) /
            2
        }px`;
        draggingItemRef.current.style.left = `${
          e.clientX -
          ((
            dragNDrop.data.layers[dragNDrop.data.rootId]
              .props as unknown as LayerComponentProps
          ).boxSize.width *
            scale) /
            2
        }px`;
      }
    };
    window.addEventListener('dragover', updatePosition);
    return () => {
      window.removeEventListener('dragover', updatePosition);
    };
  }, [actions, dragNDrop?.data?.layers, dragNDrop?.data?.rootId, scale]);

  const handMouseDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (
        (isMouseEvent(e) && e.button === 2) ||
        imageEditor ||
        (isTouchEvent(e) && e.touches.length > 1)
      ) {
        return;
      }
      const isClickPage = pageRef.current.find((page) =>
        page.contains(e.target as Node)
      );
      const isClickOutPage = pageRef.current.find((page) =>
        (e.target as Node).contains(page)
      );
      const { clientX, clientY } = getPosition(e);
      if (!isClickPage && !isClickOutPage) {
        return;
      }

      let isInsideControlBox = false;
      if (controlBox) {
        const matrix = new WebKitCSSMatrix(
          getTransformStyle({
            rotate: controlBox.rotate,
          })
        );
        const rect = pageRef.current[activePage].getBoundingClientRect();
        const controlBoxCorner = visualCorners(
          {
            width: controlBox.boxSize.width * scale,
            height: controlBox.boxSize.height * scale,
          },
          matrix,
          {
            x: rect.x + controlBox.position.x * scale,
            y: rect.y + controlBox.position.y * scale,
          }
        );
        isInsideControlBox = isPointInsideBox(
          { x: clientX, y: clientY },
          controlBoxCorner
        );
      }
      if (
        hoveredLayer &&
        hoveredLayer.id !== 'ROOT' &&
        !selectedLayerIds.includes(hoveredLayer.id)
      ) {
        if (
          !isInsideControlBox ||
          (controlBox &&
            rectangleInsideAnother(hoveredLayer.data.props, controlBox))
        ) {
          actions.selectLayers(
            hoveredPage,
            hoveredLayer.id,
            shiftKeyRef.current ? 'add' : 'replace'
          );
        }
      }
      if (
        (hoveredLayer &&
          hoveredLayer.id !== 'ROOT' &&
          !hoveredLayer.data.locked) ||
        isInsideControlBox
      ) {
        onDragStart(e);
        e.stopPropagation();
      } else if (isMouseEvent(e)) {
        onSelectStart(e);
        e.stopPropagation();
      } else if (isTouchEvent(e)) {
        onMoveStart(e);
      }
    },
    [hoveredLayer, controlBox, selectedLayerIds, dragData]
  );

  const cursorCSS = () => {
    if (rotateData.status) {
      const cursor = Math.round((rotateData.rotate || 0) / 10);
      return {
        cursor: `url('${assetPath}/cursors/rotate/${
          cursor === 36 ? 0 : cursor
        }.png') 12 12, auto;`,
      };
    } else if (resizeData.status) {
      const rd = {
        bottomLeft: 45,
        left: 90,
        topLeft: 135,
        top: 180,
        topRight: 225,
        right: 270,
        bottomRight: 315,
        bottom: 0,
      };
      const rotate =
        (resizeData.rotate || 0) + rd[resizeData.direction || 'bottom'] + 90;
      const file = Math.round((rotate % 180) / 10);
      return {
        cursor: `url('${assetPath}/cursors/resize/${file}.png') 12 12, auto`,
      };
    } else if (dragData.status) {
      return {
        cursor: 'move',
      };
    }
    return {};
  };

  useEffect(() => {
    // Make timeline control globally accessible
    (window as any).showTimeline = () => setShowTimeline(true);
    (window as any).hideTimeline = () => setShowTimeline(false);
    
    return () => {
      delete (window as any).showTimeline;
      delete (window as any).hideTimeline;
    };
  }, []);

  return (
    <Fragment>
      <div
        ref={frameRef}
        css={{
          display: 'flex',
          position: 'relative',
          height: '100%',
          overflow: 'scroll',
          ...cursorCSS(),
          '@media (max-width: 900px)': {
            overflow: 'hidden',
            height: 'calc(100% - 72px)',
          },
        }}
        tabIndex={0}
        onScroll={() => {
          handleScroll();
        }}
        onTouchEnd={onZoomEnd}
        onTouchMove={onZoomMove}
        onTouchStart={onZoomStart}
      >
        {/* Timeline Component */}
        <Timeline 
          isVisible={showTimeline} 
          onToggle={() => setShowTimeline(!showTimeline)} 
        />
        
        {/* Rest of the component */}
        <div
          css={{
            position: 'relative',
            display: 'flex',
            minWidth: '100%',
            minHeight: '100%',
          }}
          onMouseDown={(e) => handMouseDown(e.nativeEvent)}
          onTouchStart={(e) => handMouseDown(e.nativeEvent)}
        >
          <div
            css={{
              position: 'relative',
              display: 'flex',
              flexGrow: 1,
              touchAction: 'pinch-zoom',
            }}
          >
            <div
              ref={pageContainerRef}
              css={{
                display: 'flex',
                position: 'relative',
                flexDirection: 'row',
                justifyContent: 'center',
                margin: 'auto',
                '@media (max-width: 900px)': {
                  transition: 'transform 250ms linear 0s',
                  margin: 'initial',
                },
              }}
              style={{
                transform: `translateX(-${
                  isMobile ? window.innerWidth * activePage : 0
                }px)`,
              }}
            >
              <div
                css={{
                  marginLeft: 56,
                  '@media (max-width: 900px)': {
                    display: 'flex',
                    marginLeft: 0,
                  },
                }}
                onTouchEnd={() => {
                  onMoveEnd();
                  onMovePageEnd();
                }}
                onTouchMove={(e) => {
                  onMove(e);
                  onMovePage(e);
                }}
              >
                <GlobalStyle fonts={usedFonts} mode={'editor'} />
                {pages.map((_, index) => (
                  <div
                    key={index}
                    css={{
                      '@media (max-width: 900px)': {
                        padding: '0 16px',
                        width: window.innerWidth,
                        height: window.innerHeight,
                        overflow: 'hidden',
                      },
                    }}
                  >
                    <DesignPage
                      ref={(el) => el && (pageRef.current[index] = el)}
                      height={pageSize.height}
                      pageIndex={index}
                      transform={pageTransform}
                      width={pageSize.width}
                    />
                  </div>
                ))}
                {/* Commented out Add Page functionality for single canvas approach
                <div
                  css={{
                    marginTop: 20,
                    marginBottom: 20,
                    background: 'rgba(64,87,109,.07)',
                    color: '#0d1216',
                    width: pageSize.width * scale,
                    textAlign: 'center',
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 8,
                    '@media (max-width: 900px)': {
                      display: 'none',
                    },
                  }}
                  onClick={() => {
                    actions.addPage();
                  }}
                >
                  Add Page
                </div>
                */}
              </div>
              <div
                css={{
                  width: 56,
                  pointerEvents: 'none',
                  '@media (max-width: 900px)': {
                    width: 0,
                  },
                }}
              />
            </div>
            <LayerContextMenu ref={contextMenuRef} />
            {selectStatus && (
              <SelectionBox
                ref={boxRef}
                selectedLayers={tmpSelected?.selectedLayers}
              />
            )}
          </div>
        </div>
        {/* Commented out mobile Add Page button for single canvas approach
        <div
          css={{
            display: 'none',
            '@media (max-width: 900px)': {
              pointerEvents: 'auto',
              display: 'flex',
              position: 'absolute',
              bottom: 24,
              left: 24,
              background: '#3d8eff',
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: '#fff',
              fontSize: 24,
            },
          }}
          onClick={() => {
            actions.addPage();
          }}
        >
          <PlusIcon />
        </div>
        */}
        {/* PageSettings button removed since it's no longer needed for single canvas approach
        <div
          css={{
            display: 'none',
            '@media (max-width: 900px)': {
              pointerEvents: 'auto',
              display: 'flex',
              position: 'absolute',
              bottom: 24,
              right: 24,
              background: '#fff',
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontSize: 24,
              boxShadow:
                '0 0 0 1px rgba(64,87,109,.07),0 2px 12px rgba(53,71,90,.2)',
            },
          }}
          onClick={() => {
            // setShowPageSettings(true);
          }}
        >
          <SquaresFourBoldIcon />
        </div>
        */}
      </div>
      {/* {showPageSettings && (
        <PageSettings onClose={() => setShowPageSettings(false)} />
      )} */}
      {dragNDrop.status && (
        <div
          ref={draggingItemRef}
          css={{
            position: 'fixed',
            zIndex: 2048,
            top:
              dragNDrop.position.y -
              ((
                dragNDrop.data.layers[dragNDrop.data.rootId]
                  .props as unknown as LayerComponentProps
              ).boxSize.height *
                scale) /
                2,
            left:
              dragNDrop.position.x -
              ((
                dragNDrop.data.layers[dragNDrop.data.rootId]
                  .props as unknown as LayerComponentProps
              ).boxSize.width *
                scale) /
                2,
            pointerEvents: 'none',
          }}
        >
          <DraggingLayer
            layers={dragNDrop.data.layers}
            parentId={dragNDrop.data.rootId}
          />
        </div>
      )}
    </Fragment>
  );
};

export default DesignFrame;
