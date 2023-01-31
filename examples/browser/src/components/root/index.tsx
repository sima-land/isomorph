import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import { Card } from '../card';
import styles from './root.module.css';

export function Root() {
  const user = useSelector((state: RootState) => state.user);
  const currency = useSelector((state: RootState) => state.currency);

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Пример приложения</h1>

      <div className={styles.content}>
        <Card title='Пользователь'>
          {user.status === 'fetching' && 'Loading...'}
          {user.status === 'failure' && user.error}
          {user.status === 'success' && user.data && (
            <ul>
              <li>id: {user.data.id}</li>
              <li>name: {user.data.name}</li>
            </ul>
          )}
        </Card>

        <Card title='Валюты'>
          {currency.status === 'fetching' && 'Loading...'}
          {currency.status === 'failure' && currency.error}
          {currency.status === 'success' && currency.data && (
            <ul>
              {currency.data.map(item => (
                <li key={item.id}>
                  <span className={styles.grapheme}>{item.grapheme}</span> {item.description}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
