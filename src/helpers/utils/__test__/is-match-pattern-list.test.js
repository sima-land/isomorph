import isMatchPatternList from '../is-match-pattern-list';

describe('isMatchPatternList', () => {
  it('should return correctly', () => {
    const patternList = [
      '/abc/',
      'def',
      'foo/.*',
      'bar/baz',
    ];
    expect(isMatchPatternList('aaabccccc', patternList)).toBeFalsy();
    expect(isMatchPatternList('dddeffff', patternList)).toBeTruthy();
    expect(isMatchPatternList('bar/foo/', patternList)).toBeTruthy();
    expect(isMatchPatternList('bar/fo/', patternList)).toBeFalsy();
    expect(isMatchPatternList('/', patternList)).toBeFalsy();
    expect(isMatchPatternList('', patternList)).toBeFalsy();
    expect(isMatchPatternList(null, patternList)).toBeFalsy();
    expect(isMatchPatternList('dddeffff', {})).toBeFalsy();
    expect(isMatchPatternList('dddeffff', 'def')).toBeFalsy();
    expect(isMatchPatternList('dddeffff', [''])).toBeTruthy();
  });
});
