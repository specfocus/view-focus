import React from 'react';
import expect from 'expect';
import { render, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { ShowController } from './ShowController';
import { BaseRootContext } from '../core';
import { DataProvider } from '../types';

describe('useShowController', () => {
  const defaultProps = {
    id: 12,
    resource: 'posts',
    debounce: 200,
  };

  it('should call the dataProvider.getOne() function on mount', async () => {
    const getOne = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ data: { id: 12, title: 'hello' } })
      );
    const dataProvider = ({ getOne } as unknown) as DataProvider;
    render(
      <BaseRootContext dataProvider={dataProvider}>
        <ShowController {...defaultProps}>
          {({ record }) => <div>{record && record.title}</div>}
        </ShowController>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(getOne).toHaveBeenCalled();
      expect(screen.queryAllByText('hello')).toHaveLength(1);
    });
  });

  it('should decode the id from the route params', async () => {
    const getOne = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ data: { id: 'test?', title: 'hello' } })
      );
    const dataProvider = ({ getOne } as unknown) as DataProvider;
    render(
      <BaseRootContext
        dataProvider={dataProvider}
        history={createMemoryHistory({
          initialEntries: ['/posts/test%3F'],
        })}
      >
        <Routes>
          <Route
            path="posts/:id"
            element={
              <ShowController resource="posts">
                {({ record }) => (
                  <div>{record && record.title}</div>
                )}
              </ShowController>
            }
          />
        </Routes>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(getOne).toHaveBeenCalledWith('posts', { id: 'test?' });
    });
    await waitFor(() => {
      expect(screen.queryAllByText('hello')).toHaveLength(1);
    });
  });

  it('should use the id provided through props if any', async () => {
    const getOne = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ data: { id: 0, title: 'hello' } })
      );
    const dataProvider = ({ getOne } as unknown) as DataProvider;
    render(
      <BaseRootContext
        dataProvider={dataProvider}
        history={createMemoryHistory({
          initialEntries: ['/posts/test%3F'],
        })}
      >
        <Routes>
          <Route
            path="posts/:id"
            element={
              <ShowController id={0} resource="posts">
                {({ record }) => (
                  <div>{record && record.title}</div>
                )}
              </ShowController>
            }
          />
        </Routes>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(getOne).toHaveBeenCalledWith('posts', { id: 0 });
    });
    await waitFor(() => {
      expect(screen.queryAllByText('hello')).toHaveLength(1);
    });
  });

  it('should accept custom client query options', async () => {
    const mock = jest.spyOn(console, 'error').mockImplementation(() => { });
    const getOne = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject(new Error()));
    const onError = jest.fn();
    const dataProvider = ({ getOne } as unknown) as DataProvider;
    render(
      <BaseRootContext
        dataProvider={dataProvider}
        history={createMemoryHistory({
          initialEntries: ['/posts/1'],
        })}
      >
        <Routes>
          <Route
            path="posts/:id"
            element={
              <ShowController
                resource="posts"
                queryOptions={{ onError }}
              >
                {() => <div />}
              </ShowController>
            }
          />
        </Routes>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(getOne).toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
    mock.mockRestore();
  });
});
