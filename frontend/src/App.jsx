import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { logout } from './api/auth';

function loadSession() {
  const accessToken = localStorage.getItem('loginx_access_token');
  const savedUser = localStorage.getItem('loginx_user');

  if (!accessToken || !savedUser) return null;

  try {
    return { accessToken, user: JSON.parse(savedUser) };
  } catch {
    localStorage.removeItem('loginx_access_token');
    localStorage.removeItem('loginx_user');
    return null;
  }
}

/* App Root Module */
export default function App() {
  const [session, setSession] = useState(loadSession);
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = session?.user ?? null;

  const handleLogin = (authData) => {
    const identifier = authData.identifier.trim();
    const apiUser = authData.user;
    const normalizedUser = {
      ...apiUser,
      username: apiUser.username || authData.displayName || (!identifier.includes('@') ? identifier : ''),
      name: authData.displayName || apiUser.username || identifier.split('@')[0],
      email: identifier.includes('@') ? identifier : '',
    };
    const nextSession = { accessToken: authData.accessToken, user: normalizedUser };

    localStorage.setItem('loginx_access_token', nextSession.accessToken);
    localStorage.setItem('loginx_user', JSON.stringify(normalizedUser));
    setSession(nextSession);
    setLogoutError('');
  };

  const clearSession = () => {
    localStorage.removeItem('loginx_access_token');
    localStorage.removeItem('loginx_user');
    setSession(null);
  };

  const handleLogout = async () => {
    if (!session?.accessToken || isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError('');
    try {
      await logout(session.accessToken);
      clearSession();
    } catch (error) {
      if (error.status === 401) {
        clearSession();
      } else {
        setLogoutError(error.message);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800">
      {session ? (
        <HomePage
          user={user}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          logoutError={logoutError}
        />
      ) : (
        <LoginPage onLoginSuccess={handleLogin} />
      )}
    </div>
  );
}
