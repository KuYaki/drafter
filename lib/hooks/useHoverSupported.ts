import { useState, useEffect } from 'react';

export function useHoverSupported() {
  const [isHoverSupported, setIsHoverSupported] = useState(true);

  useEffect(() => {
    // Check if hover is supported using media query
    const mediaQuery = window.matchMedia('(hover: hover)');

    const updateHoverSupport = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsHoverSupported(e.matches);
    };

    // Check initial state
    updateHoverSupport(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', updateHoverSupport);

    return () => {
      mediaQuery.removeEventListener('change', updateHoverSupport);
    };
  }, []);

  return isHoverSupported;
}
