import { AuthContext, convertLegacyAuthProvider } from '@specfocus/view-focus.auth/providers';
import type { AuthProvider, LegacyAuthProvider } from '@specfocus/view-focus.auth/providers/AuthProvider';
import {
  convertLegacyDataProvider,
  DataProviderContext,
  defaultDataProvider
} from '@specfocus/view-focus.data/providers';
import { DataProvider, LegacyDataProvider } from '@specfocus/view-focus.data/providers/DataProvider';
import type { Translator } from '@specfocus/view-focus.i18n/translations/TranslationContext';
import { TranslationContextProvider } from '@specfocus/view-focus.i18n/translations/TranslationContextProvider';
import { AdminRouter } from '@specfocus/view-focus.navigation/routes';
import { NotificationContextProvider } from '@specfocus/view-focus.notification/providers';
import { memoryStore, Store, StoreContextProvider } from '@specfocus/view-focus.states/states';
import { History } from 'history';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ResourceDefinitionContextProvider } from '../resources/ResourceDefinitionContext';
import type { DashboardComponent, ResourceChildren } from '../types';

export interface BaseRootContextProps {
  authProvider?: AuthProvider | LegacyAuthProvider;
  basename?: string;
  children?: ResourceChildren;
  dashboard?: DashboardComponent;
  dataProvider?: DataProvider | LegacyDataProvider;
  store?: Store;
  queryClient?: QueryClient;
  /**
   * @deprecated Wrap your Admin inside a Router to change the routing strategy
   */
  history?: History;
  translator?: Translator;
  theme?: object;
}

export const BaseRootContext = (props: BaseRootContextProps) => {
  const {
    authProvider,
    basename,
    dataProvider,
    translator,
    store,
    children,
    history,
    queryClient,
  } = props;

  if (!dataProvider) {
    throw new Error(`Missing dataProvider prop.
React-admin requires a valid dataProvider function to work.`);
  }

  const finalQueryClient = useMemo(() => queryClient || new QueryClient(), [
    queryClient,
  ]);

  const finalAuthProvider = useMemo(
    () =>
      authProvider instanceof Function
        ? convertLegacyAuthProvider(authProvider)
        : authProvider,
    [authProvider]
  );

  const finalDataProvider = useMemo(
    () =>
      dataProvider instanceof Function
        ? convertLegacyDataProvider(dataProvider)
        : dataProvider,
    [dataProvider]
  );

  return (
    <AuthContext.Provider value={finalAuthProvider}>
      <DataProviderContext.Provider value={finalDataProvider}>
        <StoreContextProvider value={store}>
          <QueryClientProvider client={finalQueryClient}>
            <AdminRouter history={history} basename={basename}>
              <TranslationContextProvider value={translator}>
                <NotificationContextProvider>
                  <ResourceDefinitionContextProvider>
                    {children}
                  </ResourceDefinitionContextProvider>
                </NotificationContextProvider>
              </TranslationContextProvider>
            </AdminRouter>
          </QueryClientProvider>
        </StoreContextProvider>
      </DataProviderContext.Provider>
    </AuthContext.Provider>
  );
};

BaseRootContext.defaultProps = {
  dataProvider: defaultDataProvider,
  store: memoryStore(),
};
