import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { USERS } from '@/lib/constants';
import { TokenGate } from '@/components/settings/TokenGate';
import { TokenModal } from '@/components/settings/TokenModal';

export function AppShell() {
  const { activeUser, setActiveUser } = useUserStore();
  const token = useAuthStore((s) => s.token);
  const [showSettings, setShowSettings] = useState(false);

  if (!token) {
    return <TokenGate />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-gray-900">Net Worth Tracker</h1>
          <div className="flex items-center gap-2">
            {USERS.map((user) => (
              <button
                key={user}
                onClick={() => setActiveUser(user)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeUser === user ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {user}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      {showSettings && <TokenModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
