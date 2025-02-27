import { defineEnv, asEnvVariables } from './utils';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { EnvPluginOptions } from './types';

/**
 * Плагин для зашивания переменных среды в сборки.
 * В браузерную сборку зашьёт только переменные с префиксом "PUBLIC_".
 * ВАЖНО: все зашиваемые переменные будут доступны через глобальный объект __ISOMORPH_ENV__.
 * @deprecated
 */
export class EnvPlugin implements WebpackPluginInstance {
  options: Required<EnvPluginOptions>;

  /**
   * @param options Опции.
   */
  constructor(options: EnvPluginOptions = {}) {
    this.options = {
      target: options.target ?? 'auto',
      dotenvUsage: options.dotenvUsage ?? true,
      additional: options.additional ?? [],
      define: options.define ?? {},
    };
  }

  /**
   * @param compiler Компилятор.
   */
  apply(compiler: Compiler) {
    const { webpack } = compiler;

    const env = defineEnv({
      dotenvUsage: this.options.dotenvUsage,
      onError: error => {
        compiler.hooks.compilation.tap('EnvPlugin', compilation => {
          compilation.warnings.push(new webpack.WebpackError(`[EnvPlugin] ${String(error)}`));
        });
      },
    });

    let values: Record<string, string | undefined> | null = null;
    let target: string | undefined;

    // define target
    if (this.options.target === 'auto') {
      target = typeof compiler.options.target === 'string' ? compiler.options.target : undefined;
    } else {
      target = this.options.target;
    }

    // define values based on target
    switch (target) {
      case 'web': {
        const targetKeys = [...this.options.additional, 'NODE_ENV'];

        values = { ...this.options.define };

        for (const name of Object.keys(env)) {
          if (targetKeys.includes(name) || name.startsWith('PUBLIC_')) {
            values[name] = env[name];
          }
        }
        break;
      }
      case 'node': {
        const targetKeys = [...this.options.additional, 'NODE_ENV'];

        values = { ...this.options.define };

        for (const name of Object.keys(env)) {
          if (targetKeys.includes(name) || name.startsWith('PUBLIC_')) {
            values[name] = env[name];
          }
        }
        break;
      }
      default: {
        compiler.hooks.compilation.tap('EnvPlugin', compilation => {
          compilation.warnings.push(
            new webpack.WebpackError('[EnvPlugin] Target is unknown, variables will NOT be added'),
          );
        });
        break;
      }
    }

    if (values) {
      new webpack.DefinePlugin({ __ISOMORPH_ENV__: JSON.stringify(values) }).apply(compiler);
      new webpack.DefinePlugin(asEnvVariables(values)).apply(compiler);
    }
  }
}
