'use client';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Provider to resolve the problem with findDOMNode in Semantic UI React
 * Adds compatibility with React 18 and Next.js 13+
 */
export function SemanticUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Check if findDOMNode exists in ReactDOM
    if (typeof ReactDOM.findDOMNode !== 'function') {
      // Add findDOMNode to ReactDOM for compatibility with Semantic UI React
      // @ts-ignore - adding method to ReactDOM
      ReactDOM.findDOMNode = function findDOMNode(component) {
        if (component == null) {
          return null;
        }
        // Check if the component is a DOM element
        // @ts-ignore - checking for DOM element
        if (component.nodeType && component.nodeType === 1) {
          return component;
        }
        // Use internal React API to find the DOM node
        // @ts-ignore - используем внутренний API
        return ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.findHostInstance(
          component
        );
      };
    }
  }, []);

  return <>{children}</>;
}
