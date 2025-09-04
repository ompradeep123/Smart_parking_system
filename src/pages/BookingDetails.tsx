import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';
import { Car, Calendar, Clock, MapPin, User, CheckCircle, XCircle, ChevronLeft, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchBookingDetails(id);
    }
  }, [id]);
  
  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      setBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = async () => {
    if (!booking) return;
    
    try {
      setActionInProgress(true);
      await bookingService.completeBooking(booking._id);
      
      // Update booking in state
      setBooking({
        ...booking,
        status: 'completed',
        endTime: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error completing booking:', err);
      setError('Failed to complete booking. Please try again.');
    } finally {
      setActionInProgress(false);
    }
  };
  
  const handleCancel = async () => {
    if (!booking) return;
    
    try {
      setActionInProgress(true);
      await bookingService.cancelBooking(booking._id);
      
      // Update booking in state
      setBooking({
        ...booking,
        status: 'cancelled',
        endTime: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setActionInProgress(false);
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
      return `${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins !== 1 ? 's' : ''}` : ''}`;
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/bookings" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ChevronLeft size={20} className="mr-1" />
            Back to Bookings
          </Link>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Booking</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchBookingDetails(id!)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/bookings" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ChevronLeft size={20} className="mr-1" />
            Back to Bookings
          </Link>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
          <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-yellow-800 mb-2">Booking Not Found</h2>
          <p className="text-yellow-700 mb-4">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/bookings" className="btn btn-primary">
            View All Bookings
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/bookings" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ChevronLeft size={20} className="mr-1" />
          Back to Bookings
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800 mr-3">
                  Booking {booking._id.substring(0, 8)}
                </h1>
                <span className={`badge 
                  ${booking.status === 'active' ? 'badge-active' : 
                    booking.status === 'completed' ? 'badge-completed' : 
                    'badge-cancelled'}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                Parking Slot {booking.parkingSlot.slotNumber}
              </p>
            </div>
            
            {booking.status === 'active' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleComplete}
                  disabled={actionInProgress}
                  className="btn btn-primary flex items-center"
                >
                  {actionInProgress ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <CheckCircle size={18} className="mr-2" />
                  )}
                  Complete Booking
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={actionInProgress}
                  className="btn btn-danger flex items-center"
                >
                  {actionInProgress ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <XCircle size={18} className="mr-2" />
                  )}
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Booking Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Booking Date</div>
                    <div className="font-medium text-gray-800">
                      {formatDate(booking.startTime)}
                    </div>
                  </div>
                </div>
                
                {booking.endTime && (
                  <div className="flex items-start">
                    <Clock size={20} className="text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-medium text-gray-800">
                        {calculateDuration(booking.startTime, booking.endTime)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Ended: {formatDate(booking.endTime)}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Car size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Vehicle Number</div>
                    <div className="font-medium text-gray-800">
                      {booking.vehicleNumber}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Booked By</div>
                    <div className="font-medium text-gray-800">
                      {booking.user?.name || 'You'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Parking Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium text-gray-800">
                      Floor {booking.parkingSlot.floor}, Section {booking.parkingSlot.section}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Slot {booking.parkingSlot.slotNumber}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-medium text-gray-800 mb-2">Parking Instructions</div>
                  <ol className="list-decimal list-inside text-gray-700 space-y-2 text-sm">
                    <li>Follow signs to Floor {booking.parkingSlot.floor}</li>
                    <li>Look for Section {booking.parkingSlot.section}</li>
                    <li>Park at the slot marked {booking.parkingSlot.slotNumber}</li>
                    <li>When leaving, mark your booking as completed in the app</li>
                    <li>If you need assistance, contact the parking management</li>
                  </ol>
                </div>
                
                <Link
                  to="/parking"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <MapPin size={16} className="mr-1" />
                  View parking map
                </Link>
              </div>
            </div>
          </div>
          
          {/* QR code placeholder */}
          <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <div className="mb-3 text-gray-800 font-medium">Booking Reference QR Code</div>
            <div className="inline-block bg-white p-4 rounded-lg border">
              <div className="w-32 h-32 bg-gray-200 mx-auto flex items-center justify-center">
                <span className="text-gray-500 text-xs">QR Code Placeholder</span>
              </div>
            </div>
            <div className="mt-3 text-gray-500 text-sm">
              Show this to parking attendants if requested
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle size={24} className="text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Remember</h3>
            <div className="mt-2 text-sm text-blue-700">
              {booking.status === 'active' ? (
                <p>Don't forget to complete your booking when you leave the parking slot. This will free up the slot for other users.</p>
              ) : booking.status === 'completed' ? (
                <p>Thank you for using our smart parking system. We hope you had a great experience!</p>
              ) : (
                <p>This booking was cancelled. You can make a new booking anytime from the parking map.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;