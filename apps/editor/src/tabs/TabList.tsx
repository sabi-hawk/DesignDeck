import React, { FC, ReactNode } from 'react';

interface SidebarTabProps {
  tabs: {
    name: string;
    icon: ReactNode;
    isBeta?: boolean;
  }[];
  active: string | null;
  onChange: (e: React.MouseEvent, tab: string) => void;
}

const SidebarTab: FC<SidebarTabProps> = ({ tabs, active, onChange }) => {
  const activeIdx = tabs.findIndex((tab) => tab.name === active);
  return (
    <div
      css={{
        color: '#4a5568',
        borderRight: '1px solid rgba(102, 126, 234, 0.12)',
        background: 'transparent',
        '@media (max-width: 900px)': {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, #f8f9ff 0%, #f0f4ff 100%)',
          display: 'flex',
          justifyContent: 'center',
          borderTop: '1px solid rgba(102, 126, 234, 0.15)',
          boxShadow: '0 -4px 12px rgba(102, 126, 234, 0.08)',
        },
      }}
    >
      <div
        css={{
          position: 'relative',
          '@media (max-width: 900px)': {
            display: 'flex',
            overflowX: 'scroll',
          },
        }}
      >
        {activeIdx >= 0 && (
          <div
            css={{
              background:
                'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              width: 68,
              height: 68,
              position: 'absolute',
              left: 2,
              top: 2,
              transform: `translateY(${activeIdx * 72}px)`,
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              boxShadow:
                '0 2px 8px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              '@media (max-width: 900px)': {
                display: 'none',
              },
            }}
          />
        )}
        {tabs.map((tab, idx) => (
          <div
            key={idx}
            css={{
              color: idx === activeIdx ? '#667eea' : '#6b7280',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px',
              height: 72,
              width: 72,
              minWidth: 72,
              minHeight: 72,
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              zIndex: 1,
              fontWeight: idx === activeIdx ? 600 : 500,
              ':hover': {
                color: '#667eea',
                background: 'rgba(102, 126, 234, 0.05)',
                transform: 'translateY(-1px)',
              },
            }}
            onClick={(e) => onChange(e, tab.name)}
          >
            <div css={{ fontSize: 24 }}>{tab.icon}</div>
            <span
              css={{
                fontSize: 10,
                lineHeight: 1.6,
                fontWeight: 600,
                textAlign: 'center',
                maxWidth: '100%',
                wordBreak: 'break-word',
                padding: '0 2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tab.name.split(' ').map((word, index) => (
                <span key={index} css={{ textAlign: 'center' }}>
                  {word}
                </span>
              ))}
            </span>
            {tab.isBeta && (
              <div
                css={{
                  position: 'absolute',
                  background:
                    'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  color: '#ffffff',
                  borderRadius: 12,
                  fontSize: 8,
                  padding: '2px 6px',
                  top: 6,
                  right: 6,
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(255, 107, 107, 0.3)',
                  letterSpacing: '0.5px',
                }}
              >
                BETA
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarTab;
