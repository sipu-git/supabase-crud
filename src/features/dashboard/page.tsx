import { CheckCircle2, ClipboardList, LayoutDashboard, ListTodo, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useGetTasksQuery } from '../todo/api/todoApi';
import type { Task } from '../todo/types/todo.types';

interface DashboardPageProps {
  userId: string;
  onOpenTodos: () => void;
}

function dateLabel(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DashboardPage({ userId, onOpenTodos }: DashboardPageProps) {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery(userId);
  const completed = tasks.filter((task) => task.is_done).length;
  const active = tasks.length - completed;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const recentTasks = [...tasks]
    .sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Total tasks', value: tasks.length, icon: ClipboardList, detail: 'Across your list' },
    { label: 'In progress', value: active, icon: ListTodo, detail: 'Still to be done' },
    { label: 'Completed', value: completed, icon: CheckCircle2, detail: 'Nice work so far' },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Overview</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Good things start here.</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">A clear view of what you have planned and what you have finished.</p>
        </div>
        <Button onClick={onOpenTodos}>Open my tasks <span aria-hidden="true">→</span></Button>
      </div>

      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-md">
        <CardContent className="flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary-foreground/75">
              <Sparkles className="h-4 w-4" /> YOUR DAILY SPACE
            </div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {isLoading ? 'Loading your tasks...' : active > 0 ? 'Make room for one more win.' : 'You’re all caught up.'}
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/75">
              {isLoading ? 'Your overview will be ready in a moment.' : active > 0
                ? 'Take your next task one step at a time.'
                : 'Add a task whenever something new comes up.'}
            </p>
          </div>
          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center self-start rounded-full border border-primary-foreground/25 bg-primary-foreground/10 sm:self-auto">
            <span className="text-3xl font-bold">{completion}%</span>
            <span className="text-xs text-primary-foreground/75">complete</span>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          Tasks could not be loaded. Check the Supabase connection and table policies.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-start justify-between p-5 sm:p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{isLoading ? '—' : stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><stat.icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recently added</CardTitle>
            <CardDescription className="mt-1">The latest tasks in your list.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onOpenTodos}>View all <span aria-hidden="true">→</span></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading activity...</p>
          ) : recentTasks.length ? (
            <ul className="divide-y">
              {recentTasks.map((task) => <RecentTask key={task.id} task={task} />)}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed px-5 py-10 text-center">
              <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground"><ClipboardList className="h-5 w-5" /></div>
              <p className="font-medium">Your task list is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first task and it will show up here.</p>
              <Button className="mt-4" size="sm" onClick={onOpenTodos}>Go to Todos</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-muted-foreground">
        <LayoutDashboard className="h-3.5 w-3.5" /> Demo workspace · Your tasks sync with Supabase
      </p>
    </section>
  );
}

function RecentTask({ task }: { task: Task }) {
  return (
    <li className="flex items-center gap-3 py-4 first:pt-1 last:pb-1">
      <span className={task.is_done
        ? 'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'
        : 'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground'}>
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={task.is_done ? 'block truncate text-sm text-muted-foreground line-through' : 'block truncate text-sm font-medium'}>
          {task.title}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{dateLabel(task.created_at)}</span>
      </span>
      <span className={task.is_done
        ? 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
        : 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'}>
        {task.is_done ? 'Done' : 'Active'}
      </span>
    </li>
  );
}


