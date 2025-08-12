import { Frame } from '@lidojs/design-screen';
import React, { useCallback, useEffect, useState } from 'react';
import { useEditor } from '../hooks';

type Interval = ReturnType<typeof setTimeout>;
let timeout: Interval;
const Preview = () => {
  const { pages, pageSize, serialize } = useEditor((state, query) => ({
    pages: state.pages,
    serialize: query.serialize(),
    pageSize: query.getPageSize(),
  }));
  const [activeSlide, setActiveSlide] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0, scale: 1 });
  const moveSlide = useCallback(
    (number: number) => {
      setActiveSlide((prevState) => {
        const value = (prevState + number) % pages.length;
        if (value >= 0) {
          return value;
        } else {
          return pages.length + value;
        }
      });
    },
    [setActiveSlide, pages.length]
  );
  useEffect(() => {
    timeout = setTimeout(() => {
      moveSlide(1);
    }, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [moveSlide, activeSlide]);

  useEffect(() => {
    const updateSize = () => {
      const { clientWidth, clientHeight } = window.document.body;
      const ratio = clientWidth / clientHeight;
      const pageRatio = pageSize.width / pageSize.height;
      if (ratio > pageRatio) {
        const w = clientHeight * pageRatio;
        setSize({
          width: w,
          height: clientHeight,
          scale: w / pageSize.width,
        });
      } else {
        const w = clientWidth;
        const h = w / pageRatio;
        setSize({
          width: w,
          height: h,
          scale: w / pageSize.width,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [pageSize]);

  if (size.width === 0) {
    return null;
  }

  return (
    <div
      css={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/*<div
        css={{
          position: 'absolute',
          top: '50%',
          transform: 'translate(0, -50%)',
          left: '16px',
          zIndex: 1050,
        }}
      >
        <div
          css={{
            border: '1px solid #fff',
            background: 'rgba(255,255,255,0.3)',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: '#fff',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          onClick={() => moveSlide(-1)}
        >
          <CaretLeftIcon />
        </div>
      </div>
      <div
        css={{
          position: 'absolute',
          top: '50%',
          transform: 'translate(0, -50%)',
          right: '16px',
          zIndex: 1050,
        }}
      >
        <div
          css={{
            border: '1px solid #fff',
            background: 'rgba(255,255,255,0.3)',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: '#fff',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
          onClick={() => moveSlide(1)}
        >
          <CaretRightIcon />
        </div>
      </div>
      */}
      <Frame
        data={serialize}
        height={size.height / size.scale}
        width={size.width / size.scale}
      />
    </div>
  );
};

export default Preview;
