// eslint-disable-next-line jsdoc/check-tag-names
/**
 * @jest-environment node
 */

import adapter from '../index';
import { REQUEST_STAGES } from '../constants';
import { create } from 'axios';
import http from 'http';

import https from 'https';
import { Readable } from 'stream';
import { uncompressResponse, createOptions } from '../helpers';
import { fakeCert, fakeKey } from '../__fixtures__/fake-keys';

jest.mock('../helpers', () => {
  const original = jest.requireActual('../helpers');
  return {
    ...original,
    __esModule: true,
    createOptions: jest.fn(original.createOptions),
    uncompressResponse: jest.fn(original.uncompressResponse),
  };
});

let server;
describe('adapter', () => {
  afterEach(() => {
    if (server) {
      server.close();
      server = null;
    }
  });

  const instance = create({
    adapter,
  });

  it('should return promise', () => {
    expect(adapter().catch(() => {})).toBeInstanceOf(Promise);
  });

  it('should pass request without data', async () => {
    const data = {
      test: 'test',
    };
    server = await http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(JSON.stringify(data));
    }).listen(4444);

    const res = await instance.get('http://localhost:4444/', { responseType: 'arraybuffer' });
    expect(res.status).toEqual(200);
    expect(JSON.parse(res.data.toString())).toEqual(data);
  });

  it('should throw error if request contains bad data', async () => {
    const badData = 12345;
    try {
      await instance.post('http://localhost/3333', badData);
    } catch (error) {
      expect(error).toEqual(Error('Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream'));
    }
  });

  it('should pass request with data', async () => {
    const data = {
      test: 'test',
    };
    server = await http.createServer((req, res) => {
      const buff = [];
      req
        .on('data', chunk => buff.push(chunk))
        .on('end', () => {
          const reqData = Buffer.concat(buff).toString();
          expect(JSON.parse(reqData)).toEqual(data);
        });
      res.end();
    }).listen(4444);

    const res = await instance.post('http://localhost:4444/', data);
    expect(res.status).toEqual(200);
  });

  it('should pass request with data stream', done => {
    const data = 'test string';
    const streamData = new Readable({ read: () => {} });
    streamData.push('test string');
    streamData.push(null);
    server = http.createServer((req, res) => {
      req.pipe(res);
    }).listen(4444, () => {
      instance.post(
        'http://localhost:4444/',
        streamData,
        {
          responseType: 'stream',
        }
      ).then(res => {
        let result = '';
        const stream = res.data;
        stream
          .on('readable', () => stream.read())
          .on('data', chunk => {
            result += chunk.toString('utf8');
          })
          .on('end', () => {
            expect(result).toEqual(data);
            done();
          });
      });
    });
  });

  it('should reject if request stream throw error', done => {
    const streamData = new Readable();
    server = http.createServer((req, res) => {
      req.pipe(res);
    }).listen(4444, () => {
      instance.post(
        'http://localhost:4444/',
        streamData,
      ).catch(err => {
        expect(err.message).toEqual('The _read() method is not implemented');
        done();
      });
    });
  });

  it('should pass request with data buffer', done => {
    const buff = Buffer.alloc(1024, 'x');
    server = http.createServer((req, res) => {
      expect(req.headers['content-length']).toEqual(buff.length.toString());
      req.pipe(res);
    }).listen(4444, () => {
      instance.post(
        'http://localhost:4444/',
        buff,
        {
          responseType: 'stream',
        }
      ).then(res => {
        let result = '';
        const stream = res.data;
        stream
          .on('readable', () => stream.read())
          .on('data', chunk => {
            result += chunk.toString('utf8');
          })
          .on('end', () => {
            expect(result).toEqual(buff.toString());
            done();
          });
      });
    });
  });

  it('should emit events', async () => {
    const spy = jest.fn();
    const emitter = {
      emit: spy,
    };

    const options = {
      key: fakeKey,
      cert: fakeCert,
    };
    createOptions.mockImplementationOnce(config => ({ ...createOptions(config), rejectUnauthorized: false }));
    server = await https.createServer(options, (req, res) => {
      res.end('test string');
    }).listen(4444);

    expect(spy).not.toBeCalled();

    await instance.get('https://localhost:4444/', { emitter });

    expect(spy).toHaveBeenNthCalledWith(1, REQUEST_STAGES.start);
    expect(spy).toHaveBeenNthCalledWith(2, REQUEST_STAGES.dnsLookupFinish);
    expect(spy).toHaveBeenNthCalledWith(3, REQUEST_STAGES.tcpConnectionConnect);
    expect(spy).toHaveBeenNthCalledWith(4, REQUEST_STAGES.tlsHandshakeFinish);
    expect(spy).toHaveBeenNthCalledWith(5, REQUEST_STAGES.firstByteReceived);
    expect(spy).toHaveBeenNthCalledWith(6, REQUEST_STAGES.end);
  });

  it('should handle maxContentLength property', async () => {
    const data = {
      test: 'test'.padEnd(20),
    };
    const SIZE = 10;
    server = await http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(JSON.stringify(data));
    }).listen(4444);

    try {
      await instance.get('http://localhost:4444/', { maxContentLength: SIZE });
    } catch (error) {
      expect(error).toEqual(Error(`maxContentLength size of ${SIZE} exceeded`));
    }
  });

  it('should handle timeout property', async () => {
    const timeout = 50;
    server = await http.createServer((req, res) => {
      setTimeout(() => res.end(), 100);
    }).listen(4444);

    try {
      await instance.get('http://localhost:4444/', { timeout });
    } catch (error) {
      expect(error).toEqual(Error(`timeout of ${timeout} ms exceeded`));
    }
  });

  it('should reject if response stream emit error', async () => {
    uncompressResponse.mockImplementationOnce(res => {
      res.on('readable', () => res.emit('error', new Error('test error')));
      return res;
    });
    server = await http.createServer((req, res) => {
      // res.setHeader('content-length', null);
      res.write('test');
      res.end();
    }).listen(4444);
    try {
      await instance.get('http://localhost:4444/');
    } catch (error) {
      expect(error).toEqual(Error('test error'));
    }
  });

  it('should remove `content-encoding` header correctly', async () => {
    uncompressResponse.mockImplementationOnce(res => {
      res.data = null;
      return { ...res };
    });
    const data = {
      test: 'test',
    };
    server = await http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.setHeader('Content-Encoding', 'gzip');
      res.end(JSON.stringify(data));
    }).listen(4444);

    const res = await instance.get('http://localhost:4444/', { responseType: 'stream' });
    expect(res.status).toEqual(200);
    expect(res.headers['content-encoding']).not.toBeDefined();
  });
});
