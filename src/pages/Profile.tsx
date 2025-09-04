import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { User, Mail, Phone, Car, PlusCircle, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [newVehicle, setNewVehicle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isRemovingVehicle, setIsRemovingVehicle] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setVehicles(user.vehicleNumbers || []);
    }
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setErrorMessage('');
      
      const response = await userService.updateProfile({
        name,
        email,
        phone
      });
      
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVehicle.trim()) return;
    
    try {
      setIsAddingVehicle(true);
      setErrorMessage('');
      
      const response = await userService.addVehicle(newVehicle);
      
      // Update vehicles list
      setVehicles(response.data.vehicleNumbers || []);
      setNewVehicle('');
      
      setSuccessMessage('Vehicle added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setIsAddingVehicle(false);
    }
  };
  
  const handleRemoveVehicle = async (vehicleNumber: string) => {
    try {
      setIsRemovingVehicle(vehicleNumber);
      setErrorMessage('');
      
      await userService.removeVehicle(vehicleNumber);
      
      // Update vehicles list
      setVehicles(vehicles.filter(v => v !== vehicleNumber));
      
      setSuccessMessage('Vehicle removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to remove vehicle');
    } finally {
      setIsRemovingVehicle(null);
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and vehicle information</p>
      </header>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
          <CheckCircle size={18} className="mr-2" />
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-800">Personal Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input pl-10"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input pl-10"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input pl-10"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`btn btn-primary w-full sm:w-auto ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Vehicles */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-800">My Vehicles</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <form onSubmit={handleAddVehicle} className="flex">
                  <input
                    type="text"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    placeholder="Add vehicle number"
                    className="form-input rounded-r-none flex-1"
                    disabled={isAddingVehicle}
                  />
                  <button
                    type="submit"
                    disabled={isAddingVehicle || !newVehicle.trim()}
                    className={`btn btn-primary rounded-l-none ${isAddingVehicle || !newVehicle.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isAddingVehicle ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <PlusCircle size={20} />
                    )}
                  </button>
                </form>
              </div>
              
              {vehicles.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <li key={vehicle} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Car size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-700">{vehicle}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveVehicle(vehicle)}
                        disabled={isRemovingVehicle === vehicle}
                        className={`text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 ${isRemovingVehicle === vehicle ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isRemovingVehicle === vehicle ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2">
                    <Car size={32} className="mx-auto" />
                  </div>
                  <p className="text-sm text-gray-500">
                    You haven't added any vehicles yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;