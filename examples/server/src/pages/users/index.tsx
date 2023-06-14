import { createReducer } from '@reduxjs/toolkit';
import { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux/remote-data';
import { useSelector } from 'react-redux';
import { END } from 'redux-saga';
import { call, put } from 'typed-redux-saga/macro';
import { SagaDeps, User } from '../../app';

type PostsState = RemoteDataState<User[], unknown>;

const initialState: PostsState = {
  data: [],
  error: null,
  status: 'initial',
};

export const actions = {
  ...RemoteData.createActions<User[], unknown>('posts'),
} as const;

export const reducer = createReducer(initialState, builder => {
  RemoteData.applyHandlers<User[], unknown>(actions, builder);
});

export function* saga({ api }: SagaDeps) {
  const response = yield* call(api.getUsers);

  if (response.ok) {
    yield* put(actions.success(response.data));
  } else {
    yield* put(actions.failure(response.data || response.error));
  }

  yield* put(END);
}

export function UsersPage() {
  const items = useSelector((state: PostsState) => state.data);

  return (
    <div style={{ margin: '0 32px' }}>
      <h1>Users</h1>

      {items.map(item => (
        <article key={item.id}>
          <h3>{item.username}</h3>
          {item.name}
        </article>
      ))}

      <a href='/posts'>Go to posts</a>
    </div>
  );
}