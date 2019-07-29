import { addErrorHandling } from '..';

describe('addErrorHandling', () => {
  it('should send error "Аргумент handler должен быть функцией." to next', () => {
    expect(() => addErrorHandling()).toThrow(
      Error('Аргумент "handler" должен быть функцией.')
    );
  });
  it('should try call handler properly', () => {
    const mockedHandler = jest.fn();
    const mockedNext = jest.fn();
    addErrorHandling(mockedHandler)({}, {}, mockedNext);
    expect(mockedHandler).toHaveBeenCalledTimes(1);
    expect(mockedHandler).toHaveBeenCalledWith({}, {}, mockedNext);
    expect(mockedNext).toHaveBeenCalledTimes(0);
  });
  it('should catch error in handler correctly', () => {
    const mockedHandler = jest.fn().mockImplementation(() => {
      throw new Error('sample text');
    });
    const mockedNext = jest.fn();
    addErrorHandling(mockedHandler)({}, {}, mockedNext);
    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect(mockedNext).toHaveBeenCalledWith(Error('sample text'));
  });
  it('should catch error in handler and call errorHandler correctly', () => {
    const mockedHandler = jest.fn().mockImplementation(() => {
      throw new Error('sample text');
    });
    const mockedErrorHandler = jest.fn();
    const mockedNext = jest.fn();
    addErrorHandling(mockedHandler, mockedErrorHandler)({}, {}, mockedNext);
    expect(mockedErrorHandler).toHaveBeenCalledTimes(1);
    expect(mockedErrorHandler).toHaveBeenCalledWith(Error('sample text'), {}, {}, mockedNext);
    expect(mockedNext).toHaveBeenCalledTimes(0);
  });
});
