import { useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { isFirebaseConfigured } from '../firebase';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import { Cloud, Logo, Logout, Moon, Search, Sun } from './Icons';

const FILTERS = ['all', 'active', 'completed'];

export default function TodoApp({ user, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Real-time subscription: updates instantly on every device
  useEffect(() => {
    setLoading(true);
    const unsub = taskService.subscribe(
      user.uid,
      (list) => {
        setTasks(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setToast('Could not load tasks: ' + (err.message || 'permission denied'));
        setLoading(false);
      }
    );
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const run = (fn) => async (...args) => {
    try {
      await fn(...args);
    } catch (err) {
      console.error(err);
      setToast(err.message || 'Something went wrong');
    }
  };

  const addTask = run((data) => taskService.add(user.uid, data));
  const updateTask = run((id, changes) => taskService.update(user.uid, id, changes));
  const toggleTask = run((t) => taskService.update(user.uid, t.id, { completed: !t.completed }));
  const deleteTask = run((t) => taskService.remove(user.uid, t.id));
  const clearCompleted = run(() => taskService.clearCompleted(user.uid));

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.completed).length;
  const activeCount = total - doneCount;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed))
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filter, search]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <span>TaskFlow</span>
        </div>
        <div className="topbar-right">
          <span className={`sync ${isFirebaseConfigured ? 'online' : 'demo'}`}>
            <Cloud size={16} /> {isFirebaseConfigured ? 'Synced' : 'Demo mode'}
          </span>
          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme" title="Toggle theme">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button className="btn btn-ghost" onClick={() => authService.logOut()}>
            <Logout size={18} /> <span className="hide-sm">Log out</span>
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero card">
          <div>
            <h1>{greeting}, {user.displayName} 👋</h1>
            <p className="muted">
              {total === 0
                ? 'Add your first task to get started.'
                : activeCount === 0
                ? 'All done – enjoy the rest of your day! 🎉'
                : `You have ${activeCount} task${activeCount === 1 ? '' : 's'} left to do.`}
            </p>
          </div>
          <div className="progress-ring" aria-label={`${percent}% complete`}>
            <svg viewBox="0 0 44 44">
              <circle className="ring-bg" cx="22" cy="22" r="18" />
              <circle
                className="ring-fg"
                cx="22"
                cy="22"
                r="18"
                strokeDasharray={`${(percent / 100) * 113.1} 113.1`}
              />
            </svg>
            <span>{percent}%</span>
          </div>
        </section>

        <div className="stats">
          <div className="stat"><b>{total}</b><span>Total</span></div>
          <div className="stat"><b>{activeCount}</b><span>Active</span></div>
          <div className="stat"><b>{doneCount}</b><span>Completed</span></div>
        </div>

        <TaskForm onAdd={addTask} />

        <section className="card list-card">
          <div className="toolbar">
            <div className="tabs" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  className={`tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search tasks"
              />
            </label>
          </div>

          {loading ? (
            <div className="empty">Loading your tasks…</div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">{total === 0 ? '📝' : '🔍'}</div>
              <p>
                {total === 0
                  ? 'No tasks yet. Add one above!'
                  : 'No tasks match this view.'}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {visible.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={toggleTask}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </ul>
          )}

          {doneCount > 0 && (
            <div className="list-footer">
              <span className="muted">{doneCount} completed</span>
              <button className="link danger-link" onClick={clearCompleted}>Clear completed</button>
            </div>
          )}
        </section>

        <p className="footnote muted">Tip: double-click a task to edit it.</p>
      </main>

      {toast && (
        <div className="toast" role="alert" onClick={() => setToast('')}>{toast}</div>
      )}
    </div>
  );
}
