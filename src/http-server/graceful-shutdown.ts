import type { Server } from 'http';

export function gracefulShutdown(
  server: Server,
  {
    timeout = 10000,
  }: {
    timeout?: number;
  } = {},
) {
  function handleShutdown() {
    server.close(() => {
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, timeout);
  }

  // e.g. kill
  process.on('SIGTERM', handleShutdown);

  // e.g. Ctrl + C
  process.on('SIGINT', handleShutdown);
}
