import type { AxiosRequestConfig } from 'axios';
import type { AxiosInstanceWrapper } from 'middleware-axios';

export type HttpClient = AxiosInstanceWrapper;

export interface HttpClientFactory {
  (config?: AxiosRequestConfig): HttpClient;
}
