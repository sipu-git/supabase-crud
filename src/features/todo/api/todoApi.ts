import { baseApi } from '../../../store/baseApi';
import { supabase } from '../../../utils/supabase';
import type { Task, CreateTaskInput, UpdateTaskInput, DeleteTaskInput } from '../types/todo.types';

function toApiError(error: unknown) {
  return { message: error instanceof Error ? error.message : 'Unexpected Supabase error.' };
}

const taskFields = 'id, user_id, title, is_done, created_at';

export const todoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], string>({
      async queryFn(userId) {
        const { data, error } = await supabase.from('tasks').select(taskFields)
          .eq('user_id', userId).order('created_at', { ascending: false });
        if (error) return { error: toApiError(error) };
        return { data: (data ?? []) as Task[] };
      },
      providesTags: (result) => result
        ? [{ type: 'Task', id: 'LIST' }, ...result.map((task) => ({ type: 'Task' as const, id: task.id }))]
        : [{ type: 'Task', id: 'LIST' }],
    }),
    createTask: builder.mutation<Task, CreateTaskInput>({
      async queryFn({ title, userId }) {
        const { data, error } = await supabase.from('tasks')
          .insert({ title: title.trim(), user_id: userId }).select(taskFields).single();
        if (error) return { error: toApiError(error) };
        return { data: data as Task };
      },
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
    updateTask: builder.mutation<Task, UpdateTaskInput>({
      async queryFn({ id, userId, ...changes }) {
        const { data, error } = await supabase.from('tasks').update(changes)
          .eq('id', id).eq('user_id', userId).select(taskFields).single();
        if (error) return { error: toApiError(error) };
        return { data: data as Task };
      },
      invalidatesTags: (_result, _error, task) => [
        { type: 'Task', id: task.id }, { type: 'Task', id: 'LIST' },
      ],
    }),
    deleteTask: builder.mutation<{ id: string }, DeleteTaskInput>({
      async queryFn({ id, userId }) {
        const { data, error } = await supabase.from('tasks').delete()
          .eq('id', id).eq('user_id', userId).select('id').single();
        if (error) return { error: toApiError(error) };
        return { data: { id: String(data.id) } };
      },
      invalidatesTags: (_result, _error, task) => [
        { type: 'Task', id: task.id }, { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = todoApi;
