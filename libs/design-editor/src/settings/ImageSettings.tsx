import FlipHorizontalFillIcon from '@duyank/icons/fill/FlipHorizontalFill';
import FlipVerticalFillIcon from '@duyank/icons/fill/FlipVerticalFill';
import ArrowClockwiseIcon from '@duyank/icons/regular/ArrowClockwise';
import ArrowCounterClockwiseIcon from '@duyank/icons/regular/ArrowCounterClockwise';
import PencilIcon from '@duyank/icons/regular/Pencil';
import {
  getControlBoxSizeFromLayers,
  LayerComponentProps,
  LayerId,
} from '@lidojs/design-core';
import React, { FC } from 'react';
import { useEditor } from '../hooks';
import { ImageLayerProps } from '../layers';
import { Layer } from '../types';
import SettingButton from './SettingButton';
import ImageManipulationSidebar from './sidebar/ImageManipulationSidebar';

interface ImageSettingsProps {
  layers: Layer<ImageLayerProps>[];
}

const ImageSettings: FC<ImageSettingsProps> = ({ layers }) => {
  const { actions, sidebar, activePage } = useEditor((state) => ({
    activePage: state.activePage,
    sidebar: state.sidebar,
  }));

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
      actions.history.merge().setProp<ImageLayerProps>(activePage, layer.id, {
        image: {
          flipHorizontal: !layer.data.props.image.flipHorizontal,
        },
      });
    });
  };
  const handleFlipVertical = () => {
    actions.history.new();
    layers.forEach((layer) => {
      actions.history.merge().setProp<ImageLayerProps>(activePage, layer.id, {
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
  return (
    <div
      css={{
        display: 'grid',
        alignItems: 'center',
        gridAutoFlow: 'column',
        gridGap: 8,
      }}
    >
      <SettingButton onClick={toggleImageManipulation}>
        <span css={{ fontSize: 20 }}>
          <PencilIcon />
        </span>
        <span css={{ padding: '0 4px' }}>Edit</span>
      </SettingButton>
      <div
        css={{ height: 24, width: `1px`, background: 'rgba(57,76,96,.15)' }}
      />
      <SettingButton css={{ fontSize: 20 }} onClick={handleRotateLeft}>
        <ArrowCounterClockwiseIcon />
      </SettingButton>
      <SettingButton css={{ fontSize: 20 }} onClick={handleRotateRight}>
        <ArrowClockwiseIcon />
      </SettingButton>
      <div
        css={{ height: 24, width: `1px`, background: 'rgba(57,76,96,.15)' }}
      />
      <SettingButton css={{ fontSize: 20 }} onClick={handleFlipHorizontal}>
        <FlipHorizontalFillIcon />
      </SettingButton>
      <SettingButton css={{ fontSize: 20 }} onClick={handleFlipVertical}>
        <FlipVerticalFillIcon />
      </SettingButton>
      {sidebar === 'IMAGE_MANIPULATION' && (
        <ImageManipulationSidebar open={true} />
      )}
    </div>
  );
};

export default ImageSettings;
