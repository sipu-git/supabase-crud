import { useState } from 'react';
import { ArrowDownUp, Search } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setTaskFilter, type TaskFilter } from '../../../store/todo.slice';
import { useDeleteTaskMutation, useGetTasksQuery, useUpdateTaskMutation } from '../api/todoApi';
import type { Task } from '../types/todo.types';

const filters: Array<{ label: string; value: TaskFilter }> = [
  { label: 'All tasks', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export function TaskTable({ userId }: { userId: string }) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.todo.filter);
  const { data: tasks = [], isLoading, isFetching, error } = useGetTasksQuery(userId);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState('');

  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'active' ? !task.is_done : filter === 'completed' ? task.is_done : true;
    return matchesFilter && task.title.toLowerCase().includes(search.trim().toLowerCase());
  });

  async function saveEdit(task: Task) {
    const title = editTitle.trim();
    if (!title) {
      setActionError('Task title cannot be empty.');
      return;
    }
    const result = await updateTask({ id: task.id, userId, title });
    if ('error' in result) {
      setActionError('Unable to update task. Check your connection and table policies.');
      return;
    }
    setEditingId(null);
    setActionError('');
  }

  async function toggleTask(task: Task, checked: boolean) {
    const result = await updateTask({ id: task.id, userId, is_done: checked });
    setActionError('error' in result ? 'Unable to update task. Check your connection and table policies.' : '');
  }

  async function removeTask(taskId: string) {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    const result = await deleteTask({ id: taskId, userId });
    setActionError('error' in result ? 'Unable to delete task. Check your connection and table policies.' : '');
  }

  return (
    <Card>
      <CardHeader className="gap-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <CardTitle>Your tasks</CardTitle>
            <CardDescription>{isFetching ? 'Syncing with Supabase...' : tasks.length + ' tasks in your list'}</CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" aria-label="Search tasks" placeholder="Search tasks..." value={search}
              onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter tasks">
          {filters.map((item) => (
            <Button key={item.value} size="sm" variant={filter === item.value ? 'secondary' : 'outline'}
              aria-pressed={filter === item.value} onClick={() => dispatch(setTaskFilter(item.value))}>
              {item.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {actionError && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{actionError}</p>}
        {error ? (
          <p className="py-12 text-center text-sm text-destructive">Could not load tasks. Check your Supabase connection and RLS policies.</p>
        ) : isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading tasks...</p>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed px-5 py-12 text-center">
            <p className="font-medium">{search ? 'No matching tasks' : 'Nothing to show here'}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? 'Try a different search term.' : 'Add a new task to get started.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><span className="sr-only">Complete</span></TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="hidden sm:table-cell"><span className="inline-flex items-center gap-1">Created <ArrowDownUp className="h-3.5 w-3.5" /></span></TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox checked={task.is_done} aria-label={task.is_done ? 'Mark task active' : 'Mark task complete'}
                      onCheckedChange={(checked) => void toggleTask(task, checked === true)} />
                  </TableCell>
                  <TableCell className="min-w-40">
                    {editingId === task.id ? (
                      <form className="flex min-w-56 gap-2" onSubmit={(event) => {
                        event.preventDefault();
                        void saveEdit(task);
                      }}>
                        <Input aria-label="Edit task title" autoFocus maxLength={120} value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)} />
                        <Button size="sm" type="submit">Save</Button>
                        <Button size="sm" type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      </form>
                    ) : (
                      <span className={task.is_done ? 'text-muted-foreground line-through' : 'font-medium'}>{task.title}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Badge className={task.is_done
                      ? 'border-transparent bg-secondary text-secondary-foreground'
                      : 'border-transparent bg-primary/10 text-primary'}>
                      {task.is_done ? 'Completed' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" aria-label={'Edit ' + task.title} onClick={() => {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                        setActionError('');
                      }}>Edit</Button>
                      <Button size="sm" variant="ghost" aria-label={'Delete ' + task.title}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => void removeTask(task.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

