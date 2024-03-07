import { hideFirstId } from '../hide-first-id';

describe('hideFirstId', () => {
  const cases = [
    {
      input: '/api/v2/something/123456/some-bff/123456',
      output: ['/api/v2/something/{id}/some-bff/123456', 123456],
    },
    {
      input: '/api/v2/something/222/some-bff/333',
      output: ['/api/v2/something/{id}/some-bff/333', 222],
    },
    {
      input: '/api/v2/something/45320/some-bff',
      output: ['/api/v2/something/{id}/some-bff', 45320],
    },
  ];

  it('should replace first id only', () => {
    cases.forEach(({ input, output }) => {
      expect(hideFirstId(input)).toEqual(output);
    });
  });
});
