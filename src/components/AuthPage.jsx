import { useState } from 'react';
import { authService, friendlyError } from '../services/authService';
import { isFirebaseConfigured } from '../firebase';
import { Logo } from './Icons';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | signup | reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'signup') await authService.signUp(name.trim(), email.trim(), password);
      else if (mode === 'login') await authService.logIn(email.trim(), password);
      else {
        await authService.resetPassword(email.trim());
        setInfo('If that email is registered, a reset link is on its way.');
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const titles = {
    login: ['Welcome back', 'Log in to see your tasks on any device.'],
    signup: ['Create your account', 'Start organizing your day in seconds.'],
    reset: ['Reset password', "Enter your email and we'll send you a link."],
  };

  return (
    <div className="auth-wrap">
      <div className="blob blob-a" />
      <div className="blob blob-b" />

      <div className="auth-card">
        <div className="brand brand-center">
          <Logo size={44} />
          <span>TaskFlow</span>
        </div>

        <h1>{titles[mode][0]}</h1>
        <p className="muted">{titles[mode][1]}</p>

        {!isFirebaseConfigured && (
          <div className="banner">
            <strong>Demo mode</strong> – no Firebase keys found, so data is saved only in this
            browser. Add your keys to <code>.env</code> to enable cloud sync.
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          {mode === 'signup' && (
            <label>
              Name
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          {mode !== 'reset' && (
            <label>
              Password
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>
          )}

          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {info && <div className="alert alert-ok">{info}</div>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'login'
              ? 'Log in'
              : mode === 'signup'
              ? 'Sign up'
              : 'Send reset link'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button className="link" onClick={() => switchMode('reset')}>Forgot password?</button>
              <span>
                New here?{' '}
                <button className="link" onClick={() => switchMode('signup')}>Create an account</button>
              </span>
            </>
          )}
          {mode === 'signup' && (
            <span>
              Already have an account?{' '}
              <button className="link" onClick={() => switchMode('login')}>Log in</button>
            </span>
          )}
          {mode === 'reset' && (
            <button className="link" onClick={() => switchMode('login')}>← Back to log in</button>
          )}
        </div>
      </div>
    </div>
  );
}
