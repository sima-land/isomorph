/**
 * Форматирует дату
 * @return {string} Строка с датой в формате ISO
 */
const formatTime = () => `,"time":"${(new Date()).toISOString()}"`;
export default formatTime;
