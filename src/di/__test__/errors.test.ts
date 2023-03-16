import { AlreadyBoundError, CircularDependencyError, NothingBoundError } from '../errors';
import { createToken } from '../token';

describe('NothingBoundError', () => {
  const token = createToken('something');

  it('should show message properly', () => {
    const error = new NothingBoundError(token);

    expect(error.message).toBe('Nothing bound to Token(something) in [unknown container]');
  });

  it('should handle name', () => {
    const error = new NothingBoundError(token, 'MyContainer');

    expect(error.message).toBe('Nothing bound to Token(something) in MyContainer');
  });
});

describe('AlreadyBoundError', () => {
  const token = createToken('hello');

  it('should show message properly', () => {
    const error = new AlreadyBoundError(token);

    expect(error.message).toBe(
      'Cannot rebind token in [unknown container], already bound: Token(hello)',
    );
  });

  it('should handle name', () => {
    const error = new AlreadyBoundError(token, 'ServerApp');

    expect(error.message).toBe('Cannot rebind token in ServerApp, already bound: Token(hello)');
  });
});

describe('CircularDependencyError', () => {
  const trace = [createToken('A'), createToken('B'), createToken('A')];

  it('should show message properly', () => {
    const error = new CircularDependencyError(trace);

    expect(error.message).toBe(
      'Circular dependency found in [unknown container], trace: Token(A) >> Token(B) >> Token(A)',
    );
  });

  it('should handle name', () => {
    const error = new CircularDependencyError(trace, 'BrowserApp');

    expect(error.message).toBe(
      'Circular dependency found in BrowserApp, trace: Token(A) >> Token(B) >> Token(A)',
    );
  });
});
