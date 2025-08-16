import React, { FC } from 'react';

interface TimelineProps {
  isVisible: boolean;
  onToggle: () => void;
}

const Timeline: FC<TimelineProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) return null;

  return (
    <div
      css={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1a202c',
        borderTop: '2px solid #667eea',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        height: '250px',
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Timeline Header */}
      <div
        css={{
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #4a5568',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <div
          css={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'white',
          }}
        >
          Timeline
        </div>
        <button
          css={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            ':hover': {
              background: 'rgba(255, 255, 255, 0.15)',
            },
          }}
          onClick={onToggle}
        >
          Hide Timeline
        </button>
      </div>

      {/* Timeline Content */}
      <div
        css={{
          padding: '20px',
          height: '200px',
        }}
      >
        {/* Timeline Scales */}
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '20px',
          }}
        >
          <div
            css={{
              fontSize: '14px',
              color: '#a0aec0',
              fontWeight: 500,
            }}
          >
            Scale:
          </div>
          {[1, 2, 5, 10, 15, 30, 60].map((seconds) => (
            <button
              key={seconds}
              css={{
                background: seconds === 5 ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '6px 12px',
                color: seconds === 5 ? 'white' : '#a0aec0',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                ':hover': {
                  background: seconds === 5 ? '#5a67d8' : 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              {seconds}s
            </button>
          ))}
        </div>

        {/* Timeline Ruler */}
        <div
          css={{
            height: '60px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Timeline Markers */}
          <div
            css={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={i}
                css={{
                  flex: 1,
                  height: i % 5 === 0 ? '100%' : '60%',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '8px',
                }}
              >
                {i % 5 === 0 && (
                  <span
                    css={{
                      fontSize: '10px',
                      color: '#a0aec0',
                      fontWeight: 500,
                    }}
                  >
                    {i * 0.5}s
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Controls */}
        <div
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <button
            css={{
              background: '#667eea',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              ':hover': {
                background: '#5a67d8',
              },
            }}
          >
            Play
          </button>
          <button
            css={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              ':hover': {
                background: 'rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            Stop
          </button>
          <div
            css={{
              flex: 1,
              height: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              position: 'relative',
            }}
          >
            <div
              css={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '30%',
                height: '100%',
                background: '#667eea',
                borderRadius: '2px',
              }}
            />
          </div>
          <span
            css={{
              fontSize: '12px',
              color: '#a0aec0',
              fontWeight: 500,
              minWidth: '40px',
            }}
          >
            1.5s
          </span>
        </div>
      </div>
    </div>
  );
};

export default Timeline; 