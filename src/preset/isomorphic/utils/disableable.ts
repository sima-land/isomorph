/**
 * Объект, который может быть помечен как disabled.
 * @todo Возможно стоит заменить наследование от этого класса на передачу параметра в конструктор.
 * Например в виде объекта класса DisableController (по аналогии с AbortController).
 * Чтобы нельзя было включить обработчик в том месте где хочется.
 * Также возможно стоит просто научить классы принимать AbortController.
 */
export class Disableable {
  disabled: boolean | (() => boolean);

  /** @inheritdoc */
  constructor() {
    this.disabled = false;
  }

  /**
   * Определяет отключен ли обработчик.
   * @return Отключен ли обработчик.
   */
  isDisabled() {
    if (typeof this.disabled === 'function') {
      return this.disabled();
    }

    return this.disabled;
  }
}
