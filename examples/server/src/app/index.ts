import type { BaseConfig } from '@sima-land/isomorph/config';
import type { SauceResponse } from '@sima-land/isomorph/http-client/sauce';

export interface AppConfig extends BaseConfig {
  httpPort: {
    main: number;
    metrics: number;
  };
}

export interface SagaDeps {
  api: HttpApi;
}

export interface HttpApi {
  getUsers(): Promise<SauceResponse<User[]>>;
  getPosts(): Promise<SauceResponse<Post[]>>;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}
