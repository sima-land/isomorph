import type { CSSProperties, ReactNode } from 'react';

const style: CSSProperties = {
  padding: '40px',
  margin: '0 auto',
  maxWidth: '960px',
};

export function Layout({ children }: { children?: ReactNode }) {
  return <div style={style}>{children}</div>;
}
