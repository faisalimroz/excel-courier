import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import parcelReducer from './slices/parcelSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parcels: parcelReducer,
    users: userReducer,
  },
}); 