import { useState } from 'react';
import { Calendar, Check, Edit, Trash, X } from './Icons';

const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

function formatDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: y === new Date().getFullYear() ? undefined : 'numeric',
  });
}

export default function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(task.dueDate || '');

  const overdue = !task.completed && task.dueDate && task.dueDate < todayStr();
  const dueToday = !task.completed && task.dueDate === todayStr();

  function startEdit() {
    setTitle(task.title);
    setPriority(task.priority || 'medium');
    setDueDate(task.dueDate || '');
    setEditing(true);
  }

  async function save(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await onUpdate(task.id, { title: t, priority, dueDate });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="task editing">
        <form onSubmit={save} className="edit-form">
          <input
            autoFocus
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Edit title"
            onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          />
          <div className="task-form-row">
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <button className="btn btn-primary btn-sm" type="submit">Save</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`task ${task.completed ? 'done' : ''} prio-${task.priority || 'medium'}`}>
      <button
        className={`check ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
        aria-pressed={task.completed}
      >
        <Check size={16} strokeWidth={3} />
      </button>

      <div className="task-body" onDoubleClick={startEdit}>
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          <span className={`chip chip-${task.priority || 'medium'}`}>{task.priority || 'medium'}</span>
          {task.dueDate && (
            <span className={`due ${overdue ? 'overdue' : ''} ${dueToday ? 'today' : ''}`}>
              <Calendar size={14} />
              {overdue ? 'Overdue · ' : dueToday ? 'Today · ' : ''}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={startEdit} aria-label="Edit task" title="Edit">
          <Edit size={18} />
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Delete task" title="Delete">
          <Trash size={18} />
        </button>
      </div>
    </li>
  );
}
