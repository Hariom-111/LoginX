import { LogOut } from 'lucide-react';

/* Home Page Module */
export default function HomePage({ user, onLogout, isLoggingOut, logoutError }) {
  const displayName = user?.name || user?.username;

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      {user && (
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 bg-[#0f223d] hover:bg-[#18365f] text-white font-medium px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-xs sm:text-sm border border-white/10 disabled:opacity-60"
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
          </button>
        </div>
      )}

      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#0f223d] max-w-6xl leading-tight">
        {displayName ? `Welcome to Login X, ${displayName}` : 'Welcome to Login X'}
      </h1>

      {logoutError && (
        <p role="alert" className="mt-4 text-sm text-red-700">{logoutError}</p>
      )}

      {user && (
        <p className="mt-4 sm:mt-6 text-lg sm:text-2xl font-medium text-slate-600 max-w-2xl">
          You have been successfully logged in to Login X
        </p>
      )}
    </div>
  );
}
