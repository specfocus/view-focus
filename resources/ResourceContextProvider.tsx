import React from 'react';
import { ReactElement } from 'react';
import { ResourceContext, ResourceContextValue } from './ResourceContext';

/**
 * Create a Resource Context with the resource name
 *
 * Some @specfocus/view-focus.mui-demo components rely on the resource name to be available in the context.
 * This component provides it.
 *
 * If the value is empty, the context is not provided.
 *
 * @param {string} value the resource name
 * @example
 *
 * import { ResourceContextProvider } from '@specfocus/view-focus.mui-demo';
 *
 * const MyComponent = () => (
 *    <ResourceContextProvider value="posts">
 *       <MyResourceSpecificComponent />
 *   </ResourceContextProvider>
 * );
 */
export const ResourceContextProvider = ({
  children,
  value,
}: {
  children: ReactElement;
  value?: ResourceContextValue;
}) =>
  value ? (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  ) : (
    children
  );
