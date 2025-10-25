// import BrowserIcon from '@duyank/icons/regular/Browser';
// import PiggyBankIcon from '@duyank/icons/regular/PiggyBank';
// import SquareIcon from '@duyank/icons/regular/Square';
import FrameCornersIcon from '@duyank/icons/regular/FrameCorners';
import ImageIcon from '@duyank/icons/regular/Image';
import TextTIcon from '@duyank/icons/regular/TextT';
import UploadIcon from '@duyank/icons/regular/Upload';
import { useEditor } from '@lidojs/design-editor';
import React, { useState, useEffect } from 'react';
import { useSidebarContext } from '../contexts/SidebarContext';
import SidebarTab from '../tabs/TabList';
import FrameContent from './sidebar/FrameContent';
import GraphicContent from './sidebar/GraphicContent';
import IframeContent from './sidebar/IframeContent';
import ImageContent from './sidebar/ImageContent';
import ShapeContent from './sidebar/ShapeContent';
import SimpleFrameContent from './sidebar/SimpleFrameContent';
import TextContent from './sidebar/TextContent';
import UploadContent from './sidebar/UploadContent';

const tabs = [
  {
    name: 'Image',
    icon: <ImageIcon />,
  },
  {
    name: 'Text',
    icon: <TextTIcon />,
  },
  {
    name: 'Advanced Scene',
    icon: <FrameCornersIcon />,
  },
  // {
  //   name: 'Graphic',
  //   icon: <PiggyBankIcon />,
  // },
  // {
  //   name: 'Widgets',
  //   icon: <BrowserIcon />,
  // },
  {
    name: 'Upload',
    icon: <UploadIcon />,
  },
];
const Sidebar = () => {
  const { actions } = useEditor();
  const [tab, setTab] = useState<string | null>('Image');
  const { setSidebarPopupOpen } = useSidebarContext();

  // Update sidebar popup state when tab changes
  useEffect(() => {
    setSidebarPopupOpen(tab !== null);
  }, [tab, setSidebarPopupOpen]);
  return (
    <div
      css={{
        display: 'flex',
        zIndex: 2,
        position: 'relative',
        background:
          'linear-gradient(180deg, #f8f9ff 0%, #f0f4ff 50%, #e8efff 100%)',
        borderRight: '1px solid rgba(102, 126, 234, 0.15)',
        boxShadow:
          '2px 0 12px rgba(102, 126, 234, 0.08), inset -1px 0 0 rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        css={{
          display: 'flex',
        }}
      >
        <SidebarTab
          active={tab}
          tabs={tabs}
          onChange={(_, tab) => {
            actions.setSidebar();
            setTab(tab);
          }}
        />
        {tab && (
          <div
            css={{
              width: 360,
              '@media (max-width: 900px)': {
                width: '100%',
                position: 'fixed',
                bottom: 0,
                left: 0,
                top: 0,
                background: '#fff',
              },
            }}
          >
            {tab === 'Image' && (
              <ImageContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            {tab === 'Text' && (
              <TextContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            {tab === 'Frame' && (
              <FrameContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            {tab === 'Advanced Scene' && (
              <SimpleFrameContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            {tab === 'Graphic' && (
              <GraphicContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            {tab === 'Widgets' && (
              <IframeContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            {tab === 'Shape' && (
              <ShapeContent
                onClose={() => {
                  setTab(null);
                  actions.setSidebar();
                }}
              />
            )}
            <UploadContent
              visibility={tab === 'Upload'}
              onClose={() => {
                setTab(null);
                actions.setSidebar();
              }}
            />
          </div>
        )}
      </div>
      <div
        css={{
          width: 360,
          position: 'absolute',
          overflow: 'hidden',
          top: 0,
          left: 73,
          height: '100%',
          pointerEvents: 'none',
        }}
        id={'settings'}
      />
    </div>
  );
};

export default Sidebar;
