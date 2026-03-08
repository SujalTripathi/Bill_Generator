import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiMenu, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const event = new CustomEvent('toggle-sidebar');
              window.dispatchEvent(event);
            }}
          >
            <FiMenu size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              SB
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white hidden sm:inline">
              SmartBill
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </button>

            {mobileMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  {user?.email}
                </div>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenu(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
