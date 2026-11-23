import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useCreateTaskMutation } from '../api/todoApi';

export function AddTaskDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [createTask, { isLoading }] = useCreateTaskMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setMessage('');
    const result = await createTask({ title: cleanTitle, userId });
    if ('error' in result) {
      setMessage('Could not create the task. Check your connection and table policies.');
      return;
    }
    setTitle('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (!nextOpen) setMessage('');
    }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" />Add task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a task</DialogTitle>
          <DialogDescription>Write down what you want to get done next.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="new-task-title">Task title</Label>
            <Input id="new-task-title" autoFocus maxLength={120} placeholder="e.g. Review project notes"
              value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Adding...' : 'Add task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

