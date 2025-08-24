import {
  EffectSettings,
  FontData,
  getTextEffectStyle,
  LayerComponentProps,
} from '@lidojs/design-core';
import React, { FC } from 'react';

export interface TextContentProps extends LayerComponentProps {
  text: string;
  scale: number;
  fonts: FontData[];
  colors: string[];
  fontSizes: number[];
  effect: {
    name: string;
    settings: EffectSettings;
  } | null;
}

export const TextContent: FC<TextContentProps> = ({
  text,
  colors,
  fontSizes,
  effect,
  layerId,
}) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: text }}
      className={`lidojs-text ${layerId}`}
      css={{
        p: {
          '&:before': {
            ...getTextEffectStyle(
              effect?.name || 'none',
              effect?.settings as EffectSettings,
              colors[0],
              fontSizes[0]
            ),
          },
        },
        ...getTextEffectStyle(
          effect?.name || 'none',
          effect?.settings as EffectSettings,
          colors[0],
          fontSizes[0]
        ),
      }}
    />
  );
};
