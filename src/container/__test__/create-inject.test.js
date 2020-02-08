import create, { createFactory } from '../index';
import createInject from '../create-inject';

describe('function createInject', () => {
  it('creates wrapped function with injected dependencies', async () => {
    const target = jest.fn((power, result) => `5 to degree ${power} is ${result}`);
    const factory = jest.fn(({ num, power }) => num ** power);
    const container = create(
      {
        services: [
          {
            name: 'firstTestService',
            value: 5,
          },
          {
            name: 'secondTestService',
            factory,
            dependencies: [
              {
                num: 'firstTestService',
              },
              'power',
            ],
          },
        ],
      }
    );
    container.get = jest.fn(container.get);
    const inject = createInject(() => container);
    const wrapped = inject({
      target,
      dependencies: [
        {
          result: 'secondTestService',
        },
      ],
      registerArgs: (receivedContainer, power) => {
        receivedContainer.set({ name: 'power', value: power });
      },
    });
    expect(await wrapped(2)).toBe('5 to degree 2 is 25');
    expect(target).toHaveBeenCalledWith(2, 25);
    expect(factory).toHaveBeenCalledWith({ num: 5, power: 2 });
    expect(container.get).toHaveBeenCalledWith('secondTestService');
    expect(await wrapped(5)).toBe('5 to degree 5 is 3125');
    expect(container.get).toHaveBeenCalledWith('secondTestService');
  });
  it('creates wrapped function if dependencies is not defined', async () => {
    const target = jest.fn();
    const inject = createInject(createFactory());
    const wrapped = inject({
      target,
      injectArgs: (container, test) => {
        if (test) {
          container.set({ name: 'test', value: test });
        }
      },
    });
    await expect(wrapped()).resolves.toEqual();
    await wrapped(5);
    expect(target).toHaveBeenCalledWith(5);
  });

  const factory = jest.fn(() => 3);
  const getContainer = createFactory({
    services: [
      {
        name: 'test',
        factory,
      },
    ],
  });
  const inject = createInject(getContainer);
  const target = jest.fn();
  it('creates wrapped function if registerArgs function is not defined', async () => {
    const wrapped = inject({ target, dependencies: ['test'] });
    await expect(wrapped()).resolves.toEqual();
    await wrapped(6);
    expect(target).toHaveBeenCalledWith(6, 3);
    expect(factory).toHaveBeenCalledWith({});
  });
  it('creates wrapped function if registerArgs is not function', async () => {
    const wrapped = inject({ target, dependencies: ['test'], registerArgs: 'I am not a function!' });
    await expect(wrapped()).resolves.toEqual();
    await wrapped(7);
    expect(target).toHaveBeenCalledWith(7, 3);
    expect(factory).toHaveBeenCalledWith({});
  });
  it('throws error if getContainer does not return container', async () => {
    const badInject = createInject(() => {});
    const errorThrowWrapped = badInject({ target });
    expect(errorThrowWrapped()).rejects.toThrow(TypeError);
  });
});
