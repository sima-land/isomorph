import { getPageResponseFormat } from '../get-page-response-format';

describe('getPageResponseFormat', () => {
  it('should return json', () => {
    const request = new Request('http://test.com', {
      headers: { accept: 'application/json' },
    });

    expect(getPageResponseFormat(request)).toBe('json');
  });

  it('should return html when no accept', () => {
    const request = new Request('http://test.com', {
      headers: { accept: '' },
    });

    expect(getPageResponseFormat(request)).toBe('html');
  });

  it('should return html', () => {
    const request = new Request('http://test.com', {
      headers: { accept: 'text/html' },
    });

    expect(getPageResponseFormat(request)).toBe('html');
  });
});
