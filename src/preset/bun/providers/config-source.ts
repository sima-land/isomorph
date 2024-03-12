/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { ConfigSource, createConfigSource } from '../../../config';

export function provideConfigSource(): ConfigSource {
  return createConfigSource(Bun.env);
}
