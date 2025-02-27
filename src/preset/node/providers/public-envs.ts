/**
 * Провайдер публичных переменных среды.
 * @return Объект с публичными переменными среды.
 */
export function providePublicEnvs() {
  const publicEnvs: Record<string, string | undefined> = {
    IS_REDUX_DEVTOOLS_ENABLED: process.env.IS_REDUX_DEVTOOLS_ENABLED,
  };
  for (const key in process.env) {
    if (key.startsWith('PUBLIC_')) {
      publicEnvs[key] = process.env[key];
    }
  }
  return publicEnvs;
}
