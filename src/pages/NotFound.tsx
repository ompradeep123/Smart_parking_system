import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
            <Car size={40} className="text-blue-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">Page Not Found</h2>
          <p className="text-gray-600 mt-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/"
            className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <Home size={20} className="mr-2" />
            Go to Home
          </Link>
          <Link 
            to="/parking"
            className="btn btn-outline flex items-center justify-center w-full sm:w-auto"
          >
            <Car size={20} className="mr-2" />
            View Parking
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          Smart Parking System &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default NotFound;