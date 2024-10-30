import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Users, Gamepad, DollarSign, Settings, BarChart, HelpCircle, Shield, TrendingUp } from 'lucide-react';
import ComplianceReview from '../components/admin/ComplianceReview';
import AdvancedAnalytics from '../components/admin/AdvancedAnalytics';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', icon: BarChart, path: '/admin' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Game Management', icon: Gamepad, path: '/admin/games' },
    { name: 'Wager Management', icon: DollarSign, path: '/admin/wagers' },
    { name: 'Platform Settings', icon: Settings, path: '/admin/settings' },
    { name: 'Support Tickets', icon: HelpCircle, path: '/admin/support' },
    { name: 'Security', icon: Shield, path: '/admin/security' },
    { name: 'Compliance', icon: Shield, path: '/admin/compliance' },
    { name: 'Advanced Analytics', icon: TrendingUp, path: '/admin/advanced-analytics' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block py-2 px-4 text-gray-700 hover:bg-gray-200 ${
                activeSection === item.name.toLowerCase() ? 'bg-gray-200' : ''
              }`}
              onClick={() => setActiveSection(item.name.toLowerCase())}
            >
              <item.icon className="inline-block mr-2" size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {activeSection === 'compliance' ? (
            <ComplianceReview />
          ) : activeSection === 'advanced analytics' ? (
            <AdvancedAnalytics />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;