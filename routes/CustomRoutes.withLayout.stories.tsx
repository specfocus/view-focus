import { useAuthenticated, useLogin } from '@specfocus/view-focus.auth/providers';
import { FakeBrowserDecorator } from '@specfocus/view-focus.navigation/storybook/FakeBrowser';
import { Route } from 'react-router-dom';
import { BaseRoot } from '../layouts/BaseRoot';
import { Resource } from '../resources/Resource';
import { CustomRoutes } from './CustomRoutes';

export default {
  title: 'view-focus/CustomRoutes/WithLayout',
  decorators: [FakeBrowserDecorator],
  parameters: {
    initialEntries: ['/custom'],
  },
};

export const WithLayoutCustomRoute = (argsOrProps, context) => {
  const history = context?.history || argsOrProps.history;

  return (
    <BaseRoot
      authProvider={authProvider}
      dataProvider={dataProvider as any}
      history={history}
      loginPage={Login}
      layout={Layout}
    >
      <CustomRoutes>
        <Route path="/custom" element={<CustomWithLayout />} />
      </CustomRoutes>
      <Resource name="posts" list={PostList} />
    </BaseRoot>
  );
};

const dataProvider = {
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: { id: 0 } }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

let signedIn = false;
const authProvider = {
  login: () => {
    signedIn = true;
    return Promise.resolve({ data: { id: '123' } });
  },
  logout: () => Promise.resolve(),
  checkAuth: () => (signedIn ? Promise.resolve() : Promise.reject()),
  checkError: () => Promise.reject(),
  getPermissions: () => Promise.resolve(),
};

const Login = () => {
  const login = useLogin();
  return (
    <div>
      <h1>Login page</h1>
      <button onClick={() => login({})}>Sign in</button>
    </div>
  );
};

const Layout = ({ children }) => (
  <div>
    <h1>Layout</h1>
    {children}
  </div>
);

const PostList = () => (
  <div>
    <h1>PostList page</h1>
  </div>
);

const CustomWithLayout = () => {
  useAuthenticated();
  return (
    <div>
      <h1>Custom page with layout, requiring authentication</h1>
    </div>
  );
};
