import promWorker from '..';

const observe = jest.fn();
const inc = jest.fn();
const labels = jest.fn(() => ({
  inc,
  observe,
}));
const metrics = {
  test: {
    labels,
  },
};
const config = {
  version: 1,
  place: 'development',
};
const startHtrtime = [2711, 576658578];
const endHtrtime = [2721, 983369182];

describe('promWorker()', () => {
  it('method begin() returns current hrtime', () => {
    jest.spyOn(process, 'hrtime')
      .mockImplementation(() => startHtrtime);
    const instance = promWorker();
    const startTime = instance.begin();

    expect(startTime).toStrictEqual(startHtrtime);
  });

  it('method end() counts time and observe', () => {
    jest.spyOn(process, 'hrtime')
      .mockImplementation(() => endHtrtime);
    const startTime = startHtrtime;
    const instance = promWorker({ config, metrics });

    instance.end(startTime, 'test');
    expect(observe).toHaveBeenCalledWith(2721983);
    expect(labels).toHaveBeenCalledWith(
      config.version,
      config.place
    );
  });

  it('method end() send values of labels', () => {
    const startTime = startHtrtime;
    const instance = promWorker({ config, metrics });

    instance.end(startTime, 'test', 'testParam');
    expect(labels).toHaveBeenCalledWith(
      config.version,
      config.place,
      'testParam'
    );
  });

  it('method inc() increments counter', () => {
    const instance = promWorker({ config, metrics });

    instance.inc('test', 'testParam');
    expect(labels).toHaveBeenCalledWith(
      config.version,
      config.place,
      'testParam'
    );
  });
});
