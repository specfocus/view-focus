import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { useGetList, useGetManyAggregate } from '@specfocus/view-focus.data/operations';
import { FilterPayload } from '@specfocus/view-focus.data/operations/FilterPayload';
import { SortPayload } from '@specfocus/view-focus.data/operations/SortPayload';
import { useWatch } from '@specfocus/view-focus.forms/forms/useWatch';
import { useCallback, useMemo } from 'react';
import { UseQueryOptions } from 'react-query';
import { ChoicesContextValue } from '../choices/ChoicesContext';
import { useReferenceParams } from './useReferenceParams';

/**
 * Prepare data for the ReferenceArrayInput components
 *
 * @example
 *
 * const { allChoices, availableChoices, selectedChoices, error, isFetching, isLoading } = useReferenceArrayInputController({
 *      record: { referenceIds: ['id1', 'id2']};
 *      reference: 'reference';
 *      resource: 'resource';
 *      source: 'referenceIds';
 * });
 *
 * @param {Object} props
 * @param {Object} props.record The current resource record
 * @param {string} props.reference The linked resource name
 * @param {string} props.resource The current resource name
 * @param {string} props.source The key of the linked resource identifier
 *
 * @param {Props} props
 *
 * @return {Object} controllerProps Fetched data and callbacks for the ReferenceArrayInput components
 */
export const useReferenceArrayInputController = <
  RecordType extends Entity = any
>(
  props: UseReferenceArrayInputParams<RecordType>
): ChoicesContextValue<RecordType> => {
  const {
    debounce,
    enableGetChoices,
    filter,
    page: initialPage = 1,
    perPage: initialPerPage = 25,
    sort: initialSort = { field: 'id', order: 'DESC' },
    queryOptions = {},
    reference,
    source,
  } = props;
  const value = useWatch({ name: source });

  /**
   * Get the records related to the current value (with getMany)
   */
  const {
    data: referenceRecords,
    error: errorGetMany,
    isLoading: isLoadingGetMany,
    isFetching: isFetchingGetMany,
    refetch: refetchGetMany,
  } = useGetManyAggregate<RecordType>(
    reference,
    {
      ids: value || EmptyArray,
    },
    {
      enabled: value != null && value.length > 0,
    }
  );

  const [params, paramsModifiers] = useReferenceParams({
    resource: reference,
    page: initialPage,
    perPage: initialPerPage,
    sort: initialSort,
    debounce,
    filter,
  });

  // filter out not found references - happens when the dataProvider doesn't guarantee referential integrity
  const finalReferenceRecords = referenceRecords
    ? referenceRecords.filter(Boolean)
    : [];

  const isGetMatchingEnabled = enableGetChoices
    ? enableGetChoices(params.filterValues)
    : true;

  const {
    data: matchingReferences,
    total,
    pageInfo,
    error: errorGetList,
    isLoading: isLoadingGetList,
    isFetching: isFetchingGetList,
    refetch: refetchGetMatching,
  } = useGetList<RecordType>(
    reference,
    {
      pagination: {
        page: params.page,
        perPage: params.perPage,
      },
      sort: { field: params.sort, order: params.order },
      filter: { ...params.filter, ...filter },
    },
    { retry: false, enabled: isGetMatchingEnabled, ...queryOptions }
  );

  // We merge the currently selected records with the matching ones, otherwise
  // the component displaying the currently selected records may fail
  const finalMatchingReferences =
    matchingReferences && matchingReferences.length > 0
      ? mergeReferences(matchingReferences, finalReferenceRecords)
      : finalReferenceRecords.length > 0
        ? finalReferenceRecords
        : matchingReferences;

  const refetch = useCallback(() => {
    refetchGetMany();
    refetchGetMatching();
  }, [refetchGetMany, refetchGetMatching]);

  const currentSort = useMemo(
    () => ({
      field: params.sort,
      order: params.order,
    }),
    [params.sort, params.order]
  );
  return {
    sort: currentSort,
    allChoices: finalMatchingReferences,
    availableChoices: matchingReferences,
    selectedChoices: finalReferenceRecords,
    displayedFilters: params.displayedFilters,
    error: errorGetMany || errorGetList,
    filter,
    filterValues: params.filterValues,
    hideFilter: paramsModifiers.hideFilter,
    isFetching: isFetchingGetMany || isFetchingGetList,
    isLoading: isLoadingGetMany || isLoadingGetList,
    page: params.page,
    perPage: params.perPage,
    refetch,
    resource: reference,
    setFilters: paramsModifiers.setFilters,
    setPage: paramsModifiers.setPage,
    setPerPage: paramsModifiers.setPerPage,
    setSort: paramsModifiers.setSort,
    showFilter: paramsModifiers.showFilter,
    source,
    total: total,
    hasNextPage: pageInfo
      ? pageInfo.hasNextPage
      : total != null
        ? params.page * params.perPage < total
        : undefined,
    hasPreviousPage: pageInfo ? pageInfo.hasPreviousPage : params.page > 1,
  };
};

const EmptyArray = [];

// concatenate and deduplicate two lists of records
const mergeReferences = <RecordType extends Entity = any>(
  ref1: RecordType[],
  ref2: RecordType[]
): RecordType[] => {
  const res = [...ref1];
  const ids = ref1.map(ref => ref.id);
  ref2.forEach(ref => {
    if (!ids.includes(ref.id)) {
      ids.push(ref.id);
      res.push(ref);
    }
  });
  return res;
};

export interface UseReferenceArrayInputParams<
  RecordType extends Entity = any
> {
  debounce?: number;
  filter?: FilterPayload;
  queryOptions?: UseQueryOptions<{
    data: RecordType[];
    total?: number;
    pageInfo?: {
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
  }>;
  page?: number;
  perPage?: number;
  record?: RecordType;
  reference: string;
  resource?: string;
  sort?: SortPayload;
  source: string;
  enableGetChoices?: (filters: any) => boolean;
}
