/**
 * Определяет, необходимо ли подключать dotenv и если необходимо, подключает его.
 * @param {string} environment Значение переменной среды NODE_ENV.
 */
const useDotEnv = environment => {
  ['development', 'test'].includes(environment) && require('dotenv').config();
};

export default useDotEnv;
