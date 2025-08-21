import { LayerSettings, useSelectedLayers } from '@lidojs/design-editor';
import React from 'react';

interface AppLayerSettingsProps {
  onShowAnimationPopup?: (elementId: string, elementType: string, elementName: string) => void;
}

const AppLayerSettings: React.FC<AppLayerSettingsProps> = ({ onShowAnimationPopup }) => {
  const { selectedLayerIds } = useSelectedLayers();
  return (
    <div
      css={{
        background: 'white',
        borderBottom: '1px solid rgba(57,76,96,.15)',
        height: 50,
        overflowX: 'auto',
        flexShrink: 0,
        '@media (max-width: 900px)': {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          display: selectedLayerIds.length > 0 ? 'flex' : 'none',
          justifyContent: 'center',
          zIndex: 20,
          height: 72,
        },
      }}
    >
      <LayerSettings onShowAnimationPopup={onShowAnimationPopup} />
    </div>
  );
};

export default AppLayerSettings;
