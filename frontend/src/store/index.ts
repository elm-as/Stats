import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import datasetReducer from './slices/datasetSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    dataset: datasetReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
