import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  ready: boolean;
}

const initialState: AuthState = { session: null, ready: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.ready = true;
    },
  },
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;