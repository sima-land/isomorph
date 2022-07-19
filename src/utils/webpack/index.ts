import { pick, pickBy } from 'lodash';
import webpack from 'webpack';
import dotenv from 'dotenv';
import path from 'path';
import { Env } from '@humanwhocodes/env';

/**
 * Плагин для зашивания переменных среды в сборки.
 * В браузерную сборку зашьёт только переменные с префиксом "PUBLIC_".
 * ВАЖНО: все зашиваемые переменные будут доступны через глобальный объект __ISOMORPH_ENV__.
 */
export class EnvPlugin {
  options: {
    additional: string[];
    define?: Record<string, string>;
  };

  /**
   * @param options Опции.
   */
  constructor(options: { additional?: string[]; define?: Record<string, string> } = {}) {
    this.options = {
      additional: options.additional || [],
      define: options.define,
    };
  }

  /**
   * @param compiler Компилятор.
   */
  apply(compiler: webpack.Compiler) {
    const { NODE_ENV } = new Env().required;

    dotenv.config({ path: path.join(process.cwd(), `.env.${NODE_ENV}`) });

    const target = Array.isArray(compiler.options.target)
      ? compiler.options.target
      : [compiler.options.target];

    // browser
    if (target.includes('web')) {
      const valuesWeb: Record<string, string | undefined> = {
        ...this.options.define,
        ...pick(process.env, [...this.options.additional, 'NODE_ENV']),
        ...pickBy(process.env, (_, key) => key.startsWith('PUBLIC_')),
      };

      new webpack.DefinePlugin({ __ISOMORPH_ENV__: JSON.stringify(valuesWeb) }).apply(compiler);
      new webpack.DefinePlugin(
        Object.entries(valuesWeb).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[`process.env.${key}`] = JSON.stringify(value);
          return acc;
        }, {}),
      ).apply(compiler);
    }

    // node
    if (!target.includes('web')) {
      const valuesNode: Record<string, string | undefined> = {
        ...this.options.define,
        ...pick(process.env, [...this.options.additional, 'NODE_ENV']),
      };

      new webpack.DefinePlugin({ __ISOMORPH_ENV__: JSON.stringify(valuesNode) }).apply(compiler);

      if (this.options.define) {
        new webpack.DefinePlugin(
          Object.entries(this.options.define).reduce<Record<string, string>>(
            (acc, [key, value]) => {
              acc[`process.env.${key}`] = JSON.stringify(value);
              return acc;
            },
            {},
          ),
        ).apply(compiler);
      }
    }
  }
}
