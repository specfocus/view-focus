import React from 'react';
import { screen, render } from '@testing-library/react';
import { useGetResourceLabel } from './useGetResourceLabel';

import { TestTranslationProvider } from '@specfocus/view-focus.i18n/translations';

describe('useGetResourceLabel', () => {
  test.each([
    [2, 'Posts'],
    [1, 'Post'],
    [0, 'Post'],
  ])(
    'should infer the %s and %s version of the resource name',
    (count, expected) => {
      const Component = () => {
        const getResourceLabel = useGetResourceLabel();
        const label = getResourceLabel('posts', count);

        return <p>{label}</p>;
      };

      render(
        <TestTranslationProvider messages={{}}>
          <Component />
        </TestTranslationProvider>
      );

      expect(screen.queryByText(expected)).not.toBeNull();
    }
  );
});
