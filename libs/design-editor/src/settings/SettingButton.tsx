import React, {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  PropsWithChildren,
} from 'react';

interface SettingButtonProps extends HTMLProps<HTMLDivElement> {
  isActive?: boolean;
}

const SettingButton: ForwardRefRenderFunction<
  HTMLDivElement,
  PropsWithChildren<SettingButtonProps>
> = ({ children, isActive, disabled, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      css={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        height: 36,
        padding: '0 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: isActive
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'rgba(255, 255, 255, 0.7)',
        color: isActive
          ? '#ffffff'
          : disabled
          ? 'rgba(36,49,61,.4)'
          : '#4a5568',
        whiteSpace: 'nowrap',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isActive
          ? '0 2px 8px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        fontWeight: isActive ? 600 : 500,
        fontSize: 13,
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(4px)',
        ':hover': {
          backgroundColor: disabled
            ? undefined
            : isActive
            ? 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)'
            : 'rgba(255, 255, 255, 0.9)',
          transform: disabled ? 'none' : 'translateY(-1px)',
          boxShadow: disabled
            ? undefined
            : isActive
            ? '0 4px 12px rgba(102, 126, 234, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 2px 6px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        },
      }}
      onClick={(e) => !disabled && onClick && onClick(e)}
      {...props}
    >
      {children}
    </div>
  );
};
export default forwardRef<
  HTMLDivElement,
  PropsWithChildren<SettingButtonProps>
>(SettingButton);
