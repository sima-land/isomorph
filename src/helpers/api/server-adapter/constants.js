/**
 * Стадии запроса к API.
 * @type {Object}
 */
export const REQUEST_STAGES = Object.freeze({
  start: 'start:DNS Lookup',
  dnsLookupFinish: 'start:TCP Connection',
  lowerTransportCreated: 'start:TLS Handshake',
  transportCreated: 'start:Time to First Byte',
  firstByteReceived: 'start:Data Loading',
  end: 'end',
});
