import {
  validatePostStatus,
  validateDeleteStatus,
  isOkStatus,
} from '../statuses-validator';

describe('function validatePostStatus()', () => {
  it('returns correct data', () => {
    expect(validatePostStatus(201)).toBeTruthy();
    expect(validatePostStatus(500)).toBeFalsy();
  });
});

describe('function validateDeleteStatus()', () => {
  it('returns correct data', () => {
    expect(validateDeleteStatus(204)).toBeTruthy();
    expect(validateDeleteStatus(200)).toBeTruthy();
    expect(validateDeleteStatus(500)).toBeFalsy();
  });
});

describe('function isOkStatus()', () => {
  it('returns correct data', () => {
    expect(isOkStatus(204)).toBeFalsy();
    expect(isOkStatus(500)).toBeFalsy();
    expect(isOkStatus(200)).toBeTruthy();
  });
});
