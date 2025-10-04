import ArrowClockwiseIcon from '@duyank/icons/regular/ArrowClockwise';
import ArrowCounterClockwiseIcon from '@duyank/icons/regular/ArrowCounterClockwise';
import DownloadIcon from '@duyank/icons/regular/Download';
import PlayCircleIcon from '@duyank/icons/regular/PlayCircle';
import SignOutIcon from '@duyank/icons/regular/SignOut';
import { useEditor } from '@lidojs/design-editor';
import { toPng } from 'html-to-image';
import React, { forwardRef, ForwardRefRenderFunction } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderLayoutProps {
  openPreview: () => void;
}

const HeaderLayout: ForwardRefRenderFunction<
  HTMLDivElement,
  HeaderLayoutProps
> = ({ openPreview }, ref) => {
  const { actions, query } = useEditor();
  const { user, logout } = useAuth();

  const handleExportAllPages = async () => {
    try {
      const totalPages = query.serialize().length;

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const pageElement = document.getElementById(`lidojs-page-${pageIndex}`);
        if (pageElement) {
          // Find the exact same element that displayRef points to
          // It's a div with: position: relative, left: 0, top: 0, z-index: 1
          const displayElement = Array.from(
            pageElement.querySelectorAll('div')
          ).find((div) => {
            const style = window.getComputedStyle(div);
            return (
              style.position === 'relative' &&
              style.left === '0px' &&
              style.top === '0px' &&
              style.zIndex === '1' &&
              div.children.length > 0 // Should contain page content
            );
          });

          if (displayElement) {
            const dataUrl = await toPng(displayElement as HTMLElement);
            const link = document.createElement('a');
            link.download = `design-page-${pageIndex + 1}.png`;
            link.href = dataUrl;
            link.click();

            // Small delay between downloads to prevent browser blocking
            await new Promise((resolve) => setTimeout(resolve, 500));
          } else {
            console.warn(
              `Could not find display element for page ${pageIndex + 1}`
            );
          }
        }
      }
    } catch (error) {
      window.alert('Cannot export pages: ' + (error as Error).message);
    }
  };
  return (
    <div
      ref={ref}
      css={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: 'none',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px 0 rgb(0 0 0 / 0.15)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          borderRadius: '0 0 16px 16px',
          pointerEvents: 'none',
        },
        '@media (max-width: 900px)': {
          padding: '12px 16px',
          borderRadius: '0',
        },
      }}
    >
      {/* Logo Section */}
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          css={{
            height: 40,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            css={{
              fontSize: 26,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              background: 'linear-gradient(45deg, #ffffff 0%, #f0f9ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DesignDeck
          </span>
        </div>
      </div>

      {/* Center Section - Action Buttons */}
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '8px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Undo Button */}
        <button
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: query.history.canUndo()
              ? '#ffffff'
              : 'rgba(255,255,255,0.5)',
            background: 'transparent',
            border: 'none',
            width: 40,
            height: 40,
            borderRadius: '12px',
            cursor: query.history.canUndo() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontSize: 20,
            ':hover': {
              background: query.history.canUndo()
                ? 'rgba(255,255,255,0.1)'
                : 'transparent',
              transform: query.history.canUndo() ? 'translateY(-1px)' : 'none',
            },
          }}
          disabled={!query.history.canUndo()}
          title="Undo"
          onClick={query.history.canUndo() ? actions.history.undo : undefined}
        >
          <ArrowCounterClockwiseIcon />
        </button>

        {/* Redo Button */}
        <button
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: query.history.canRedo()
              ? '#ffffff'
              : 'rgba(255,255,255,0.5)',
            background: 'transparent',
            border: 'none',
            width: 40,
            height: 40,
            borderRadius: '12px',
            cursor: query.history.canRedo() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontSize: 20,
            ':hover': {
              background: query.history.canRedo()
                ? 'rgba(255,255,255,0.1)'
                : 'transparent',
              transform: query.history.canRedo() ? 'translateY(-1px)' : 'none',
            },
          }}
          disabled={!query.history.canRedo()}
          title="Redo"
          onClick={query.history.canRedo() ? actions.history.redo : undefined}
        >
          <ArrowClockwiseIcon />
        </button>
      </div>

      {/* Right Section - User Info and Logout */}
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* User Info */}
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            css={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span
            css={{
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              '@media (max-width: 900px)': {
                display: 'none',
              },
            }}
          >
            {user?.name || 'User'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          css={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '10px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            fontSize: 18,
            ':hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-1px)',
            },
          }}
          title="Sign out"
          onClick={logout}
        >
          <SignOutIcon />
        </button>
        {/* Export All Pages Button */}
        {/* <button
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            ':hover': {
              background: 'rgba(255, 255, 255, 0.25)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            },
            '@media (max-width: 900px)': {
              padding: '8px 14px',
              fontSize: 13,
            },
          }}
          title="Export all pages as PNG"
          onClick={handleExportAllPages}
        >
          <DownloadIcon />
          <span
            css={{
              '@media (max-width: 900px)': {
                display: 'none',
              },
            }}
          >
            Export
          </span>
        </button> */}

        {/* Preview Button */}
        {/* <button
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
            ':hover': {
              background: 'linear-gradient(135deg, #ff5252 0%, #e53e3e 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
            },
            '@media (max-width: 900px)': {
              padding: '10px 16px',
              fontSize: 13,
            },
          }}
          title="Preview design"
          onClick={openPreview}
        >
          <PlayCircleIcon />
          <span
            css={{
              '@media (max-width: 900px)': {
                display: 'none',
              },
            }}
          >
            Preview
          </span>
        </button> */}
      </div>
    </div>
  );
};

export default forwardRef(HeaderLayout);
