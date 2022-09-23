import type { container } from 'webpack';

/** @internal */
export interface RemoteProperty {
  name: string;
  remoteEntryPath?: string;
  version?: string;
}

/** @internal */
export type OriginalModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>[0];

/** @internal */
export interface ModuleFederationPluginOptions {
  /** Имя сервиса. */
  name: string;

  /** Имя удаленной точки входа. */
  filename?: string;

  /** Удаленные сервисы.  */
  remotes?: Record<string, string | RemoteProperty>;

  /** Предоставляемые сервисы. */
  exposes?: OriginalModuleFederationPluginOptions['exposes'];

  /** Общие зависимости.  */
  shared?: OriginalModuleFederationPluginOptions['shared'];

  /** Ключ свойства в глобальном объекте,в котором хранится карта точек входа в удаленные сервисы. */
  remoteEntriesGlobalKey?: string;

  /** Ключ свойства в глобальном объекте, в который добавляются контейнеры удаленных сервисов. */
  containersGlobalKey?: string;
}

/** @internal */
export type ReadyOptions = Omit<
  ModuleFederationPluginOptions,
  'remoteEntriesGlobalKey' | 'containersGlobalKey'
> &
  Required<
    Pick<ModuleFederationPluginOptions, 'remoteEntriesGlobalKey' | 'containersGlobalKey'>
  > & {
    library: Required<OriginalModuleFederationPluginOptions>['library'];
  };

/** @internal */
export type OriginalShared = NonNullable<OriginalModuleFederationPluginOptions['shared']>;

/** @internal */
type OriginalSharedObject = Exclude<OriginalShared, Array<unknown>>;

/** @internal */
export type SharedObject = Record<string, OriginalSharedObject[keyof OriginalSharedObject] | false>;

/** @internal */
export type Shared = SharedObject | (string | SharedObject)[];
