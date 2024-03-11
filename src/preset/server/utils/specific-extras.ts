/**
 * Специфичные для наших микросервисов дополнительные данные ответа.
 */
export class SpecificExtras {
  private _meta: any;

  /**
   * Установит мета-данные.
   * @param meta Данные.
   * @return Контекст.
   */
  setMeta(meta: any): this {
    this._meta = meta;
    return this;
  }

  /**
   * Вернет установленные мета-данные.
   * @return Данные.
   */
  getMeta(): unknown {
    return this._meta;
  }
}
