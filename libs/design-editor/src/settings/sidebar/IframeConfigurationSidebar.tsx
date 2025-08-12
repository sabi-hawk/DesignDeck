import XIcon from '@duyank/icons/regular/X';
import { IframeContentProps } from '@lidojs/design-layers';
import React, {
  FormEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useState,
} from 'react';
import { useEditor, useSelectedLayers } from '../../hooks';
import { IframeLayerProps } from '../../layers/IframeLayer';
import { Layer } from '../../types';
import { isIframeLayer } from '../../ultils/layer/layers';
import Sidebar, { SidebarProps } from './Sidebar';

type IframeConfigurationSidebarProps = SidebarProps;
const IframeConfigurationSidebar: ForwardRefRenderFunction<
  HTMLDivElement,
  IframeConfigurationSidebarProps
> = ({ ...props }, ref) => {
  const [url, setUrl] = useState<string>('');
  const { layerList } = useSelectedLayers();
  const { actions, activePage } = useEditor((state) => ({
    activePage: state.activePage,
  }));

  const layer = layerList.find((l): l is Layer<IframeLayerProps> =>
    isIframeLayer(l)
  );
  useEffect(() => {
    setUrl(layer.data.props.url);
  }, [layer.data.props.url]);

  const updateIframeData = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    actions.setProp<IframeContentProps>(activePage, layer.id, {
      url,
    });
  };

  return (
    <Sidebar ref={ref} {...props}>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          height: 48,
          borderBottom: '1px solid rgba(57,76,96,.15)',
          padding: '0 20px',
        }}
      >
        <p
          css={{
            lineHeight: '48px',
            fontWeight: 600,
            color: '#181C32',
            flexGrow: 1,
          }}
        >
          Iframe Configuration
        </p>
        <div
          css={{
            fontSize: 20,
            flexShrink: 0,
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => {
            actions.setSidebar();
          }}
        >
          <XIcon />
        </div>
      </div>
      <form css={{ marginTop: 20 }} onSubmit={updateIframeData}>
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 20px',
            rowGap: 12,
          }}
        >
          <div css={{ display: 'flex', alignItems: 'center' }}>
            <div css={{ flexShrink: 0, width: 60 }}>URL</div>
            <div
              css={{
                borderRadius: 4,
                boxShadow: '0 0 0 1px rgba(43,59,74,.3)',
                overflow: 'hidden',
                flexGrow: 1,
              }}
            >
              <div
                css={{
                  height: 40,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                }}
              >
                <input
                  css={{ width: '100%', height: '100%' }}
                  defaultValue={url}
                  type={'text'}
                  onChange={(e) => setUrl(e.target.value as string)}
                />
              </div>
            </div>
          </div>
          <button
            css={{
              background: '#3a3a4c',
              borderRadius: 8,
              color: '#fff',
              padding: '12px 16px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            type="submit"
          >
            Submit
          </button>
          <p>
            Note: Please make sure you set "X-Frame-Options" for your server
          </p>
        </div>
      </form>
    </Sidebar>
  );
};

export default forwardRef<HTMLDivElement, IframeConfigurationSidebarProps>(
  IframeConfigurationSidebar
);
