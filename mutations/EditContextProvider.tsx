import React from 'react';
import { ReactNode } from 'react';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { RecordContextProvider } from '../records';
import { SaveContextProvider } from './SaveContextProvider';
import { usePickSaveContext } from './usePickSaveContext';
import { EditContext } from './EditContext';
import { EditControllerResult } from './useEditController';

/**
 * Create an Edit Context.
 *
 * @example
 *
 * const MyEdit = (props) => {
 *     const controllerProps = useEditController(props);
 *     return (
 *         <EditContextProvider value={controllerProps}>
 *             <MyEditView>
 *         </EditContextProvider>
 *     );
 * };
 *
 * const MyEditView = () => {
 *     const record = useRecordContext();
 *     // or, to rerender only when the save operation change but not data
 *     const { saving } = useEditContext();
 * }
 *
 * @see EditContext
 * @see RecordContext
 */
export const EditContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: EditControllerResult;
}) => (
  <EditContext.Provider value={value}>
    <SaveContextProvider value={usePickSaveContext(value)}>
      <RecordContextProvider<Partial<Entity>>
        value={value && value.record}
      >
        {children}
      </RecordContextProvider>
    </SaveContextProvider>
  </EditContext.Provider>
);
