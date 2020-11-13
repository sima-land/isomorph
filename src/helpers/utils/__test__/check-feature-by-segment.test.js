import { checkFeatureBySegment } from '../check-feature-by-segment';

describe('checkFeatureBySegment()', () => {
  describe('should return function which', () => {
    it('returns true when segments list contains "ALL"', () => {
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'ALL,A' })).toEqual(true);
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'A, ALL ' })).toEqual(true);
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'ALL' })).toEqual(true);
    });

    it('returns true when segments list contains user segment', () => {
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'A, B, C' })).toEqual(true);
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'A,B,C' })).toEqual(true);
    });

    it('returns false when segments list does not contain user segment', () => {
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'B,C' })).toEqual(false);
      expect(checkFeatureBySegment('MY_FEATURE')('A', { MY_FEATURE: 'AB,B,C' })).toEqual(false);
      expect(checkFeatureBySegment('MY_FEATURE')('A', {})).toEqual(false);
      expect(checkFeatureBySegment('MY_FEATURE')('A', undefined)).toEqual(false);
    });
  });
});
