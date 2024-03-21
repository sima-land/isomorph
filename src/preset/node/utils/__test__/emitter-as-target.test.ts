import { EventEmitter } from 'node:events';
import { EmitterAsTarget } from '../emitter-as-target';

describe('EmitterAsTarget', () => {
  it('should works as regular event target', () => {
    const emitter = new EventEmitter();
    const target = new EmitterAsTarget(emitter);

    const spy = jest.fn();

    target.addEventListener('test', spy);
    expect(spy).toHaveBeenCalledTimes(0);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(1);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(2);

    target.removeEventListener('test', spy);
    expect(spy).toHaveBeenCalledTimes(2);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should callback as object', () => {
    const emitter = new EventEmitter();
    const target = new EmitterAsTarget(emitter);

    const spy = jest.fn();

    target.addEventListener('test', { handleEvent: spy });
    expect(spy).toHaveBeenCalledTimes(0);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(1);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(2);

    target.removeEventListener('test', { handleEvent: spy });
    expect(spy).toHaveBeenCalledTimes(2);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should handle callback as null', () => {
    const emitter = new EventEmitter();
    const target = new EmitterAsTarget(emitter);

    expect(() => {
      target.addEventListener('foo', null);
    }).not.toThrow();

    expect(() => {
      target.removeEventListener('foo', null);
    }).not.toThrow();
  });

  it('should work through emitter', () => {
    const emitter = new EventEmitter();
    const target = new EmitterAsTarget(emitter);

    const spy = jest.fn();

    emitter.on('test', spy);
    expect(spy).toHaveBeenCalledTimes(0);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(1);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(2);

    emitter.removeListener('test', spy);
    expect(spy).toHaveBeenCalledTimes(2);

    target.dispatchEvent(new Event('test'));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should handle options.once', () => {
    const emitter = new EventEmitter();
    const target = new EmitterAsTarget(emitter);

    const spy = jest.fn();

    target.addEventListener('foo', spy, { once: true });
    expect(spy).toHaveBeenCalledTimes(0);

    target.dispatchEvent(new Event('foo'));
    expect(spy).toHaveBeenCalledTimes(1);

    target.dispatchEvent(new Event('foo'));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
