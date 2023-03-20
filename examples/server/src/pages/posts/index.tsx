import { createReducer } from '@reduxjs/toolkit';
import { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux/remote-data';
import { useSelector } from 'react-redux';
import { END } from 'redux-saga';
import { call, put } from 'typed-redux-saga/macro';
import { Post, SagaDeps } from '../../app';

type PostsState = RemoteDataState<Post[], unknown>;

const initialState: PostsState = {
  data: [],
  error: null,
  status: 'initial',
};

export const actions = {
  ...RemoteData.createActions<Post[], unknown>('posts'),
} as const;

export const reducer = createReducer(initialState, builder => {
  RemoteData.applyHandlers<Post[], unknown>(actions, builder);
});

export function* saga({ api }: SagaDeps) {
  const response = yield* call(api.getPosts);

  if (response.ok) {
    yield* put(actions.success(response.data));
  } else {
    yield* put(actions.failure(response.data || response.error));
  }

  yield* put(END);
}

export function PostsPage() {
  const items = useSelector((state: PostsState) => state.data);

  return (
    <div style={{ margin: '0 32px' }}>
      <h1>Posts</h1>

      {items.map(item => (
        <article key={item.id}>
          <h3>{item.title}</h3>
          {item.body}
        </article>
      ))}

      <a href='/users'>Go to users</a>
    </div>
  );
}
