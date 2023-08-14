import { ReactNode } from 'react';
import styles from './card.module.css';

export function Card({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <div className={styles.card}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}
