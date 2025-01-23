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
      }),
    ).toEqual({
      'http.request.header.Authorization': 'bearer samplekey',
      'http.request.header.x-proprietary-header': 'value',
    });
  });
});
