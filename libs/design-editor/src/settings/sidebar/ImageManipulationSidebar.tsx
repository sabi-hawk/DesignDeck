import XIcon from '@duyank/icons/regular/X';
import { getFilterStyle } from '@lidojs/design-core';
import React, { forwardRef, ForwardRefRenderFunction } from 'react';
import Slider from '../../common/slider/Slider';
import { useEditor, useSelectedLayers } from '../../hooks';
import { ImageLayerProps } from '../../layers';
import Sidebar, { SidebarProps } from './Sidebar';

type ImageManipulationSidebarProps = SidebarProps;
const ImageManipulationSidebar: ForwardRefRenderFunction<
  HTMLDivElement,
  ImageManipulationSidebarProps
> = ({ ...props }, ref) => {
  const { selectedLayers } = useSelectedLayers();
  const { actions, activePage } = useEditor((state) => ({
    activePage: state.activePage,
  }));
  const imageProps = selectedLayers[0].data.props as ImageLayerProps;
  const updateImageAttribute = (
    field:
      | 'brightness'
      | 'contrast'
      | 'grayscale'
      | 'saturation'
      | 'hueRotate'
      | 'blur',
    value: number
  ) => {
    actions.history
      .throttle(2000)
      .setProp<ImageLayerProps>(activePage, selectedLayers[0].id, {
        image: {
          [field]: value || null,
        },
      });
  };
  const reset = () => {
    actions.setProp<ImageLayerProps>(activePage, selectedLayers[0].id, {
      image: {
        url: imageProps.image.url,
        thumb: imageProps.image.thumb,
        brightness: null,
        contrast: null,
        saturation: null,
        hueRotate: null,
        grayscale: null,
        blur: null,
      },
    });
  };

  const isEdited =
    imageProps.image.brightness ||
    imageProps.image.contrast ||
    imageProps.image.saturation ||
    imageProps.image.hueRotate ||
    imageProps.image.grayscale ||
    imageProps.image.blur;

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
          Edit Image
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
      <div css={{ padding: '0 20px', display: 'grid' }}>
        <div
          css={{
            width: '100%',
            paddingBottom: '100%',
            position: 'relative',
            marginTop: 20,
          }}
        >
          <div
            css={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#EBECF0',
            }}
          >
            <img
              alt={imageProps.image.url}
              css={{
                maxWidth: '100%',
                maxHeight: '100%',
                filter: imageProps.image
                  ? getFilterStyle(imageProps.image)
                  : undefined,
              }}
              src={imageProps.image.url}
            />
          </div>
        </div>
        <div css={{ display: 'flex', justifyContent: 'end' }}>
          <span
            css={{
              cursor: isEdited ? 'pointer' : undefined,
              opacity: isEdited ? 1 : 0.5,
              color: '#009ef7',
              marginTop: 8,
            }}
            onClick={reset}
          >
            Reset
          </span>
        </div>
        <div css={{ display: 'grid', rowGap: 24 }}>
          <div css={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <div>Brightness</div>
            <Slider
              hideInput
              max={100}
              min={-100}
              value={imageProps.image.brightness || 0}
              onChange={(v) => updateImageAttribute('brightness', v)}
            />
          </div>
          <div css={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <div>Contrast</div>
            <Slider
              hideInput
              max={100}
              min={-100}
              value={imageProps.image.contrast || 0}
              onChange={(v) => updateImageAttribute('contrast', v)}
            />
          </div>
          <div css={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <div>Saturation</div>
            <Slider
              hideInput
              max={100}
              min={-100}
              value={imageProps.image.saturation || 0}
              onChange={(v) => updateImageAttribute('saturation', v)}
            />
          </div>
          <div css={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <div>Hue Rotate</div>
            <Slider
              hideInput
              max={180}
              min={0}
              value={imageProps.image.hueRotate || 0}
              onChange={(v) => updateImageAttribute('hueRotate', v)}
            />
          </div>
          <div css={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <div>Grayscale</div>
            <Slider
              hideInput
              max={100}
              min={0}
              value={imageProps.image.grayscale || 0}
              onChange={(v) => updateImageAttribute('grayscale', v)}
            />
          </div>
          <div css={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <div>Blur</div>
            <Slider
              hideInput
              max={30}
              min={0}
              value={imageProps.image.blur || 0}
              onChange={(v) => updateImageAttribute('blur', v)}
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default forwardRef<HTMLDivElement, ImageManipulationSidebarProps>(
  ImageManipulationSidebar
);
