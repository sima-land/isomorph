import type { EventEmitter } from 'node:events';

/**
 * Наивная реализация обёртки, превращающей EventEmitter в EventTarget.
 */
export class EmitterAsTarget extends EventTarget {
  private emitter: EventEmitter;

  /** @inheritdoc */
  constructor(emitter: EventEmitter) {
    super();
    this.emitter = emitter;
  }

  /** @inheritdoc */
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ) {
    if (!callback) {
      return;
    }

    const listener = typeof callback === 'function' ? callback : callback.handleEvent;

    switch (true) {
      case typeof options === 'object' && options !== null && options.once: {
        this.emitter.once(type, listener as (...args: any[]) => void);
        break;
      }
      default: {
        this.emitter.on(type, listener as (...args: any[]) => void);
        break;
      }
    }
  }

  /** @inheritdoc */
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null) {
    if (!callback) {
      return;
    }

    const listener = typeof callback === 'function' ? callback : callback.handleEvent;

    this.emitter.removeListener(type, listener as (...args: any[]) => void);
  }

  /** @inheritdoc */
  dispatchEvent(event: Event) {
    return this.emitter.emit(event.type, event);
  }
}
