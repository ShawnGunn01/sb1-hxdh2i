import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Gamepad2, Users, CreditCard, BarChart3, LogOut, Settings, HelpCircle, Trophy, Menu, X } from 'lucide-react';
import Notifications from './Notifications';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Games', icon: Gamepad2, path: '/games', permission: 'view_public_games' },
    { name: 'Users', icon: Users, path: '/users', permission: 'manage_users' },
    { name: 'Payments', icon: CreditCard, path: '/payments', permission: 'manage_payments' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics', permission: 'view_analytics' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments', permission: 'manage_tournaments' },
    { name: 'Admin', icon: Settings, path: '/admin', permission: 'manage_platform_settings' },
    { name: 'Support', icon: HelpCircle, path: '/support', permission: 'manage_support_tickets' },
  ];

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold">PLLAY Enterprise</NavLink>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              hasPermission(item.permission) && (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `flex items-center ${isActive ? 'text-yellow-300' : 'hover:text-yellow-200'}`}
                >
                  <item.icon className="mr-2" size={18} />
                  {item.name}
                </NavLink>
              )
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Notifications />
            {user && (
              <div className="hidden md:flex items-center">
                <span className="mr-4">{user.name}</span>
                <button onClick={handleLogout} className="flex items-center text-white hover:text-yellow-300">
                  <LogOut size={18} className="mr-1" /> Logout
                </button>
              </div>
            )}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-blue-700"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                hasPermission(item.permission) && (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `flex items-center ${isActive ? 'text-yellow-300' : 'hover:text-yellow-200'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-2" size={18} />
                    {item.name}
                  </NavLink>
                )
              ))}
              {user && (
                <button onClick={handleLogout} className="flex items-center text-white hover:text-yellow-300">
                  <LogOut size={18} className="mr-1" /> Logout
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;