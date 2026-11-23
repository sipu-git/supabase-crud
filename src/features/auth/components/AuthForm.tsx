import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { resendSignupConfirmation, signIn, signUp } from '../authApi';

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        const result = await signUp(email.trim(), password, displayName);
        if (result.confirmationRequired) {
          setPendingEmail(email.trim());
          setNotice('Account created. Check your inbox and spam folder for the confirmation email.');
        } else {
          setPendingEmail('');
          setNotice('Account created. You are signed in.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!pendingEmail) return;
    setError('');
    setNotice('');
    setResending(true);
    try {
      await resendSignupConfirmation(pendingEmail);
      setNotice('A new confirmation email was requested. Check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the confirmation email.');
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Daymark</p>
          <CardTitle className="text-2xl">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</CardTitle>
          <CardDescription>Sign in to manage your private task list.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submit}>
            {mode === 'signup' && <div className="grid gap-2">
              <Label htmlFor="auth-name">Name</Label>
              <Input id="auth-name" autoComplete="name" required value={displayName}
                onChange={(event) => setDisplayName(event.target.value)} />
            </div>}
            <div className="grid gap-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input id="auth-email" type="email" autoComplete="email" required value={email}
                onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input id="auth-password" type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            {notice && <p className="text-sm text-primary" role="status">{notice}</p>}
            <Button className="w-full" disabled={busy}>
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          {pendingEmail && <Button className="mt-3 w-full" variant="outline" type="button"
            disabled={resending} onClick={() => void resendConfirmation()}>
            {resending ? 'Sending...' : 'Resend confirmation email'}
          </Button>}
          <Button className="mt-4 w-full" variant="link" type="button" onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError('');
            setNotice('');
            setPendingEmail('');
          }}>
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already registered? Sign in'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
