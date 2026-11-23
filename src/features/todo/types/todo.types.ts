export interface Task {
  id: string;
  user_id: string;
  title: string;
  is_done: boolean;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  userId: string;
}

export interface UpdateTaskInput {
  id: string;
  userId: string;
  title?: string;
  is_done?: boolean;
}

export interface DeleteTaskInput {
  id: string;
  userId: string;
}
