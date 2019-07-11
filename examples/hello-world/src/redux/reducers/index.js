import { combineReducers } from 'redux';
import { reducer as appReducer } from './app';

export const reducer = combineReducers({
  app: appReducer,
});
