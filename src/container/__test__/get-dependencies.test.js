import getDependencies, { isStaticDependency } from '../get-dependencies';
import create from '../index';

/**
 * Тестовая функция.
 * @param {Object} params Параметры функции.
 * @param {Function} params.getValue Тестовая зависимость.
 * @param {*} params.initialValue Тестовая зависимость.
 * @return {*} Тестовый результат.
 */
const factory = ({ getValue, initialValue }) => getValue(initialValue);

describe('function isStaticDependency', () => {
  it('should work correctly with static dependency', () => {
    expect(isStaticDependency({ name: 'test', value: 'test' })).toBe(true);
  });
  it('works correctly with renamed dependency', () => {
    expect(isStaticDependency({ name: 'rename' })).toBe(false);
  });
  it('works correctly if dependency.name is not string', () => {
    expect(isStaticDependency({ name: null, value: 123 })).toBe(false);
  });
  it('works correctly if dependency.value is not defined', () => {
    expect(isStaticDependency({ name: 'test' })).toBe(false);
  });
});

describe('function getDependencies', () => {
  it('resolves mixed types of dependencies correctly', async () => {
    /**
     * Тестовая функция.
     * @return {number} Число.
     */
    const firstDependency = () => 1;
    const secondDependency = jest.fn(value => value ? value : 2);
    const container = create({
      services: [
        { name: 'getValue', value: firstDependency },
        { name: 'getValueSecond', value: secondDependency },
        {
          name: 'factory', factory, dependencies: [
            { getValue: 'getValueSecond' },
            { name: 'initialValue', value: 3 },
          ],
        },
      ],
    });
    const { result, getValue, myGetValue } = await getDependencies(
      container,
      [
        {
          result: 'factory',
        },
        'getValue',
        {
          myGetValue: 'getValueSecond',
        },
      ]
    );
    expect(result).toBe(3);
    expect(getValue).toBe(firstDependency);
    expect(myGetValue).toBe(secondDependency);
  });
  it('resolves direct dependencies correctly', async () => {
    const container = create({
      services: [
        {
          name: 'result',
          value: 6,
        },
      ],
    });
    const { result } = await getDependencies(container, ['result']);
    expect(result).toBe(6);
  });
  it('resolves static dependencies correctly', async () => {
    const container = create();
    const { result } = await getDependencies(container, [{ name: 'result', value: 4 }]);
    expect(result).toBe(4);
  });
  it('resolves renamed dependencies correctly', async () => {
    const container = create({
      services: [
        {
          name: 'someValue',
          value: 5,
        },
      ],
    });
    const { result } = await getDependencies(container, [{ result: 'someValue' }]);
    expect(result).toBe(5);
  });
  it('works without errors if "dependencies" is not defined', async () => {
    const container = create();
    await expect(getDependencies(container)).resolves.toEqual({});
  });
  it('works without errors if "dependencies" is defined incorrect', async () => {
    const container = create();
    await expect(getDependencies(container, [{}])).resolves.toEqual({});
  });
});
