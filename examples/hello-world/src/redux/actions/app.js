import { createActions } from 'reduxsauce';

export const { Types, Creators } = createActions({
  startApp: ['settings'],
  finishLoading: null,
  setCurrentData: ['data'],
  initDataLoading: null,
}, { prefix: 'app/' });
