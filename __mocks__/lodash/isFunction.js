import isFunc from 'lodash/isFunction';

const isFunction = jest.fn(param => isFunc(param));
export default isFunction;
