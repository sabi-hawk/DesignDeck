import { LayerComponentProps } from '@lidojs/design-core';
import React, { FC, PropsWithChildren } from 'react';

export interface IframeContentProps extends LayerComponentProps {
  url: string;
}

export const IframeContent: FC<PropsWithChildren<IframeContentProps>> = ({
  url,
}) => {
  return (
    <iframe css={{ width: '100%', height: '100%' }} src={url} title={url} />
  );
};
