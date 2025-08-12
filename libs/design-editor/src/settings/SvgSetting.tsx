import FlipHorizontalFillIcon from '@duyank/icons/fill/FlipHorizontalFill';
import FlipVerticalFillIcon from '@duyank/icons/fill/FlipVerticalFill';
import React, { FC, useMemo } from 'react';
import { useEditor } from '../hooks';
import { SvgLayerProps } from '../layers/SvgLayer';
import { Layer } from '../types';
import ColorSettings from './ColorSettings';
import SettingButton from './SettingButton';

interface SvgSettingsProps {
  layer: Layer<SvgLayerProps>;
}

const SvgSettings: FC<SvgSettingsProps> = ({ layer }) => {
  const { actions, activePage } = useEditor((state) => ({
    activePage: state.activePage,
  }));

  const colors = useMemo(() => {
    return layer.data.props.colors;
  }, [layer]);

  const updateColor = (idx: number, color: string) => {
    actions.history
      .throttle(2000)
      .setProp<SvgLayerProps>(activePage, layer.id, {
        colors: layer.data.props.colors.map((c, index) =>
          index === idx ? color : c
        ),
      });
  };

  const handleFlipHorizontal = () => {
    actions.setProp<SvgLayerProps>(activePage, layer.id, {
      flipHorizontal: !layer.data.props.flipHorizontal,
    });
  };

  const handleFlipVertical = () => {
    actions.setProp<SvgLayerProps>(activePage, layer.id, {
      flipVertical: !layer.data.props.flipVertical,
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
      <div
        css={{
          display: 'grid',
          alignItems: 'center',
          gridAutoFlow: 'column',
        }}
      >
        {colors.map((color, idx) => {
          return (
            <ColorSettings
              key={idx}
              colors={[color]}
              params={{ idx }}
              useGradient={false}
              onChange={(c) => updateColor(idx, c)}
            />
          );
        })}
      </div>
      <div
        css={{ height: 24, width: `1px`, background: 'rgba(57,76,96,.15)' }}
      />
      <SettingButton css={{ fontSize: 20 }} onClick={handleFlipHorizontal}>
        <FlipHorizontalFillIcon />
      </SettingButton>
      <SettingButton css={{ fontSize: 20 }} onClick={handleFlipVertical}>
        <FlipVerticalFillIcon />
      </SettingButton>
    </div>
  );
};

export default SvgSettings;
