import { CheckCircle2, ListTodo } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { AddTaskDialog } from './components/AddTaskDialog';
import { TaskTable } from './components/TaskTable';
import { useGetTasksQuery } from './api/todoApi';

export default function TodoPage({ userId }: { userId: string }) {
  const { data: tasks = [] } = useGetTasksQuery(userId);
  const completed = tasks.filter((task) => task.is_done).length;
  const active = tasks.length - completed;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">My list</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tasks, at your pace.</h1>
          <p className="mt-2 text-muted-foreground">Plan the next step, then mark it done.</p>
        </div>
        <AddTaskDialog userId={userId} />
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><ListTodo className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{active}</p><p className="text-sm text-muted-foreground">Active tasks</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-secondary p-3 text-secondary-foreground"><CheckCircle2 className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{completed}</p><p className="text-sm text-muted-foreground">Completed tasks</p></div>
        </CardContent></Card>
      </div>

      <TaskTable userId={userId} />
    </section>
  );
}


