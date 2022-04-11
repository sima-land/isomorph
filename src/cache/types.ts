export interface Cache {
  get: (key: string) => void;
  set: (key: string, value: any) => void;
  delete: (key: string) => void;
  clear: () => void;
  has: (key: string) => void;
}
