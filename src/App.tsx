import { useEffect, useState } from 'react';
import { Check, ClipboardList, LayoutDashboard, ListTodo, LogOut, Sparkles } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { AuthForm } from './features/auth/components/AuthForm';
import { signOut } from './features/auth/authApi';
import { setSession } from './features/auth/auth.slice';
import DashboardPage from './features/dashboard/page';
import TodoPage from './features/todo/page';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { supabase } from './utils/supabase';

type View = 'dashboard' | 'todos';
const navigation: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'todos', label: 'My tasks', icon: ListTodo },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const dispatch = useAppDispatch();
  const { session, ready } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) dispatch(setSession(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      dispatch(setSession(nextSession));
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  if (!ready) {
    return <main className="grid min-h-screen place-items-center bg-background p-4 text-muted-foreground">Connecting to your workspace...</main>;
  }
  if (!session) return <AuthForm />;

  const userId = session.user.id;
  const heading = view === 'dashboard' ? 'Dashboard' : 'My tasks';

  function navButtons(mobile = false) {
    return navigation.map((item) => {
      const Icon = item.icon;
      return <Button key={item.id} variant={view === item.id ? 'secondary' : 'ghost'}
        className={mobile ? 'flex-1 justify-center' : 'w-full justify-start'}
        aria-current={view === item.id ? 'page' : undefined} onClick={() => setView(item.id)}>
        <Icon className="h-4 w-4" />{item.label}
      </Button>;
    });
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <button type="button" onClick={() => setView('dashboard')}
          className="flex h-16 items-center gap-3 border-b px-6 text-left font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Check className="h-5 w-5" /></span>
          <span>Daymark</span><Badge className="ml-auto border-transparent bg-primary/10 text-primary">TODOS</Badge>
        </button>
        <div className="px-4 pt-7">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
          <nav className="grid gap-1">{navButtons()}</nav>
        </div>
        <div className="mt-auto p-4"><div className="rounded-xl bg-muted/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />Keep it moving</div>
          <p className="text-xs leading-relaxed text-muted-foreground">Small steps add up. Pick a task and make a little progress today.</p>
        </div></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden"><Check className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold">{heading}</p><p className="hidden text-xs text-muted-foreground sm:block">Your personal productivity space</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:block">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={() => void signOut().catch(console.error)}>
                <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
          <nav className="flex gap-2 border-t px-4 py-2 lg:hidden">{navButtons(true)}</nav>
        </header>
        {view === 'dashboard'
          ? <DashboardPage userId={userId} onOpenTodos={() => setView('todos')} />
          : <TodoPage userId={userId} />}
        <footer className="border-t bg-background px-4 py-5 text-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2"><ClipboardList className="h-3.5 w-3.5" />Your tasks are private to your account</span>
        </footer>
      </div>
    </div>
  );
}
