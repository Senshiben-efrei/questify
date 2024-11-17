import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Task System', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Social', href: '/social', icon: UsersIcon },
    { name: 'Progress', href: '/progress', icon: ChartBarIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Manage', href: '/manage', icon: Cog6ToothIcon },
  ];

  const publicNavigation = [
    { name: 'Login', href: '/login', icon: ArrowRightOnRectangleIcon },
    { name: 'Register', href: '/register', icon: UserPlusIcon },
  ];

  const navigation = user ? authenticatedNavigation : publicNavigation;

  return (
    <aside className="w-64 bg-base-100 shadow min-h-screen">
      <div className="h-full px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content hover:bg-base-200'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 ${
                    isActive ? 'text-primary-content' : 'text-base-content'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 