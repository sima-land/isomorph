import type { Handler } from '../../../http';

/**
 * ВАЖНО: временная экспериментальная утилита, скорее всего будет удалена в будущем.
 * @inheritdoc
 */
export function getStatsHandler(): Handler {
  /** @inheritdoc */
  const getHeapStats = async () => {
    // ВАЖНО: должны быть именно кавычки "'" по причине https://github.com/web-infra-dev/rspack/issues/5938#issuecomment-2000393152
    const jsc = await import(
      /* webpackIgnore: true */
      'bun:jsc'
    );

    return jsc.heapStats();
  };

  return async () => {
    const stats = await getHeapStats();

    return new Response(JSON.stringify(stats, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  };
}
