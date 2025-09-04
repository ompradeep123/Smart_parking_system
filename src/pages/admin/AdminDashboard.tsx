import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingService, bookingService, userService } from '../../services/api';
import { Users, Car, BookOpen, Layers, TrendingUp, PieChart, Calendar } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParkingSlots: 0,
    totalBookings: 0,
    activeBookings: 0,
    availableSlots: 0,
    occupiedSlots: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users count
      const usersResponse = await userService.getAllUsers();
      const totalUsers = usersResponse.count || usersResponse.data.length;
      
      // Fetch parking slots stats
      const parkingResponse = await parkingService.getAllSlots();
      const parkingSlots = parkingResponse.data;
      const totalParkingSlots = parkingSlots.length;
      const availableSlots = parkingSlots.filter((slot: any) => slot.status === 'empty').length;
      const occupiedSlots = parkingSlots.filter((slot: any) => slot.status === 'occupied').length;
      
      // Fetch bookings count
      const bookingsResponse = await bookingService.getAllBookings();
      const totalBookings = bookingsResponse.count || bookingsResponse.data.length;
      const activeBookings = bookingsResponse.data.filter((booking: any) => booking.status === 'active').length;
      
      // Get recent bookings
      const recentBookings = bookingsResponse.data.slice(0, 5);
      
      setStats({
        totalUsers,
        totalParkingSlots,
        totalBookings,
        activeBookings,
        availableSlots,
        occupiedSlots
      });
      
      setRecentBookings(recentBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and monitor your parking system</p>
      </header>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Users</div>
              <div className="text-2xl font-semibold text-gray-800">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all users
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Car size={24} className="text-green-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Available Slots</div>
              <div className="text-2xl font-semibold text-gray-800">{stats.availableSlots} / {stats.totalParkingSlots}</div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/parking" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage parking
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <BookOpen size={24} className="text-purple-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Active Bookings</div>
              <div className="text-2xl font-semibold text-gray-800">{stats.activeBookings} / {stats.totalBookings}</div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/bookings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View bookings
            </Link>
          </div>
        </div>
      </div>
      
      {/* Dashboard sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Occupancy status */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Occupancy Status</h2>
            <Link to="/admin/parking" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                {/* Placeholder for chart - would be implemented with a chart library */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-semibold text-gray-800">
                    {Math.round((stats.occupiedSlots / stats.totalParkingSlots) * 100)}%
                  </div>
                </div>
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeDasharray={`${(stats.occupiedSlots / stats.totalParkingSlots) * 100}, 100`}
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Available</div>
                <div className="text-xl font-semibold text-green-600">{stats.availableSlots}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Occupied</div>
                <div className="text-xl font-semibold text-red-600">{stats.occupiedSlots}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-semibold text-gray-800">{stats.totalParkingSlots}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <Link 
                to="/admin/parking"
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 mr-3">
                    <Layers size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Manage Parking Slots</div>
                    <div className="text-sm text-gray-500">Add, edit or remove parking slots</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/admin/users"
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 mr-3">
                    <Users size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Manage Users</div>
                    <div className="text-sm text-gray-500">View and manage user accounts</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/parking"
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 mr-3">
                    <Car size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">View Parking Map</div>
                    <div className="text-sm text-gray-500">See all parking slots in real-time</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/bookings"
                className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-100 mr-3">
                    <BookOpen size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">View Bookings</div>
                    <div className="text-sm text-gray-500">Manage current and past bookings</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Recent Bookings</h2>
          <Link to="/bookings" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking: any) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.user.name}</div>
                    <div className="text-xs text-gray-500">{booking.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.parkingSlot.slotNumber}</div>
                    <div className="text-xs text-gray-500">
                      Floor {booking.parkingSlot.floor}, Section {booking.parkingSlot.section}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.vehicleNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge 
                      ${booking.status === 'active' ? 'badge-active' : 
                         booking.status === 'completed' ? 'badge-completed' : 
                         'badge-cancelled'}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;