import BrowserIcon from '@duyank/icons/regular/Browser';
import React, { FC } from 'react';
import { useEditor } from '../hooks';
import { IframeLayerProps } from '../layers/IframeLayer';
import { Layer } from '../types';
import SettingButton from './SettingButton';
import IframeConfigurationSidebar from './sidebar/IframeConfigurationSidebar';

interface IframeSettingsProps {
  layer: Layer<IframeLayerProps>;
}

const IframeSettings: FC<IframeSettingsProps> = ({ layer }) => {
  const { actions, sidebar } = useEditor((state) => ({
    sidebar: state.sidebar,
  }));

  const toggleIframeConfiguration = () => {
    if (sidebar === 'IFRAME_CONFIGURATION') {
      actions.setSidebar();
    } else {
      actions.setSidebar('IFRAME_CONFIGURATION');
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
      <SettingButton onClick={toggleIframeConfiguration}>
        <span css={{ fontSize: 20 }}>
          <BrowserIcon />
        </span>
        <span css={{ padding: '0 4px' }}>Edit</span>
      </SettingButton>
      {sidebar === 'IFRAME_CONFIGURATION' && (
        <IframeConfigurationSidebar open={true} />
      )}
    </div>
  );
};

export default IframeSettings;
