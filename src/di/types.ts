/**
 * Токен - ключ который можно использовать для привязки реализации и получения компонента из контейнера.
 * За токеном можно закрепить интерфейс. В дальнейшем это поможет нне ошибиться при привязке реализации.
 */
export interface Token<T> {
  readonly _key: symbol;
  readonly _resolve: (registry: Map<symbol, any>) => T;
}

/**
 * Резолвер. Получив токен вернет реализацию интерфейса, который за ним закреплён.
 */
export interface Resolve {
  <T>(token: Token<T>): T;
}

/**
 * Провайдер - функция, которая, получив резолвер, должна вернуть реализацию интерфейса.
 */
export interface Provider<T> {
  (resolve: Resolve): T;
}

/**
 * DI-контейнер.
 * Позволяет зарегистрировать за токеном компонент в виде функции-провайдера и в дальнейшем получить его по токену.
 */
export interface Container {
  /**
   * Регистрирует провайдер.
   */
  set: <T = never>(token: Token<T>, provider: Provider<T>) => void;

  get: Resolve;
}

/**
 * Интерфейс привязки компонента к токену.
 */
export interface Binding<T> {
  /**
   * Привязывает к токену конкретное "статическое" значение.
   */
  toValue: (value: T) => void;

  /**
   * Привязывает к токену функцию-провайдер.
   */
  toProvider: (provider: Provider<T>) => void;
}

/** @internal */
export type ExtractType<T extends readonly Token<any>[]> = {
  [index in keyof T]: T[index] extends T[number] ? ReturnType<T[index]['_resolve']> : never;
};

/**
 * DI-Приложение. Расширенная версия DI-контейнера.
 * Позволяет применять пресеты, задавать "родительские" приложения, вызывать callback-функции с инъекцией компонентов.
 */
export interface Application {
  /**
   * Добавляет пресет к приложению. Пресет будет применен в момент первой попытки получить компонент или вызвать функцию.
   */
  preset(preset: Preset): void;

  /**
   * Получив приложение, пометит его как "родительское".
   * При попытке достать компонент, в случае если его нет в текущем приложении, будет произведена попытка найти его в "родительском".
   */
  attach(parent: Application): void;

  /**
   * Аналог метода set у Container. Получив токен вернет интерфейс привязки реализации.
   * @param token Токен.
   */
  bind<T>(token: Token<T>): Binding<T>;

  /**
   * Получив токен, вернет его реализацию если она была зарегистрирована.
   * @param token Токен.
   */
  get<T>(token: Token<T>): T;

  /**
   * Получив список токенов и callback-функцию, вызовет функцию с компонентами по соответствующим токенам.
   */
  invoke<Tokens extends readonly Token<any>[]>(
    tokens: [...Tokens],
    fn: (...args: ExtractType<Tokens>) => void,
  ): void;
}

/**
 * Пресет - набор провайдеров (с возможностью их добавлять/переопределять) который можно применить к DI-приложению.
 */
export interface Preset {
  /** Добавляет провайдер в пресет. */
  set: <T>(token: Token<T>, provider: Provider<T>) => this;

  /** Применяет пресет к переданному приложению. */
  apply: (app: Application) => void;
}
