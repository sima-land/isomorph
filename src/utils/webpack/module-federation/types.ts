import type { container } from 'webpack';

export interface RemoteProperty {
  name: string;
  remoteEntryPath?: string;
  version?: string;
}

export type OriginalModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>[0];

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

export type ReadyOptions = Omit<
  ModuleFederationPluginOptions,
  'remoteEntriesGlobalKey' | 'containersGlobalKey'
> &
  Required<
    Pick<ModuleFederationPluginOptions, 'remoteEntriesGlobalKey' | 'containersGlobalKey'>
  > & {
    library: Required<OriginalModuleFederationPluginOptions>['library'];
  };
