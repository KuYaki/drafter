'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StickyProps {
  context?: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}

export default function Sticky({ context, children }: StickyProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width?: number;
    left?: number;
    height?: number;
    top?: number;
  }>({});

  const handleScroll = () => {
    if (!elementRef.current || !contentRef.current) return;

    const elementRect = elementRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    if (context?.current) {
      const contextRect = context.current.getBoundingClientRect();
      const contextBottom = contextRect.bottom;

      if (elementRect.top <= contextBottom) {
        if (!isSticky) {
          setIsSticky(true);
          setDimensions({
            width: elementRect.width,
            left: elementRect.left,
            height: contentRect.height,
            top: contextBottom,
          });
        }
      } else {
        setIsSticky(false);
      }
    } else {
      // If no context, stick to top of screen
      if (elementRect.top <= 0) {
        if (!isSticky) {
          setIsSticky(true);
          setDimensions({
            width: elementRect.width,
            left: elementRect.left,
            height: contentRect.height,
            top: 0,
          });
        }
      } else {
        setIsSticky(false);
      }
    }
  };

  useEffect(() => {
    if (elementRef.current && contentRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        left: rect.left,
        height: contentRect.height,
      });
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ height: isSticky ? dimensions.height : 'auto' }}
    >
      <div
        ref={contentRef}
        style={{
          ...(isSticky
            ? {
                position: 'fixed',
                top: dimensions.top,
                left: dimensions.left,
                width: dimensions.width,
                zIndex: 100,
              }
            : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}
