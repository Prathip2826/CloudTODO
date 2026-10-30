import { useState } from 'react';
import { Plus } from './Icons';

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    try {
      await onAdd({ title: t, priority, dueDate });
      setTitle('');
      setDueDate('');
      setPriority('medium');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="task-form card" onSubmit={submit}>
      <input
        className="task-input"
        type="text"
        placeholder="What needs to be done?"
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Task title"
      />
      <div className="task-form-row">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
        />
        <button className="btn btn-primary" disabled={busy || !title.trim()}>
          <Plus size={18} /> Add task
        </button>
      </div>
    </form>
  );
}
