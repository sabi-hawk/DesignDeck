import ArrowClockwiseIcon from '@duyank/icons/regular/ArrowClockwise';
import ArrowCounterClockwiseIcon from '@duyank/icons/regular/ArrowCounterClockwise';
import GithubLogoIcon from '@duyank/icons/regular/GithubLogo';
import PlayCircleIcon from '@duyank/icons/regular/PlayCircle';
import { useEditor } from '@lidojs/design-editor';
import React, {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
} from 'react';
import { downloadObjectAsJson } from '../utils/download';

interface HeaderLayoutProps {
  openPreview: () => void;
}

const HeaderLayout: ForwardRefRenderFunction<
  HTMLDivElement,
  HeaderLayoutProps
> = ({ openPreview }, ref) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const { actions, query } = useEditor();
  const handleExport = () => {
    downloadObjectAsJson('file', query.serialize());
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        const fileContent = JSON.parse(reader.result as string);
        actions.setData(fileContent);
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };
  return (
    <div
      ref={ref}
      css={{
        background: '#1E1E2D',
        padding: '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '@media (max-width: 900px)': {
          padding: 12,
        },
      }}
    >
      <div
        css={{
          color: '#3d8eff',
          fontSize: 36,
        }}
      >
        <div
          css={{ color: 'white', height: 42, paddingTop: 6, paddingBottom: 6 }}
        >
          <a href="https://lidojs.com" rel="noreferrer" target="_blank">
            <img css={{ maxHeight: '100%' }} src={'./assets/logo.png'} />
          </a>
        </div>
      </div>
      <div css={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div css={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: '#3a3a4c',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: query.history.canUndo() ? 'pointer' : undefined,
              opacity: query.history.canUndo() ? 1 : 0.5,
              ':hover': {
                background: query.history.canUndo()
                  ? 'rgba(58,58,76,0.5)'
                  : undefined,
              },
            }}
            onClick={actions.history.undo}
          >
            <ArrowCounterClockwiseIcon />
          </div>
          <div
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: '#3a3a4c',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: query.history.canRedo() ? 'pointer' : undefined,
              opacity: query.history.canRedo() ? 1 : 0.5,
              ':hover': {
                background: query.history.canRedo()
                  ? 'rgba(58,58,76,0.5)'
                  : undefined,
              },
            }}
            onClick={actions.history.redo}
          >
            <ArrowClockwiseIcon />
          </div>
        </div>
        <a
          href="https://github.com/lidojs/canva-clone"
          rel="noreferrer"
          target="_blank"
        >
          <span
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: '#3a3a4c',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(58,58,76,0.5)',
              },
            }}
          >
            <GithubLogoIcon />
          </span>
        </a>
        <div
          css={{
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 700,
            ':hover': {
              textDecoration: 'underline',
            },
            '@media (max-width: 900px)': {
              display: 'none',
            },
          }}
          onClick={() => uploadRef.current?.click()}
        >
          <input
            ref={uploadRef}
            accept="application/json"
            css={{ display: 'none' }}
            type="file"
            onChange={handleImport}
          />
          Import
        </div>
        <div
          css={{
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 700,
            ':hover': {
              textDecoration: 'underline',
            },
            '@media (max-width: 900px)': {
              display: 'none',
            },
          }}
          onClick={() => handleExport()}
        >
          Export
        </div>
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
            lineHeight: 1,
            background: '#3a3a4c',
            padding: '8px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            ':hover': {
              background: 'rgba(58,58,76,0.5)',
            },
            '@media (max-width: 900px)': {
              display: 'none',
            },
          }}
          onClick={openPreview}
        >
          <div css={{ marginRight: 4, fontSize: 20 }}>
            <PlayCircleIcon />
          </div>{' '}
          Preview
        </div>
      </div>
    </div>
  );
};

export default forwardRef(HeaderLayout);
