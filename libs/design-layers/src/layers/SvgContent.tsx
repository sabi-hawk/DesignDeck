import {
  getSvgStringAfterReplaceColors,
  LayerComponentProps,
} from '@lidojs/design-core';
import { fetchSvgContent } from '@lidojs/design-utils';
import React, { FC, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

export interface SvgContentProps extends LayerComponentProps {
  image: string;
  colors: string[];
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export const SvgContent: FC<SvgContentProps> = ({
  image,
  flipVertical,
  flipHorizontal,
  boxSize,
  colors,
}) => {
  const [url, setUrl] = useState<string>();
  useAsync(async () => {
    const ele = await fetchSvgContent(image);

    const svgStr = getSvgStringAfterReplaceColors(ele, colors);

    const svgBlob = new Blob([svgStr], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    setUrl(svgUrl);
  }, [image, colors]);

  const wrapperStyle = useMemo(
    () => ({
      transform:
        flipVertical || flipHorizontal
          ? `scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`
          : undefined,
      width: boxSize.width,
      height: boxSize.height,
    }),
    [flipHorizontal, flipVertical, boxSize]
  );

  return (
    <div css={{ width: '100%', height: '100%' }}>
      {image && (
        <div
          css={{
            width: boxSize.width,
            height: boxSize.height,
            position: 'relative',
            userSelect: 'none',
            ...wrapperStyle,
          }}
        >
          <img
            alt={url}
            crossOrigin={'anonymous'}
            css={{
              objectFit: 'fill',
              width: '100%',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
            }}
            src={url}
          />
        </div>
      )}
    </div>
  );
};
