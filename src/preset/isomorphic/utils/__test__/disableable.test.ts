import { Disableable } from '../disableable';

describe('Disableable', () => {
  it('should has isDisabled method', () => {
    const disableable = new Disableable();
    expect(disableable.isDisabled()).toBe(false);

    disableable.disabled = true;
    expect(disableable.isDisabled()).toBe(true);

    disableable.disabled = false;
    expect(disableable.isDisabled()).toBe(false);

    let flag = true;
    disableable.disabled = () => flag;
    expect(disableable.isDisabled()).toBe(true);

    flag = false;
    expect(disableable.isDisabled()).toBe(false);
  });
});
