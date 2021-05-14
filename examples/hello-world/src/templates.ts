const templates = {
  development: {
    checker: (config: any) => Boolean(config.isDevelopment),
    template: (data: any) => data.content,
  },
  production: {
    checker: (config: any) => Boolean(config.isProduction),
    template: (data: any) => data.content,
  },
} as const;

export default templates;
