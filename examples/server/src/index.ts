import { RootApp } from './apps/root';
import { Token } from './tokens';
import { KnownToken } from '@sima-land/isomorph/tokens';

RootApp().invoke(
  [Token.Root.config, KnownToken.logger, Token.Root.mainServer, KnownToken.Metrics.httpApp],
  (config, logger, mainServer, metricsServer) => {
    // main app
    mainServer.listen(config.mainPort, () => {
      logger.info(`Server started on port ${config.mainPort}`);
    });

    // metrics app
    metricsServer.listen(config.metricsPort, () => {
      logger.info(`Metrics app started on port ${config.metricsPort}`);
    });
  },
);
