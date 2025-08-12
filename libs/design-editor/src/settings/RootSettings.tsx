import FlipHorizontalFillIcon from '@duyank/icons/fill/FlipHorizontalFill';
import FlipVerticalFillIcon from '@duyank/icons/fill/FlipVerticalFill';
import ArrowClockwiseIcon from '@duyank/icons/regular/ArrowClockwise';
import ArrowCounterClockwiseIcon from '@duyank/icons/regular/ArrowCounterClockwise';
import PencilIcon from '@duyank/icons/regular/Pencil';
import { GradientStyle } from '@lidojs/design-core';
import React, { FC, useMemo } from 'react';
import { useEditor } from '../hooks';
import { RootLayerProps } from '../layers';
import { Layer } from '../types';
import ColorSettings from './ColorSettings';
import SettingButton from './SettingButton';
import ImageManipulationSidebar from './sidebar/ImageManipulationSidebar';

interface RootSettingsProps {
  layer: Layer<RootLayerProps>;
}

const RootSettings: FC<RootSettingsProps> = ({ layer }) => {
  const { actions, activePage, sidebar } = useEditor((state) => ({
    activePage: state.activePage,
    sidebar: state.sidebar,
  }));
  const color = useMemo(() => {
    return layer.data.props.color;
  }, [layer]);
  const gradient = useMemo(() => {
    return layer.data.props.gradientBackground;
  }, [layer]);
  const updateColor = (color: string) => {
    actions.history
      .throttle(2000)
      .setProp<RootLayerProps>(activePage, layer.id, {
        color,
        gradientBackground: null,
      });
  };

  const handleChangeGradient = (data: {
    colors: string[];
    style: GradientStyle;
  }) => {
    actions.history
      .throttle(2000)
      .setProp<RootLayerProps>(activePage, layer.id, {
        gradientBackground: data,
        color: null,
      });
  };

  const handleRotateLeft = () => {
    const newRotate = (layer.data.props.rotate - 90 + 360) % 360;
    actions.setProp(activePage, layer.id, {
      rotate: newRotate,
    });
  };
  const handleRotateRight = () => {
    const newRotate = (layer.data.props.rotate + 90) % 360;
    actions.setProp(activePage, layer.id, {
      rotate: newRotate,
    });
  };
  const handleFlipHorizontal = () => {
    actions.setProp<RootLayerProps>(activePage, layer.id, {
      image: {
        flipHorizontal: !layer.data.props.image.flipHorizontal,
      },
    });
  };
  const handleFlipVertical = () => {
    actions.history.merge().setProp<RootLayerProps>(activePage, layer.id, {
      image: {
        flipVertical: !layer.data.props.image.flipVertical,
      },
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
      {layer.data.props.image && (
        <>
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
        </>
      )}
      <ColorSettings
        colors={color ? [color] : []}
        gradient={gradient}
        useGradient={true}
        onChange={updateColor}
        onChangeGradient={handleChangeGradient}
      />
    </div>
  );
};

export default RootSettings;
