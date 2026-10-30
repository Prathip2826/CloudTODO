import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import AuthPage from './components/AuthPage';
import TodoApp from './components/TodoApp';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_theme');
      if (saved) return saved;
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('taskflow_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [theme, toggleTheme] = useTheme();

  useEffect(() => authService.onChange(setUser), []);

  if (user === undefined) {
    return (
      <div className="splash">
        <div className="spinner" />
      </div>
    );
  }

  return user ? (
    <TodoApp user={user} theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <AuthPage />
  );
}
