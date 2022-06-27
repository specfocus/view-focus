import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { useTranslate } from '@specfocus/view-focus.i18n/i18n/useTranslate';
import get from 'lodash/get';
import { isValidElement, ReactElement, useCallback } from 'react';
import { RecordContextProvider } from '../records';

export type OptionTextElement = ReactElement<{
  record: Entity;
}>;
export type OptionTextFunc = (choice: any) => string | OptionTextElement;
export type OptionText = OptionTextElement | OptionTextFunc | string;

export interface ChoicesProps {
  choices?: any[];
  isFetching?: boolean;
  isLoading?: boolean;
  optionValue?: string;
  optionText?: OptionText;
  translateChoice?: boolean;
}

export interface UseChoicesOptions {
  optionValue?: string;
  optionText?: OptionText;
  disableValue?: string;
  translateChoice?: boolean;
}

/*
 * Returns helper functions for choices handling.
 *
 * @param optionText Either a string defining the property to use to get the choice text, a function or a React element
 * @param optionValue The property to use to get the choice value
 * @param translateChoice A boolean indicating whether to option text should be translated
 *
 * @returns An object with helper functions:
 * - getChoiceText: Returns the choice text or a React element
 * - getChoiceValue: Returns the choice value
 */
export const useChoices = ({
  optionText = 'name',
  optionValue = 'id',
  disableValue = 'disabled',
  translateChoice = true,
}: UseChoicesOptions) => {
  const translate = useTranslate();

  const getChoiceText = useCallback(
    choice => {
      if (isValidElement<{ record: any; }>(optionText)) {
        return (
          <RecordContextProvider value={choice}>
            {optionText}
          </RecordContextProvider>
        );
      }
      const choiceName =
        typeof optionText === 'function'
          ? optionText(choice)
          : get(choice, optionText);

      return isValidElement(choiceName)
        ? choiceName
        : translateChoice
          ? translate(String(choiceName), { _: choiceName })
          : String(choiceName);
    },
    [optionText, translate, translateChoice]
  );

  const getChoiceValue = useCallback(choice => get(choice, optionValue), [
    optionValue,
  ]);

  const getDisableValue = useCallback(choice => get(choice, disableValue), [
    disableValue,
  ]);

  return {
    getChoiceText,
    getChoiceValue,
    getDisableValue,
  };
};