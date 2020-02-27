/**
 * Стадии запроса к API.
 * @type {Object}
 */
export const REQUEST_STAGES = Object.freeze({
  start: 'start:request',
  dnsLookupFinish: 'finish:DNS Lookup',
  tcpConnectionConnect: 'finish:TCP Connection',
  tlsHandshakeFinish: 'finish:TLS Handshake',
  firstByteReceived: 'finish:Time to First Byte',
  end: 'finish:Data Loading',
});
