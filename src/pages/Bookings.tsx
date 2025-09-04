import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { Car, Clock, Calendar, MapPin, CheckCircle, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  parkingSlot: {
    _id: string;
    slotNumber: string;
    floor: number;
    section: string;
  };
  vehicleNumber: string;
  startTime: string;
  endTime: string | null;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await bookingService.getUserBookings(params);
      setBookings(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = async (id: string) => {
    try {
      setActionInProgress(id);
      await bookingService.completeBooking(id);
      // Update booking in state
      setBookings(bookings.map(booking => 
        booking._id === id 
          ? { ...booking, status: 'completed', endTime: new Date().toISOString() } 
          : booking
      ));
    } catch (err) {
      console.error('Error completing booking:', err);
      setError('Failed to complete booking. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };
  
  const handleCancel = async (id: string) => {
    try {
      setActionInProgress(id);
      await bookingService.cancelBooking(id);
      // Update booking in state
      setBookings(bookings.map(booking => 
        booking._id === id 
          ? { ...booking, status: 'cancelled', endTime: new Date().toISOString() } 
          : booking
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Ongoing';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} hr${hours !== 1 ? 's' : ''} ${mins > 0 ? `${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
    }
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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-gray-600 mt-1">View and manage your parking bookings</p>
      </header>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg font-medium text-gray-800">Booking History</h2>
            </div>
            <div className="flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input text-sm"
              >
                <option value="">All Bookings</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {bookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0
                      ${booking.status === 'active' ? 'bg-blue-100 text-blue-600' : 
                        booking.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        'bg-gray-100 text-gray-600'}`}>
                      <Car size={24} />
                    </div>
                    <div className="ml-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">
                          Slot {booking.parkingSlot.slotNumber}
                        </span>
                        <span className={`badge 
                          ${booking.status === 'active' ? 'badge-active' : 
                            booking.status === 'completed' ? 'badge-completed' : 
                            'badge-cancelled'}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(booking.startTime)}
                        </span>
                        {booking.endTime && (
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Duration: {calculateDuration(booking.startTime, booking.endTime)}
                          </span>
                        )}
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          Floor {booking.parkingSlot.floor}, Section {booking.parkingSlot.section}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Vehicle: <span className="font-medium">{booking.vehicleNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Link
                      to={`/bookings/${booking._id}`}
                      className="btn btn-outline text-sm py-1 px-3 mr-2"
                    >
                      Details
                    </Link>
                    
                    {booking.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleComplete(booking._id)}
                          disabled={!!actionInProgress}
                          className="btn btn-primary text-sm py-1 px-3 mr-2 flex items-center"
                        >
                          {actionInProgress === booking._id ? (
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <CheckCircle size={14} className="mr-1" />
                          )}
                          Complete
                        </button>
                        
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={!!actionInProgress}
                          className="btn btn-danger text-sm py-1 px-3 flex items-center"
                        >
                          {actionInProgress === booking._id ? (
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <XCircle size={14} className="mr-1" />
                          )}
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">No bookings found</h3>
            <p className="text-gray-500 text-sm mb-4">
              {statusFilter 
                ? `You don't have any ${statusFilter} bookings.` 
                : "You haven't made any bookings yet."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="btn btn-outline"
                >
                  View All Bookings
                </button>
              )}
              <Link to="/parking" className="btn btn-primary">
                Book a Parking Slot
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;