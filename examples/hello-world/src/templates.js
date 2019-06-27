const templates = {
  development: {
    checker: config => Boolean(config.isDevelopment),
    template: data => {data.content;},
  },
  production: {
    checker: config => Boolean(config.isProduction),
    template: data => {data.content;},
  },
};

export default templates;
