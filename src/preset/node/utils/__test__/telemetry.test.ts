import { getSemanticHeaders } from '../telemetry';

describe('getSemanticHeaders', () => {
  it('should return null', () => {
    expect(getSemanticHeaders({})).toBeNull();
  });
  it('should return headers with semantic declaration', () => {
    expect(
      getSemanticHeaders({
        Authorization: 'bearer samplekey',
        'x-proprietary-header': 'value',
        'x-numeric-value': 0,
        'x-empty-value': undefined,
      }),
    ).toEqual({
      'http.request.header.Authorization': 'bearer samplekey',
      'http.request.header.x-proprietary-header': 'value',
      'http.request.header.x-numeric-value': 0,
    });
  });
});
