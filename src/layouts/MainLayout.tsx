import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Home, User, BookOpen, LogOut, Menu, X, Settings, Users } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-semibold">Smart Parking</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          <SidebarContent isAdmin={isAdmin} onItemClick={() => setSidebarOpen(false)} />
          <div className="mt-auto p-4 border-t">
            <button 
              onClick={handleLogout} 
              className="flex items-center w-full px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-white">
        <div className="flex items-center h-16 px-6 border-b">
          <span className="text-xl font-semibold">Smart Parking</span>
        </div>
        <SidebarContent isAdmin={isAdmin} />
        <div className="mt-auto p-4 border-t">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top navigation */}
        <header className="bg-white shadow-sm lg:hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center">
                <span className="text-xl font-semibold">Smart Parking</span>
              </div>
              <div className="flex items-center">
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  isAdmin: boolean;
  onItemClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ isAdmin, onItemClick }) => {
  const activeClass = "bg-blue-50 text-blue-700 border-l-4 border-blue-500";
  const itemClass = "flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors duration-200";
  
  return (
    <nav className="flex-1 overflow-y-auto">
      <div className="px-2 py-4 space-y-1">
        <NavLink to="/dashboard" className={({ isActive }) => 
          `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
          <Home size={20} className="mr-3" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/parking" className={({ isActive }) => 
          `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
          <Car size={20} className="mr-3" />
          <span>Parking Map</span>
        </NavLink>
        
        <NavLink to="/bookings" className={({ isActive }) => 
          `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
          <BookOpen size={20} className="mr-3" />
          <span>My Bookings</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => 
          `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
          <User size={20} className="mr-3" />
          <span>Profile</span>
        </NavLink>
        
        {isAdmin && (
          <>
            <div className="px-4 pt-6 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Admin
            </div>
            
            <NavLink to="/admin" className={({ isActive }) => 
              `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
              <Settings size={20} className="mr-3" />
              <span>Admin Dashboard</span>
            </NavLink>
            
            <NavLink to="/admin/parking" className={({ isActive }) => 
              `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
              <Car size={20} className="mr-3" />
              <span>Manage Parking</span>
            </NavLink>
            
            <NavLink to="/admin/users" className={({ isActive }) => 
              `${itemClass} ${isActive ? activeClass : ''}`} onClick={onItemClick}>
              <Users size={20} className="mr-3" />
              <span>Manage Users</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default MainLayout;