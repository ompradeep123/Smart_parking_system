import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ParkingMap from './pages/ParkingMap';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageParking from './pages/admin/ManageParking';
import ManageUsers from './pages/admin/ManageUsers';
import NotFound from './pages/NotFound';

// Custom route protector component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      
      {/* Protected routes */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="parking" element={
          <ProtectedRoute>
            <ParkingMap />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="bookings/:id" element={
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="admin/parking" element={
          <AdminRoute>
            <ManageParking />
          </AdminRoute>
        } />
        <Route path="admin/users" element={
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        } />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;