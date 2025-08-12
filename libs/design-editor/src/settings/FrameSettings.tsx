import FlipHorizontalFillIcon from '@duyank/icons/fill/FlipHorizontalFill';
import FlipVerticalFillIcon from '@duyank/icons/fill/FlipVerticalFill';
import ArrowClockwiseIcon from '@duyank/icons/regular/ArrowClockwise';
import ArrowCounterClockwiseIcon from '@duyank/icons/regular/ArrowCounterClockwise';
import PencilIcon from '@duyank/icons/regular/Pencil';
import {
  getControlBoxSizeFromLayers,
  GradientStyle,
  LayerComponentProps,
  LayerId,
} from '@lidojs/design-core';
import React, { FC, useMemo } from 'react';
import { useEditor, useSelectedLayers } from '../hooks';
import { FrameLayerProps } from '../layers';
import { Layer } from '../types';
import ColorSettings from './ColorSettings';
import SettingButton from './SettingButton';
import ImageManipulationSidebar from './sidebar/ImageManipulationSidebar';

interface FrameSettingsProps {
  layers: Layer<FrameLayerProps>[];
}

const FrameSettings: FC<FrameSettingsProps> = ({ layers }) => {
  const { selectedLayerIds } = useSelectedLayers();
  const { actions, sidebar, activePage } = useEditor((state) => ({
    activePage: state.activePage,
    sidebar: state.sidebar,
  }));
  const colors = useMemo(() => {
    return layers
      .map((layer) => layer.data.props.color)
      .filter((c): c is string => !!c);
  }, [layers]);
  const gradient = useMemo(() => {
    return layers
      .map((layer) => layer.data.props.gradientBackground)
      .filter((c) => !!c);
  }, [layers]);
  const updateColor = (color: string) => {
    const layerIds = layers.map((l) => l.id);
    actions.history
      .throttle(2000)
      .setProp<FrameLayerProps>(activePage, layerIds, {
        color,
        gradientBackground: null,
      });
  };
  const handleRotateLeft = () => {
    const layerData: Record<
      LayerId,
      Pick<LayerComponentProps, 'position' | 'boxSize' | 'rotate' | 'scale'>
    > = {};
    actions.history.new();
    layers.forEach((layer) => {
      const newRotate = (layer.data.props.rotate - 90 + 360) % 360;
      actions.history.merge().setProp(activePage, layer.id, {
        rotate: newRotate,
      });
      layerData[layer.id] = {
        ...layer.data.props,
        rotate: newRotate,
      };
    });
    actions.setControlBox(getControlBoxSizeFromLayers(layerData));
  };
  const handleRotateRight = () => {
    const layerData: Record<
      LayerId,
      Pick<LayerComponentProps, 'position' | 'boxSize' | 'rotate' | 'scale'>
    > = {};
    actions.history.new();
    layers.forEach((layer) => {
      const newRotate = (layer.data.props.rotate + 90) % 360;
      actions.history.merge().setProp(activePage, layer.id, {
        rotate: newRotate,
      });
      layerData[layer.id] = {
        ...layer.data.props,
        rotate: newRotate,
      };
    });
    actions.setControlBox(getControlBoxSizeFromLayers(layerData));
  };
  const handleFlipHorizontal = () => {
    actions.history.new();
    layers.forEach((layer) => {
      actions.history.merge().setProp<FrameLayerProps>(activePage, layer.id, {
        image: {
          flipHorizontal: !layer.data.props.image.flipHorizontal,
        },
      });
    });
  };
  const handleFlipVertical = () => {
    actions.history.new();
    layers.forEach((layer) => {
      actions.history.merge().setProp<FrameLayerProps>(activePage, layer.id, {
        image: {
          flipVertical: !layer.data.props.image.flipVertical,
        },
      });
    });
  };
  const toggleImageManipulation = () => {
    if (sidebar === 'IMAGE_MANIPULATION') {
      actions.setSidebar();
    } else {
      actions.setSidebar('IMAGE_MANIPULATION');
    }
  };
  const handleChangeGradient = (data: {
    colors: string[];
    style: GradientStyle;
  }) => {
    const layerIds = layers.map((l) => l.id);
    actions.history
      .throttle(2000)
      .setProp<FrameLayerProps>(activePage, layerIds, {
        gradientBackground: data,
        color: null,
      });
  };
  return (
    <div
      css={{
        display: 'grid',
        alignItems: 'center',
        gridAutoFlow: 'column',
        gridGap: 8,
      }}
    >
      {selectedLayerIds.length === 1 &&
        layers.length === 1 &&
        layers[0].data.props.image && (
          <>
            <SettingButton onClick={toggleImageManipulation}>
              <span css={{ fontSize: 20 }}>
                <PencilIcon />
              </span>
              <span css={{ padding: '0 4px' }}>Edit</span>
            </SettingButton>
            <div
              css={{
                height: 24,
                width: `1px`,
                background: 'rgba(57,76,96,.15)',
              }}
            />
            <SettingButton css={{ fontSize: 20 }} onClick={handleRotateLeft}>
              <ArrowCounterClockwiseIcon />
            </SettingButton>
            <SettingButton css={{ fontSize: 20 }} onClick={handleRotateRight}>
              <ArrowClockwiseIcon />
            </SettingButton>
            <div
              css={{
                height: 24,
                width: `1px`,
                background: 'rgba(57,76,96,.15)',
              }}
            />
            <SettingButton
              css={{ fontSize: 20 }}
              onClick={handleFlipHorizontal}
            >
              <FlipHorizontalFillIcon />
            </SettingButton>
            <SettingButton css={{ fontSize: 20 }} onClick={handleFlipVertical}>
              <FlipVerticalFillIcon />
            </SettingButton>
            <div
              css={{
                height: 24,
                width: `1px`,
                background: 'rgba(57,76,96,.15)',
              }}
            />
            {sidebar === 'IMAGE_MANIPULATION' && (
              <ImageManipulationSidebar open={true} />
            )}
          </>
        )}
      <ColorSettings
        colors={colors}
        gradient={gradient.length > 0 ? gradient[0] : null}
        params={{ frame: true }}
        useGradient={true}
        onChange={updateColor}
        onChangeGradient={handleChangeGradient}
      />
    </div>
  );
};

export default FrameSettings;
