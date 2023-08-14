import { CombinedState, combineReducers } from '@reduxjs/toolkit';
import { Currency, CurrencyState } from './currency';
import { User, UserState } from './user';

export type RootState = CombinedState<{ user: UserState; currency: CurrencyState }>;

export const rootReducer = combineReducers({
  user: User.reducer,
  currency: Currency.reducer,
});
