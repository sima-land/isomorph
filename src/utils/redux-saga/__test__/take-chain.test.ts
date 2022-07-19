import { delay, fork, put, race, take } from 'redux-saga/effects';
import { generateTakeChain, putDelayed, takeChain } from '../take-chain';

const SettlementTypes = {
  UPDATE: 'settlement',
  REMOVE: 'settlement',
};

describe('takeChain', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 123);
  });

  const testTypes = [SettlementTypes.UPDATE, SettlementTypes.REMOVE];
  const timeout = 100;
  const testTask = jest.fn();
  const deps: [string, number] = ['John', 23];

  it('generateTakeChain few actions', () => {
    const gen = generateTakeChain(timeout, testTypes, testTask, deps);

    expect(gen.next().value).toEqual(take(testTypes));

    expect(gen.next({ type: SettlementTypes.REMOVE.toString() }).value).toEqual(
      fork(putDelayed, timeout, { type: 'BREAK_123' }),
    );

    expect(gen.next().value).toEqual(
      race({
        action: take(testTypes),
        canceled: take('BREAK_123'),
      }),
    );
    expect(
      gen.next({
        action: { type: SettlementTypes.UPDATE.toString() },
        canceled: { type: 'BREAK_123' },
      }).value,
    ).toEqual(
      fork(testTask, ...deps, [
        { type: SettlementTypes.REMOVE.toString() },
        { type: SettlementTypes.UPDATE.toString() },
      ]),
    );
    expect(gen.next()).toBeTruthy();
  });

  it('generateTakeChain one action', () => {
    const gen = generateTakeChain(timeout, testTypes, testTask, deps);

    expect(gen.next().value).toEqual(take(testTypes));

    expect(gen.next({ type: 'settlement/REMOVE' }).value).toEqual(
      fork(putDelayed, timeout, { type: 'BREAK_123' }),
    );

    expect(gen.next().value).toEqual(
      race({
        action: take(testTypes),
        canceled: take('BREAK_123'),
      }),
    );
    expect(
      gen.next({
        action: undefined,
        canceled: { type: 'BREAK_123' },
      }).value,
    ).toEqual(fork(testTask, ...deps, [{ type: 'settlement/REMOVE' }]));
    expect(gen.next()).toBeTruthy();
  });

  it('generateTakeChain without canceled', () => {
    const gen = generateTakeChain(timeout, testTypes, testTask, deps);

    expect(gen.next().value).toEqual(take(testTypes));

    expect(gen.next({ type: 'settlement/REMOVE' }).value).toEqual(
      fork(putDelayed, timeout, { type: 'BREAK_123' }),
    );

    expect(gen.next().value).toEqual(
      race({
        action: take(testTypes),
        canceled: take('BREAK_123'),
      }),
    );
    expect(
      gen.next({
        action: undefined,
        canceled: undefined,
      }).value,
    ).toBeTruthy();
  });

  it('generateTakeChain when puts all actions and have not canceled', () => {
    const gen = generateTakeChain(timeout, testTypes, testTask, deps);

    expect(gen.next().value).toEqual(take(testTypes));

    expect(gen.next({ type: SettlementTypes.REMOVE.toString() }).value).toEqual(
      fork(putDelayed, timeout, { type: 'BREAK_123' }),
    );

    expect(gen.next().value).toEqual(
      race({
        action: take(testTypes),
        canceled: take('BREAK_123'),
      }),
    );

    expect(
      gen.next({
        action: { type: SettlementTypes.UPDATE.toString() },
        canceled: undefined,
      }).value,
    ).toEqual(
      fork(testTask, ...deps, [
        { type: SettlementTypes.REMOVE.toString() },
        { type: SettlementTypes.UPDATE.toString() },
      ]),
    );
    expect(gen.next()).toBeTruthy();
  });

  it('should fork generateTakeChain', () => {
    const fakeTakeChain = takeChain(timeout, testTypes, testTask, ...deps);

    expect(fakeTakeChain).toEqual(fork(generateTakeChain, timeout, testTypes, testTask, deps));
  });
});

describe('putDelayed', () => {
  it('should works properly', () => {
    const gen = putDelayed(10, { type: 'test' });

    expect(gen.next().value).toEqual(delay(10));
    expect(gen.next().value).toEqual(put({ type: 'test' }));

    expect(gen.next()).toBeTruthy();
  });
});
