import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiHome, FiFilePlus, FiUsers, FiSettings, FiGrid, FiX,
} from 'react-icons/fi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/new-bill', label: 'New Bill', icon: FiFilePlus },
  { to: '/customers', label: 'Customers', icon: FiUsers },
  { to: '/templates', label: 'Templates', icon: FiGrid },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-semibold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <FiX size={20} />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
