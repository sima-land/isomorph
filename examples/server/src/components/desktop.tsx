import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../reducers/app';
import styles from './desktop.module.css';

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.card}>
      {title && <div className={styles.title}>{title}</div>}
      {children}
    </div>
  );
}

export function DesktopApp() {
  const user = useSelector(selectors.user);
  const currencies = useSelector(selectors.currencies);

  return (
    <div className={styles.root}>
      <Card title='User'>
        {user.data && user.status === 'success' && (
          <ul>
            <li>id: {user.data.id}</li>
            <li>name: {user.data.name}</li>
          </ul>
        )}
        {user.status === 'failure' && user.error}
      </Card>

      <Card title='Currencies'>
        {currencies.data && currencies.status === 'success' && (
          <ul>
            {currencies.data.map((currency: any) => (
              <li key={currency.id}>{currency.name}</li>
            ))}
          </ul>
        )}
        {currencies.status === 'failure' && currencies.error}
      </Card>
    </div>
  );
}
