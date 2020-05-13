import { createSelector } from 'reselect';
import propEq from 'lodash/fp/propEq';
import identity from 'lodash/identity';
import { STATUSES } from '../constants';

const statusEq = propEq('status');
const isInitial = statusEq(STATUSES.initial);
const isFetching = statusEq(STATUSES.fetching);
const isSuccessful = statusEq(STATUSES.success);
const isFailed = statusEq(STATUSES.failure);

/**
 * Вернет новый набор селекторов статуса.
 * @param {Function} [selectSection=identity] Вернет раздел состояния, у которого есть статус.
 * @return {{ isInitial: Function, isFetching: Function, isSuccessful: Function, isFailed: Function }} Селекторы.
 */
const create = (selectSection = identity) => ({
  isInitial: createSelector(selectSection, isInitial),
  isFetching: createSelector(selectSection, isFetching),
  isSuccessful: createSelector(selectSection, isSuccessful),
  isFailed: createSelector(selectSection, isFailed),
});

export const StatusSelectors = {
  create,
  isInitial,
  isFetching,
  isSuccessful,
  isFailed,
};
