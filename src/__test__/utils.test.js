import { getMsFromHRT, wrapInMeasureEvent, isNumeric } from '../utils.js';
import { EventEmitter } from 'events';

describe('function getMsFromHRT()', () => {
  it('should return NaN for non valid hrtime', () => {
    const invalidValues = [
      '123214',
      124124,
      [],
      null,
      undefined,
      {},
    ];
    invalidValues.forEach(value => {
      expect(Object.is(NaN, getMsFromHRT(value))).toBe(true);
    });
  });
  it('should return number for valid hrtime', () => {
    expect(getMsFromHRT([100, 2000000])).toBe(100002);
  });
});

describe('function wrapInMeasureEvent', () => {
  const emitter = new EventEmitter();
  jest.spyOn(emitter, 'emit');
  const fn = jest.fn(test => test);
  const startEvent = 'test-start';
  const endEvent = 'test-end';
  const testData = 'test';
  it('wraps the passed function in an event call to measure the runtime', async () => {
    const wrappedFunction = wrapInMeasureEvent({ fn, startEvent, endEvent, emitter });
    expect(emitter.emit).not.toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
    const result = await wrappedFunction(testData);
    expect(emitter.emit).toHaveBeenCalledWith(startEvent);
    expect(emitter.emit).toHaveBeenCalledWith(endEvent);
    expect(fn).toHaveBeenCalledWith(testData);
    expect(result).toEqual(testData);
  });
  it('should check arguments and throw errors', () => {
    expect(
      () => wrapInMeasureEvent({ fn: 'test', startEvent, endEvent, emitter })
    ).toThrowError('First argument property "fn" must be a function');
    expect(
      () => wrapInMeasureEvent({ startEvent, endEvent, emitter })
    ).toThrowError('First argument property "fn" must be a function');
    expect(
      () => wrapInMeasureEvent({ fn, startEvent: null, endEvent, emitter })
    ).toThrowError('First argument property "startEvent" must be a string');
    expect(
      () => wrapInMeasureEvent({ fn, endEvent, emitter })
    ).toThrowError('First argument property "startEvent" must be a string');
    expect(
      () => wrapInMeasureEvent({ fn, startEvent, endEvent: null, emitter })
    ).toThrowError('First argument property "endEvent" must be a string');
    expect(
      () => wrapInMeasureEvent({ fn, startEvent, emitter })
    ).toThrowError('First argument property "endEvent" must be a string');
    expect(
      () => wrapInMeasureEvent({ fn, startEvent, endEvent })
    ).toThrowError('First argument property "emitter" must be an instance of EventEmitter');
    expect(
      () => wrapInMeasureEvent({ fn, startEvent, endEvent, emitter: null })
    ).toThrowError('First argument property "emitter" must be an instance of EventEmitter');
  });
});

describe('function isNumeric()', () => {
  it('should return false for non numeric values', () => {
    const nonNumericValues = [
      'test',
      null,
      undefined,
      false,
      true,
      NaN,
      Symbol(),
      () => {},
      [],
      {},
      Infinity,
    ];
    nonNumericValues.forEach(testValue => {
      expect(isNumeric(testValue)).toBe(false);
    });
  });
  it('should return true for numeric values', () => {
    const numericValues = [
      '123.456',
      123.456,
      123,
      123n,
    ];
    numericValues.forEach(testValue => {
      expect(isNumeric(testValue)).toBe(true);
    });
  });
});
