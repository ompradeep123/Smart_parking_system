import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-blue-600">
        <div className="h-full flex flex-col items-center justify-center p-12">
          <div className="flex items-center mb-8">
            <Car size={48} className="text-white" />
            <h1 className="text-3xl font-bold text-white ml-4">Smart Parking System</h1>
          </div>
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-white mb-6">Simplify your parking experience</h2>
            <p className="text-blue-100 mb-8">
              Find available parking spaces, book in advance, and manage your parking sessions with ease.
              Our smart parking system helps you save time and reduce stress.
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-2">Easy</div>
                <p className="text-blue-100 text-sm">Find and book parking spots in seconds</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-2">Fast</div>
                <p className="text-blue-100 text-sm">No more driving around looking for spots</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-2">Secure</div>
                <p className="text-blue-100 text-sm">Know your car is parked in a safe location</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-white mb-2">Smart</div>
                <p className="text-blue-100 text-sm">Real-time updates on parking availability</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <div className="inline-flex items-center justify-center">
              <Car size={32} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 ml-3">Smart Parking</h1>
            </div>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;