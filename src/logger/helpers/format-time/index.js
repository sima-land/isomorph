/**
 * Форматирует дату
 * @return {string} Строка с датой для Pino
 */
const formatTime = () => `,"time":"${(new Date()).toISOString()}"`;
export default formatTime;
