import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { Search, Mail, Phone, Calendar, Car, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  vehicleNumbers?: string[];
  createdAt: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      
      // Remove the user from state
      setUsers(users.filter(user => user._id !== id));
      
      setConfirmDelete(null);
      setSuccessMessage('User deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete user');
    }
  };
  
  // Filter users based on search term and role
  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
     user.email.toLowerCase().includes(search.toLowerCase()) ||
     (user.phone && user.phone.includes(search))) &&
    (roleFilter === '' || user.role === roleFilter)
  );
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <p className="text-gray-600 mt-1">View and manage user accounts</p>
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
      
      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Search by name, email, phone..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-input"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                }}
                className="btn btn-outline"
              >
                Reset
              </button>
              <button
                onClick={fetchUsers}
                className="btn btn-primary"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <Mail size={14} className="text-gray-400 mr-1" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={14} className="text-gray-400 mr-1" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.vehicleNumbers && user.vehicleNumbers.length > 0 ? (
                        <div className="flex flex-col space-y-1">
                          {user.vehicleNumbers.map((vehicle, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-700">
                              <Car size={14} className="text-gray-400 mr-1" />
                              {vehicle}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No vehicles</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setConfirmDelete(user._id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={user.role === 'admin'} // Prevent deleting admins
                        title={user.role === 'admin' ? "Admin users cannot be deleted" : "Delete user"}
                      >
                        <Trash2 size={16} className={user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">No users found</h3>
            <p className="text-gray-500 text-sm mb-4">
              No users match your search criteria.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('');
              }}
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;