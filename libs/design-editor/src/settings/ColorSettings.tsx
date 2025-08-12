import { getGradientBackground, GradientStyle } from '@lidojs/design-core';
import { Color } from '@lidojs/design-utils';
import { isEqual } from 'lodash';
import React, { FC, Fragment, PropsWithChildren, useMemo } from 'react';
import { useEditor } from '../hooks';
import SettingButton from './SettingButton';
import ColorSidebar from './sidebar/ColorSidebar';

interface ColorSettingsProps {
  colors: string[];
  gradient?: { colors: string[]; style: GradientStyle } | null;
  params?: Record<string, unknown>;
  useGradient?: boolean;
  onChange: (color: string) => void;
  onChangeGradient?: (gradient: {
    colors: string[];
    style: GradientStyle;
  }) => void;
}

const ColorSettings: FC<PropsWithChildren<ColorSettingsProps>> = ({
  colors,
  gradient,
  params,
  useGradient,
  children,
  onChange,
  onChangeGradient,
}) => {
  const { actions, sidebar, sidebarParams } = useEditor((state) => ({
    sidebar: state.sidebar,
    sidebarParams: state.sidebarParams,
  }));

  const linearGradient = useMemo(() => {
    if (
      (colors.length === 0 ||
        (colors.length === 1 && new Color(colors[0]).white() === 100)) &&
      !gradient
    ) {
      return 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';
    }
    if (gradient) {
      return getGradientBackground(gradient.colors, gradient.style);
    }
    return colors
      .map((color) => `linear-gradient(to right, ${color}, ${color})`)
      .join(', ');
  }, [colors, gradient]);

  const toggleSidebar = () => {
    if (sidebar === 'CHOOSING_COLOR' && isEqual(params || {}, sidebarParams)) {
      actions.setSidebar();
    } else {
      actions.setSidebar('CHOOSING_COLOR', params);
    }
  };

  return (
    <Fragment>
      <SettingButton
        isActive={
          sidebar === 'CHOOSING_COLOR' && isEqual(params || {}, sidebarParams)
        }
        onClick={toggleSidebar}
      >
        {!children && (
          <div
            css={{
              width: 24,
              height: 24,
              boxShadow: 'inset 0 0 0 1px rgba(57,76,96,.15)',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              css={{
                backgroundColor: '#fff',
                backgroundPosition: '0 0, 6px 6px',
                backgroundSize: '12px 12px',
                inset: 0,
                position: 'absolute',
                backgroundImage:
                  'linear-gradient(-45deg,rgba(57,76,96,.15) 25%,transparent 25%,transparent 75%,rgba(57,76,96,.15) 75%),linear-gradient(-45deg,rgba(57,76,96,.15) 25%,transparent 25%,transparent 75%,rgba(57,76,96,.15) 75%)',
              }}
            >
              <div
                css={{
                  position: 'absolute',
                  inset: 0,
                  background: linearGradient,
                }}
              />
            </div>
          </div>
        )}
        {children}
      </SettingButton>
      {sidebar === 'CHOOSING_COLOR' && isEqual(params || {}, sidebarParams) && (
        <ColorSidebar
          gradient={gradient}
          open={true}
          selected={colors.length === 1 ? colors[0] : null}
          useGradient={useGradient}
          onChangeGradient={onChangeGradient}
          onSelect={onChange}
        />
      )}
    </Fragment>
  );
};

export default ColorSettings;
