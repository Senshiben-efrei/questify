import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  Bars3Icon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      {/* Left section */}
      <div className="navbar-start">
        <button 
          className="btn btn-ghost btn-circle"
          onClick={toggleSidebar}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Center section */}
      <div className="navbar-center">
        <Link 
          to="/" 
          className="btn btn-ghost text-xl font-bold text-primary normal-case"
        >
          Questify
        </Link>
      </div>

      {/* Right section */}
      <div className="navbar-end">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </button>

        {user ? (
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-ghost btn-circle avatar"
            >
              <UserCircleIcon className="h-6 w-6" />
            </div>
            <ul className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>Welcome, {user.username}</span>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="btn btn-ghost btn-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-primary btn-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar; 