import { MainApp } from './app';
import { TOKEN } from './tokens';

MainApp().invoke(
  [TOKEN.config, TOKEN.Lib.logger, TOKEN.Lib.Express.app, TOKEN.Lib.Metrics.expressApp],
  (config, logger, mainServer, metricsServer) => {
    mainServer.listen(config.http.ports.main, () => {
      logger.info(`Server started on port ${config.http.ports.main}`);
    });

    metricsServer.listen(config.http.ports.metrics, () => {
      logger.info(`Metrics app started on port ${config.http.ports.metrics}`);
    });
  },
);
