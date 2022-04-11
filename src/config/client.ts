import { Env } from '@humanwhocodes/env';

export function createConfigSource(): Env {
  return new Env(process.env);
}
