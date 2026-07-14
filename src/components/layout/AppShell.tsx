import { NavLink, Outlet } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { USERS } from '@/lib/constants';

export function AppShell() {
  const { activeUser, setActiveUser } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold text-gray-900">Net Worth Tracker</h1>
          <nav className="flex gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {USERS.map((user) => (
            <button
              key={user}
              onClick={() => setActiveUser(user)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                activeUser === user ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {user}
            </button>
          ))}
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
