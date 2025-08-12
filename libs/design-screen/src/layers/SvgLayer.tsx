import { SvgContent, SvgContentProps } from '@lidojs/design-layers';
import React, { FC } from 'react';

const SvgLayer: FC<SvgContentProps> = ({ boxSize, ...props }) => {
  return (
    <div
      css={{
        transformOrigin: '0 0',
      }}
      style={{
        width: boxSize.width,
        height: boxSize.height,
      }}
    >
      <SvgContent boxSize={boxSize} {...props} />
    </div>
  );
};

export default SvgLayer;
