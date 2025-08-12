import DuplicateIcon from '@duyank/icons/external/Duplicate';
import CaretDownIcon from '@duyank/icons/regular/CaretDown';
import CaretUpIcon from '@duyank/icons/regular/CaretUp';
import DownloadIcon from '@duyank/icons/regular/Download';
import FilePlusIcon from '@duyank/icons/regular/FilePlus';
import LockKeyIcon from '@duyank/icons/regular/LockKey';
import LockKeyOpenIcon from '@duyank/icons/regular/LockKeyOpen';
import TrashIcon from '@duyank/icons/regular/Trash';
import {
  autoCorrectDegree,
  boundingRect,
  BoxData,
  Direction,
  getControlBoxSizeFromLayers,
  getImageSize,
  getTransformStyle,
  getVirtualDomHeight,
  isPointInsideBox,
  LayerComponentProps,
  LayerId,
  PageProvider,
  RotateCallbackData,
  useResizeLayer,
  useRotateLayer,
  visualCorners,
} from '@lidojs/design-core';
import {
  getPosition,
  mergeWithoutArray,
  useLinkedRef,
} from '@lidojs/design-utils';
import { toPng } from 'html-to-image';
import { cloneDeep, throttle } from 'lodash';
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import ImageEditor from '../common/image-editor/ImageEditor';
import TextEditor from '../common/text-editor/TextEditor';
import ControlBox from '../control-layer/ControlBox';
import Guideline from '../control-layer/Guideline';
import Toolbar from '../control-layer/Toolbar';
import { useEditor, useSelectedLayers } from '../hooks';
import { ImageLayerProps } from '../layers';
import LayerBorderBox from '../layers/core/LayerBorderBox';
import PageElement from '../layers/core/PageElement';
import { useDisabledFeatures } from '../layers/hooks/useDisabledFeatures';
import { LayerDataRef } from '../types';
import {
  getRandomId,
  isImageLayer,
  isTextLayer,
} from '../ultils/layer/layers';
import { EditorContext } from './EditorContext';

export interface PageProps {
  pageIndex: number;
  width: number;
  height: number;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
}

