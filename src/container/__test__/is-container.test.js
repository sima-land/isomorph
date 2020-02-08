import isContainer from '../is-container';

describe('function isContainer', () => {
  it('returns true if interface of passed instance is a container interface', () => {
    expect(isContainer({ get: jest.fn(), set: jest.fn() })).toBe(true);
  });
  it('returns false if interface of passed instance is not a container interface', () => {
    expect(isContainer({})).toBe(false);
  });
  it('returns false if passed instance is not an object', () => {
    expect(isContainer('I`m not an object!')).toBe(false);
  });
});
