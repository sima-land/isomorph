import { MainApp } from './di/apps/main';
import { TOKEN } from './di/tokens';

MainApp().invoke(
  [TOKEN.appConfig, TOKEN.Known.logger, TOKEN.httpServer, TOKEN.Known.Metrics.httpApp],
  (config, logger, mainServer, metricsServer) => {
    mainServer.listen(config.http.ports.main, () => {
      logger.info(`Server started on port ${config.http.ports.main}`);
    });

    metricsServer.listen(config.http.ports.metrics, () => {
      logger.info(`Metrics app started on port ${config.http.ports.metrics}`);
    });
  },
);
