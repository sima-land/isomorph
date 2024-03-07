import { BaseConfig } from '../../../../config';
import { RESPONSE_EVENT_TYPE } from '../../../isomorphic/constants';
import { getServeMeasuring } from '../get-serve-measuring';

describe('getServeMeasuring', () => {
  it('should collect metrics', async () => {
    const config: BaseConfig = {
      env: 'test',
      appName: 'testApp',
      appVersion: 'testVer',
    };

    const middleware = getServeMeasuring(config);
    const events = new EventTarget();

    expect(async () => {
      await middleware(
        new Request('http://test.com'),
        () => {
          events.dispatchEvent(new Event(RESPONSE_EVENT_TYPE.renderStart));
          events.dispatchEvent(new Event(RESPONSE_EVENT_TYPE.renderFinish));
          return Promise.resolve<Response>(new Response('OK'));
        },
        {
          events,
        },
      );
    }).not.toThrow();
  });
});