const DesignPage: ForwardRefRenderFunction<HTMLDivElement, PageProps> = (
  { pageIndex, width, height, transform },
  ref
) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const [controlBoxRef] = useLinkedRef<HTMLDivElement>(null);
  const layerBorderRef = useRef<Record<LayerId, HTMLDivElement>>({});
  const { uploadImage } = useContext(EditorContext);
  const [controlBoxData, getControlBoxData, setControlBoxData] =
    useLinkedRef<BoxData>();
  const [layerData, getLayerData, setLayerData] = useLinkedRef<LayerDataRef>(
    {}
  );
  const { selectedLayerIds, selectedLayers } = useSelectedLayers();
  const disabled = useDisabledFeatures();
  const {
    actions,
    query,
    hoveredLayer,
    scale,
    activePage,
    pageSize,
    controlBox,
    imageEditor,
    textEditor,
    totalPages,
    isLocked,
  } = useEditor((state, query) => {
    const hoverLayerId = state.hoveredLayer[pageIndex];
    return {
      activePage: state.activePage,
      controlBox: state.controlBox,
      pageSize: query.getPageSize(),
      scale: state.scale,
      isLocked:
        state.pages[pageIndex] &&
        state.pages[pageIndex].layers.ROOT.data.locked,
      hoveredLayer: hoverLayerId
        ? state.pages[pageIndex].layers[hoverLayerId]
        : null,
      selectStatus: state.selectData.status,
      imageEditor: state.imageEditor,
      textEditor: state.textEditor,
      totalPages: state.pages.length,
    };
  });
  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hoveredLayer && hoveredLayer.data.locked) {
      return;
    }
    if (controlBox && pageRef.current && hoveredLayer) {
      const matrix = new WebKitCSSMatrix(
        getTransformStyle({
          rotate: controlBox.rotate,
        })
      );
      const rect = pageRef.current.getBoundingClientRect();
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
      if (!isPointInsideBox({ x: e.clientX, y: e.clientY }, controlBoxCorner)) {
        actions.selectLayers(pageIndex, hoveredLayer.id);
      }
    } else if (hoveredLayer) {
      actions.selectLayers(pageIndex, hoveredLayer.id);
    }
    actions.showContextMenu(getPosition(e.nativeEvent));
  };

  useEffect(() => {
    if (controlBoxData.current) {
      setControlBoxData({
        boxSize: {
          width: controlBoxData.current.boxSize.width * scale,
          height: controlBoxData.current.boxSize.height * scale,
        },
        position: {
          x: controlBoxData.current.position.x * scale,
          y: controlBoxData.current.position.y * scale,
        },
        rotate: controlBoxData.current.rotate,
        scale: controlBoxData.current.scale,
      });
    }
    if (layerData.current) {
      Object.entries(layerData.current).forEach(([layerId, layer]) => {
        if (layer.centerX) {
          layerData.current[layerId].centerX = layer.centerX * scale;
        }
        if (layer.centerY) {
          layerData.current[layerId].centerY = layer.centerY * scale;
        }
        layerData.current[layerId].position.x = layer.position.x * scale;
        layerData.current[layerId].position.y = layer.position.y * scale;
        layerData.current[layerId].boxSize.width = layer.boxSize.width * scale;
        layerData.current[layerId].boxSize.height =
          layer.boxSize.height * scale;
      });
    }
  }, [controlBoxData, layerData, scale, setControlBoxData]);

  const handleAutoGrow = (direction: Direction, data: BoxData) => {
    if (
      disabled.scalable ||
      !['top', 'left', 'right', 'bottom'].includes(direction) ||
      selectedLayerIds.length > 1 ||
      !isTextLayer(selectedLayers[0])
    ) {
      const returnData = cloneDeep(data);
      if (data.position.x <= 2 && data.position.x >= -2) {
        returnData.position.x = 0;
        returnData.boxSize.width += data.position.x;
      }
      if (data.position.y <= 2 && data.position.y >= -2) {
        returnData.position.y = 0;
        returnData.boxSize.height += data.position.y;
      }
      if (
        data.position.x + data.boxSize.width <= pageSize.width + 2 &&
        data.position.x + data.boxSize.width >= pageSize.width - 2
      ) {
        const change = pageSize.width - (data.position.x + data.boxSize.width);
        returnData.boxSize.width = data.boxSize.width + change;
      }
      if (
        data.position.y + data.boxSize.height <= pageSize.height + 2 &&
        data.position.y + data.boxSize.height >= pageSize.height - 2
      ) {
        const change =
          pageSize.height - (data.position.y + data.boxSize.height);
        returnData.boxSize.height = data.boxSize.height + change;
      }
      return returnData;
    } else {
      const { clientHeight } = getVirtualDomHeight(
        selectedLayers[0].data.editor?.dom as Element,
        data.boxSize.width,
        data.scale || 1
      );
      return mergeWithoutArray(data, {
        boxSize: { height: clientHeight },
      });
    }
  };
  const newLayerData = (change: BoxData) => {
    const layerData = getLayerData();
    const oldData = getControlBoxData() as BoxData;
    const ratio = change.boxSize.width / oldData.boxSize.width;
    const response: Record<LayerId, BoxData> = {};
    selectedLayers.forEach(({ id }) => {
      const layer = layerData[id];
      const newSize = {
        width: layer.boxSize.width * ratio,
        height: layer.boxSize.height * ratio,
      };
      response[id] = {
        position: {
          x:
            oldData.position.x -
            (oldData.position.x - layer.position.x) * ratio +
            (change.position.x - oldData.position.x),
          y:
            oldData.position.y -
            (oldData.position.y - layer.position.y) * ratio +
            (change.position.y - oldData.position.y),
        },
        boxSize: newSize,
        scale:
          typeof layer.scale !== 'undefined' ? layer.scale * ratio : undefined,
        rotate: layer.rotate,
      };
    });
    return response;
  };

  const convertBoxSizeToLayerSize = (
    direction: Direction,
    useShift: boolean,
    data: BoxData
  ) => {
    if (selectedLayerIds.length === 1) {
      const whenOtherLayersLocked =
        ['top', 'left', 'right', 'bottom'].includes(direction) &&
        !isImageLayer(selectedLayers[0]);

      const whenImageLayerLocked =
        (isImageLayer(selectedLayers[0])) &&
        !['top', 'left', 'right', 'bottom'].includes(direction) &&
        !useShift;

      return {
        layers: {
          [selectedLayerIds[0]]: data,
        },
        lockAspect: whenImageLayerLocked || whenOtherLayersLocked,
      };
    } else {
      return {
        layers: newLayerData(data),
        lockAspect: true,
      };
    }
  };

  const handleResize = (
    direction: Direction,
    useShift: boolean,
    data: BoxData
  ) => {
    const normalizeSize = handleAutoGrow(direction, data);
    const resizeData = convertBoxSizeToLayerSize(
      direction,
      useShift,
      normalizeSize
    );
    actions.setControlBox(normalizeSize);
    Object.entries(resizeData.layers).forEach(([layerId, newSize]) => {
      const l = selectedLayers.find((l) => l.id === layerId);
      if (l) {
        if (isImageLayer(l)) {
          const changeX =
            newSize.boxSize.width - layerData.current[layerId].boxSize.width;
          const changeY =
            newSize.boxSize.height - layerData.current[layerId].boxSize.height;
          const props = layerData.current[
            layerId
          ] as unknown as ImageLayerProps;
          if (!resizeData.lockAspect) {
            const imageSize = getImageSize(props, props.image, direction, {
              width: changeX,
              height: changeY,
            });
            actions.history.merge().setProp(pageIndex, layerId, {
              ...imageSize,
              position: {
                x: newSize.position.x,
                y: newSize.position.y,
              },
            });
          } else {
            const ratio = newSize.boxSize.width / l.data.props.boxSize.width;
            actions.history
              .merge()
              .setProp<ImageLayerProps>(pageIndex, layerId, {
                ...newSize,
                image: {
                  boxSize: {
                    width: l.data.props.image.boxSize.width * ratio,
                    height: l.data.props.image.boxSize.height * ratio,
                  },
                  position: {
                    x: l.data.props.image.position.x * ratio,
                    y: l.data.props.image.position.y * ratio,
                  },
                  rotate: 0,
                },
              });
          }
        } else {
          actions.history.merge().setProp(pageIndex, layerId, newSize);
        }
      }
    });
  };

  const { startResizing } = useResizeLayer({
    options: {
      scalable: !disabled.scalable,
    },
    frameScale: scale,
    getLayerData,
    controlBox,
    getControlBoxData,
    lockAspect: (data) => {
      const isSelectedImage =
        selectedLayers.length === 1 && isImageLayer(selectedLayers[0]);

      return (
        !(data.shiftKey && (isSelectedImage)) ||
        selectedLayerIds.length > 1 ||
        ((isSelectedImage) &&
          !data.shiftKey &&
          !['top', 'left', 'right', 'bottom'].includes(data.direction))
      );
    },
    onResizeStart: (e, { direction }) => {
      const { clientX, clientY } = getPosition(e);
      actions.setResizeData(
        true,
        selectedLayerIds,
        direction,
        controlBox.rotate,
        controlBox.boxSize,
        {
          clientX,
          clientY,
        }
      );
      setControlBoxData(controlBox);
      const layers: LayerDataRef = {};
      selectedLayers.forEach(
        ({
          id,
          data: {
            props: { boxSize, position, rotate, scale, ...rest },
            type,
          },
        }) => {
          layers[id] = cloneDeep({
            boxSize,
            position,
            rotate,
            scale,
            type,
            ...rest,
          });
        }
      );
      setLayerData(layers);
      actions.history.new();
    },
    onResize: throttle((e, { direction, useShift }, data) => {
      /*
      hide tooltip due to performance issue
      const { clientX, clientY } = getPosition(e);
      actions.setResizeData(
        true,
        selectedLayerIds,
        direction,
        data.rotate,
        data.boxSize,
        {
          clientX,
          clientY,
        }
      );*/
      handleResize(direction, useShift, data);
    }, 16),
    onResizeStop: (_, { direction, useShift }, data) => {
      actions.setResizeData(false);
      handleResize(direction, useShift, data);
    },
  });
  useEffect(() => {
    const layerRecords = selectedLayers
      .filter((layer) => layer.id !== 'ROOT')
      .reduce((acc, layer) => {
        acc[layer.id] = layer.data.props;
        return acc;
      }, {} as Record<LayerId, LayerComponentProps>);
    actions.setControlBox(getControlBoxSizeFromLayers(layerRecords));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedLayerIds), scale]);

  const handleRotate = (
    rotate: number,
    { controlBox, layers }: RotateCallbackData
  ) => {
    actions.setRotateData(true, rotate);
    actions.setControlBox(controlBox);
    Object.entries(layers).forEach(([layerId, data]) => {
      actions.history.merge().setProp(pageIndex, layerId, data);
    });
  };
  const handleRotateEnd = (
    rotate: number,
    { controlBox, layers }: RotateCallbackData
  ) => {
    actions.setRotateData(false);
    actions.setControlBox(controlBox);
    Object.entries(layers).forEach(([layerId, data]) => {
      actions.history.merge().setProp(pageIndex, layerId, data);
    });
  };
  const { startRotate } = useRotateLayer({
    getLayerData,
    frameScale: scale,
    pageOffset: {
      x: pageRef.current?.getBoundingClientRect().x || 0,
      y: pageRef.current?.getBoundingClientRect().y || 0,
    },
    getControlBoxData,
    setControlBoxData,
    onRotateStart: () => {
      const layerData: LayerDataRef = {};
      selectedLayers.forEach((layer) => {
        const { centerX, centerY } = boundingRect(
          layer.data.props.boxSize,
          layer.data.props.position,
          layer.data.props.rotate
        );
        layerData[layer.id] = cloneDeep({
          position: layer.data.props.position,
          boxSize: layer.data.props.boxSize,
          rotate: layer.data.props.rotate,
          scale: layer.data.props.scale,
          centerX: centerX,
          centerY: centerY,
          type: layer.data.type,
        });
      });
      setControlBoxData(controlBox);
      setLayerData(layerData);
      actions.setRotateData(true, autoCorrectDegree(controlBox.rotate));
      actions.history.new();
    },
    onRotate: handleRotate,
    onRotateEnd: handleRotateEnd,
  });

  const handleDownload = async (pageIndex: number) => {
    if (displayRef.current) {
      try {
        const dataUrl = await toPng(displayRef.current);
        const link = document.createElement('a');
        link.download = `design-id-page-${pageIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
      } catch (e) {
        window.alert('Cannot download: ' + (e as Error).message);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const { clientX, clientY } = e;

      const imageTypes = ['image/png', 'image/gif', 'image/bmp', 'image/jpeg'];
      if (
        e.dataTransfer &&
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0
      ) {
        const fileType = e.dataTransfer.files[0].type;
        if (imageTypes.includes(fileType)) {
          const { url, thumb } = await uploadImage(e.dataTransfer.files[0]);
          const img = new Image();
          img.onload = () => {
            const id = getRandomId();
            const pageSize = query.getPageSize();
            const ratio = pageSize.width / pageSize.height;
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const rect = pageRef.current.getBoundingClientRect();
            const w =
              ratio < imgRatio
                ? pageSize.width * 0.8
                : pageSize.height * imgRatio * 0.8;
            const h = w / imgRatio;
            const x = (clientX - rect.x) / scale - w / 2;
            const y = (clientY - rect.y) / scale - h / 2;
            const data = {
              rootId: id,
              layers: {
                [id]: {
                  type: {
                    resolvedName: 'ImageLayer',
                  },
                  props: {
                    image: {
                      url: url,
                      thumb: thumb,
                      boxSize: {
                        width: w,
                        height: h,
                      },
                      position: {
                        x: 0,
                        y: 0,
                      },
                      rotate: 0,
                    },
                    position: {
                      x: 0,
                      y: 0,
                    },
                    boxSize: {
                      width: w,
                      height: h,
                    },
                    rotate: 0,
                  },
                  locked: false,
                  parent: 'ROOT',
                  child: [],
                },
              },
            };
            actions.dropLayer(data, pageIndex, { x, y });
          };
          img.src = url;
        }
      } else if (e.dataTransfer.getData('text/plain')) {
        const rect = pageRef.current.getBoundingClientRect();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const x =
          (clientX - rect.x) / scale -
          data.data.layers[data.data.rootId].props.boxSize.width / 2;
        const y =
          (clientY - rect.y) / scale -
          data.data.layers[data.data.rootId].props.boxSize.height / 2;
        actions.dropLayer(data.data, pageIndex, { x, y });
        actions.endDragNDrop();
      }
    },
    [actions, pageIndex, scale]
  );

  return (
    <PageProvider pageIndex={pageIndex}>
      <div
        css={{
          fontWeight: 'bold',
          marginTop: 24,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 4,
          width: width * scale,
          whiteSpace: 'nowrap',
          '@media (max-width: 900px)': {
            display: 'none',
          },
        }}
      >
        <div css={{ flexGrow: 1 }}>Page {pageIndex + 1}</div>
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 20,
            color: '#0d1216',
            height: 28,
            opacity: 0.7,
          }}
        >
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
              color: pageIndex === 0 ? 'rgba(36,49,61,.4)' : '#0d1216',
              ':hover': {
                background:
                  pageIndex === 0 ? undefined : 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() => actions.movePageUp(pageIndex)}
          >
            <CaretUpIcon />
          </div>
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: pageIndex === totalPages - 1 ? 'not-allowed' : 'pointer',
              color:
                pageIndex === totalPages - 1 ? 'rgba(36,49,61,.4)' : '#0d1216',
              ':hover': {
                background:
                  pageIndex === totalPages - 1
                    ? undefined
                    : 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() => actions.movePageDown(pageIndex)}
          >
            <CaretDownIcon />
          </div>
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() => {
              isLocked
                ? actions.unlockPage(pageIndex)
                : actions.lockPage(pageIndex);
            }}
          >
            {!isLocked && <LockKeyOpenIcon />}
            {isLocked && <LockKeyIcon />}
          </div>
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() => actions.duplicatePage(pageIndex)}
          >
            <DuplicateIcon />
          </div>
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() => handleDownload(pageIndex)}
          >
            <DownloadIcon />
          </div>
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: isLocked || totalPages <= 1 ? 'not-allowed' : 'pointer',
              color:
                isLocked || totalPages <= 1 ? 'rgba(36,49,61,.4)' : '#0d1216',
              ':hover': {
                background:
                  isLocked || totalPages <= 1
                    ? undefined
                    : 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() =>
              !isLocked && totalPages > 1 && actions.deletePage(pageIndex)
            }
          >
            <TrashIcon />
          </div>
          <div
            css={{
              marginLeft: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(64, 87, 109, 0.07)',
              },
            }}
            onClick={() => actions.addPage(pageIndex)}
          >
            <FilePlusIcon />
          </div>
        </div>
      </div>
      <div
        ref={ref}
        css={{
          position: 'relative',
          margin: 0,
          boxShadow: '0 2px 8px rgba(14,19,24,.07)',
          '@media (max-width: 900px)': {
            boxShadow: 'none',
          },
        }}
        style={{
          width: width * scale * transform.scale,
          height: height * scale * transform.scale,
          transform: getTransformStyle({
            position: transform,
            scale: transform.scale,
          }),
        }}
      >
        <div
          ref={pageRef}
          css={{
            userSelect: 'none',
            background: 'white',
            overflow: 'hidden',
            transformOrigin: '0 0',
          }}
          id={`lidojs-page-${pageIndex}`}
          style={{
            width: width,
            height: height,
            transform: `scale(${scale * transform.scale})`,
          }}
          onContextMenu={openContextMenu}
        >
          <div
            ref={displayRef}
            css={{
              width,
              height,
              position: 'relative',
              left: 0,
              top: 0,
              zIndex: 1,
              '@media (max-width: 900px)': {
                width: width * scale,
                height: height * scale,
              },
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <PageElement />
          </div>
        </div>

        <div
          css={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {!imageEditor &&
            pageIndex === activePage &&
            controlBox &&
            selectedLayers.length > 1 && (
              <LayerBorderBox
                boxSize={controlBox.boxSize}
                position={controlBox.position}
                rotate={controlBox.rotate}
                type={'dashed'}
              />
            )}
          {!imageEditor &&
            pageIndex === activePage &&
            selectedLayers.map((layer) => (
              <LayerBorderBox
                key={layer.id}
                ref={(el) => el && (layerBorderRef.current[layer.id] = el)}
                boxSize={layer.data.props.boxSize}
                layerType={layer.data.type}
                position={layer.data.props.position}
                rotate={layer.data.props.rotate}
              />
            ))}
          {!imageEditor &&
            hoveredLayer &&
            !selectedLayerIds.includes(hoveredLayer.id) && (
              <LayerBorderBox
                ref={(el) =>
                  el && (layerBorderRef.current[hoveredLayer.id] = el)
                }
                boxSize={hoveredLayer.data.props.boxSize}
                position={hoveredLayer.data.props.position}
                rotate={hoveredLayer.data.props.rotate}
              />
            )}
          {!imageEditor &&
            pageIndex === activePage &&
            selectedLayerIds.length > 0 && (
              <Fragment>
                {controlBox &&
                  !(
                    selectedLayerIds.length === 1 &&
                    selectedLayers[0].data.type === 'Line'
                  ) && (
                    <ControlBox
                      ref={controlBoxRef}
                      boxSize={controlBox.boxSize}
                      disabled={disabled}
                      locked={disabled.locked}
                      position={controlBox.position}
                      rotate={controlBox.rotate}
                      scale={controlBox.scale}
                      onResizeStart={startResizing}
                      onRouteStart={startRotate}
                    />
                  )}
                <Toolbar />
              </Fragment>
            )}
          {pageIndex === activePage && <Guideline />}
        </div>
        {imageEditor && imageEditor.pageIndex === pageIndex && <ImageEditor />}
        {textEditor && textEditor.pageIndex === pageIndex && <TextEditor />}
      </div>
    </PageProvider>
  );
};

export default forwardRef<HTMLDivElement, PageProps>(DesignPage);
