import { MainApp } from './di/apps/main';
import { TOKEN } from './di/tokens';

MainApp().invoke(
  [TOKEN.appConfig, TOKEN.Known.logger, TOKEN.httpServer, TOKEN.Known.Metrics.httpApp],
  (config, logger, mainServer, metricsServer) => {
    mainServer.listen(config.httpPort.main, () => {
      logger.info(`Server started on port ${config.httpPort.main}`);
    });

    metricsServer.listen(config.httpPort.metrics, () => {
      logger.info(`Metrics app started on port ${config.httpPort.metrics}`);
    });
  },
);
