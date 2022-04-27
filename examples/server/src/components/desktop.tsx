import React from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../reducers/app';

export function DesktopApp() {
  const currencies = useSelector(selectors.currencies);

  return (
    <div>
      <h1>Example app</h1>

      <h2>Desktop version</h2>
      <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem, nam.</p>

      <h2>Currencies</h2>
      <ul>
        {currencies?.map((currency: any) => (
          <li key={currency.id}>{currency.name}</li>
        ))}
      </ul>
    </div>
  );
}
