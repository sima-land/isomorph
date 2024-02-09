import { Fragment } from 'react';

const items = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Posts',
    href: '/posts',
  },
  {
    name: 'Authors',
    href: '/authors',
  },
];

export function Nav() {
  return (
    <nav>
      {items.map((item, index) => (
        <Fragment key={index}>
          <a href={item.href}>{item.name}</a>
          {index < items.length - 1 ? ' • ' : null}
        </Fragment>
      ))}
    </nav>
  );
}
