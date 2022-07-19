import { AlreadyBoundError, CircularDependencyError, NothingBoundError } from '../errors';
import { createToken } from '../token';

describe('NothingBoundError', () => {
  it('should show message properly', () => {
    const error = new NothingBoundError(createToken('some-component'));
    expect(error.message).toBe('Nothing bound to Token(some-component)');
  });
});

describe('AlreadyBoundError', () => {
  it('should show message properly', () => {
    const error = new AlreadyBoundError(createToken('some-component'));
    expect(error.message).toBe('Cannot rebind token, already bound: Token(some-component)');
  });
});

describe('CircularDependencyError', () => {
  it('should show message properly', () => {
    const trace = [createToken('foo'), createToken('bar'), createToken('baz')];
    const error = new CircularDependencyError(trace);
    expect(error.message).toBe(
      'Circular dependency found, trace: Symbol(foo) >> Symbol(bar) >> Symbol(baz)',
    );
  });
});
