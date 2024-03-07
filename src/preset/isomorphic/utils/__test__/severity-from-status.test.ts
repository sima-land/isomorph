import { severityFromStatus } from '../severity-from-status';

describe('severityFromStatus', () => {
  it('should works', () => {
    expect(severityFromStatus(200)).toBe('info');
    expect(severityFromStatus(201)).toBe('info');
    expect(severityFromStatus(204)).toBe('info');

    expect(severityFromStatus(300)).toBe('warning');
    expect(severityFromStatus(302)).toBe('warning');
    expect(severityFromStatus(400)).toBe('warning');
    expect(severityFromStatus(404)).toBe('warning');
    expect(severityFromStatus(422)).toBe('warning');
    expect(severityFromStatus(499)).toBe('warning');

    expect(severityFromStatus(undefined)).toBe('error');
    expect(severityFromStatus(100)).toBe('error');
    expect(severityFromStatus(199)).toBe('error');
    expect(severityFromStatus(500)).toBe('error');
    expect(severityFromStatus(503)).toBe('error');
  });
});
