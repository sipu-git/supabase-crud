import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TaskFilter = 'all' | 'active' | 'completed';

interface TodoState {
  filter: TaskFilter;
}

const initialState: TodoState = { filter: 'all' };

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    setTaskFilter(state, action: PayloadAction<TaskFilter>) {
      state.filter = action.payload;
    },
  },
});

export const { setTaskFilter } = todoSlice.actions;
export default todoSlice.reducer;