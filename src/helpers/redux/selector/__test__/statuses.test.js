import { StatusSelectors } from '../statuses';
import isFunction from 'lodash/isFunction';
import { STATUSES } from '../../constants';

describe('StatusSelectors', () => {
  it('should contain props', () => {
    expect(isFunction(StatusSelectors.create)).toBe(true);
    expect(isFunction(StatusSelectors.isInitial)).toBe(true);
    expect(isFunction(StatusSelectors.isFetching)).toBe(true);
    expect(isFunction(StatusSelectors.isSuccessful)).toBe(true);
    expect(isFunction(StatusSelectors.isFailed)).toBe(true);
  });

  it('should contain properly worked selectors', () => {
    expect(StatusSelectors.isInitial({ status: STATUSES.initial })).toBe(true);
    expect(StatusSelectors.isFetching({ status: STATUSES.fetching })).toBe(true);
    expect(StatusSelectors.isSuccessful({ status: STATUSES.success })).toBe(true);
    expect(StatusSelectors.isFailed({ status: STATUSES.failure })).toBe(true);

    expect(StatusSelectors.isInitial({ status: null })).toBe(false);
    expect(StatusSelectors.isFetching({ status: null })).toBe(false);
    expect(StatusSelectors.isSuccessful({ status: null })).toBe(false);
    expect(StatusSelectors.isFailed({ status: null })).toBe(false);
  });

  it('Prop "create" should return set of selectors', () => {
    const selectors = StatusSelectors.create(state => state.user);

    expect(selectors.isInitial({ user: { status: STATUSES.initial } })).toBe(true);
    expect(selectors.isFetching({ user: { status: STATUSES.fetching } })).toBe(true);
    expect(selectors.isSuccessful({ user: { status: STATUSES.success } })).toBe(true);
    expect(selectors.isFailed({ user: { status: STATUSES.failure } })).toBe(true);
  });

  it('Prop "create" should handle undefined as first argument', () => {
    const selectors = StatusSelectors.create();

    expect(selectors.isInitial({ status: STATUSES.initial })).toBe(true);
    expect(selectors.isFetching({ status: STATUSES.fetching })).toBe(true);
    expect(selectors.isSuccessful({ status: STATUSES.success })).toBe(true);
    expect(selectors.isFailed({ status: STATUSES.failure })).toBe(true);
  });
});
