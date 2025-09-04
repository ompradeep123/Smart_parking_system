import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parkingService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Car, Filter, ChevronDown, ChevronUp, Search, AlertCircle, Building2, MapPin } from 'lucide-react';

interface ParkingSlot {
  _id: string;
  slotNumber: string;
  building: string;
  floor: number;
  section: string;
  status: 'empty' | 'booked' | 'occupied';
  type: 'standard' | 'handicapped' | 'electric' | 'compact' | 'vip';
  coordinates: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

const ParkingMap: React.FC = () => {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [floors, setFloors] = useState<number[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [mapScale, setMapScale] = useState<number>(1);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch parking data
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        
        // Fetch all slots to get unique buildings, floors, and sections
        const response = await parkingService.getAllSlots();
        const allSlots = response.data;
        
        // Extract unique values
        const uniqueBuildings = [...new Set(allSlots.map((slot: ParkingSlot) => slot.building))].sort();
        setBuildings(uniqueBuildings);
        
        if (uniqueBuildings.length > 0 && !selectedBuilding) {
          setSelectedBuilding(uniqueBuildings[0]);
          await fetchBuildingData(uniqueBuildings[0]);
        }
      } catch (error) {
        console.error('Error fetching parking data:', error);
        setErrorMessage('Failed to load parking data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParkingData();
  }, []);
  
  // Fetch building data when building selection changes
  useEffect(() => {
    if (selectedBuilding) {
      fetchBuildingData(selectedBuilding);
    }
  }, [selectedBuilding]);
  
  // Fetch slots when filters change
  useEffect(() => {
    if (selectedBuilding && selectedFloor) {
      fetchSlots();
    }
  }, [selectedBuilding, selectedFloor, selectedSection, statusFilter, typeFilter]);
  
  const fetchBuildingData = async (building: string) => {
    try {
      const response = await parkingService.getAllSlots({ building });
      const buildingSlots = response.data;
      
      // Extract unique floors and sections for this building
      const uniqueFloors = [...new Set(buildingSlots.map((slot: ParkingSlot) => slot.floor))].sort();
      const uniqueSections = [...new Set(buildingSlots.map((slot: ParkingSlot) => slot.section))].sort();
      
      setFloors(uniqueFloors);
      setSections(uniqueSections);
      
      if (uniqueFloors.length > 0) {
        setSelectedFloor(uniqueFloors[0]);
      }
    } catch (error) {
      console.error('Error fetching building data:', error);
      setErrorMessage('Failed to load building data. Please try again.');
    }
  };
  
  const fetchSlots = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params: any = {
        building: selectedBuilding,
        floor: selectedFloor
      };
      if (selectedSection) params.section = selectedSection;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      
      const response = await parkingService.getAllSlots(params);
      setParkingSlots(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching slots:', error);
      setErrorMessage('Failed to load parking slots. Please try again.');
      setParkingSlots([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status !== 'empty') return;
    setSelectedSlot(slot);
    
    // Set default vehicle number if user has one
    if (user?.vehicleNumbers && user.vehicleNumbers.length > 0) {
      setVehicleNumber(user.vehicleNumbers[0]);
    }
  };
  
  const handleBookSlot = async () => {
    if (!selectedSlot || !vehicleNumber) return;
    
    try {
      setIsBooking(true);
      
      await bookingService.createBooking({
        parkingSlotId: selectedSlot._id,
        vehicleNumber
      });
      
      setBookingSuccess(true);
      
      // Refetch slots to update status
      setTimeout(() => {
        fetchSlots();
        setSelectedSlot(null);
        setVehicleNumber('');
        setBookingSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error booking slot:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to book the slot. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };
  
  // Get slot style based on status, type, and dimensions
  const getSlotStyle = (slot: ParkingSlot) => {
    const width = slot.dimensions.width * 100;
    const height = slot.dimensions.height * 100;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${slot.coordinates.x}px`,
      top: `${slot.coordinates.y}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `scale(${mapScale})`,
      transformOrigin: 'top left',
      transition: 'all 0.3s ease'
    };
    
    return style;
  };
  
  // Get slot background color based on status and type
  const getSlotColor = (slot: ParkingSlot) => {
    // Base classes for styling
    let classes = 'relative p-4 rounded-lg shadow-sm cursor-pointer transition-all ';
    
    // Status-based styling
    switch(slot.status) {
      case 'empty':
        classes += 'bg-white border-2 border-gray-300 hover:shadow-md ';
        break;
      case 'booked':
        classes += 'bg-amber-100 border-2 border-amber-500 ';
        break;
      case 'occupied':
        classes += 'bg-red-100 border-2 border-red-500 ';
        break;
    }
    
    // Type-based styling
    switch(slot.type) {
      case 'handicapped':
        classes += 'border-blue-500 ';
        break;
      case 'electric':
        classes += 'border-green-500 ';
        break;
      case 'vip':
        classes += 'border-purple-500 ';
        break;
      case 'compact':
        classes += 'border-teal-500 ';
        break;
    }
    
    // Highlight selected slot
    if (selectedSlot && selectedSlot._id === slot._id) {
      classes += 'ring-2 ring-blue-500 ring-offset-2 ';
    }
    
    return classes;
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parking Map</h1>
        <p className="text-gray-600 mt-1">View and book available parking spaces</p>
      </header>
      
      {/* Building selector */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Building
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="form-input pl-10"
                >
                  {buildings.map((building) => (
                    <option key={building} value={building}>
                      Building {building}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(Number(e.target.value))}
                className="form-input"
              >
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    Floor {floor}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline flex items-center"
              >
                <Filter size={18} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Additional filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Statuses</option>
                  <option value="empty">Empty</option>
                  <option value="booked">Booked</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Types</option>
                  <option value="standard">Standard</option>
                  <option value="handicapped">Handicapped</option>
                  <option value="electric">Electric</option>
                  <option value="compact">Compact</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedSection('');
                  setStatusFilter('');
                  setTypeFilter('');
                }}
                className="btn btn-outline mr-2"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchSlots}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* Stats and legend */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Total Slots</div>
            <div className="text-xl font-semibold text-gray-800">{parkingSlots.length}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Available</div>
            <div className="text-xl font-semibold text-green-600">
              {parkingSlots.filter(slot => slot.status === 'empty').length}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Booked</div>
            <div className="text-xl font-semibold text-amber-600">
              {parkingSlots.filter(slot => slot.status === 'booked').length}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Occupied</div>
            <div className="text-xl font-semibold text-red-600">
              {parkingSlots.filter(slot => slot.status === 'occupied').length}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Empty</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Handicapped</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Electric</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border-2 border-purple-500 rounded mr-2"></div>
            <span className="text-sm text-gray-700">VIP</span>
          </div>
        </div>
      </div>
      
      {/* Parking map */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                Building {selectedBuilding} - Floor {selectedFloor}
                {selectedSection && ` - Section ${selectedSection}`}
              </h2>
              <p className="text-sm text-gray-500">Click on an empty slot to book it</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMapScale(Math.max(0.5, mapScale - 0.1))}
                className="btn btn-outline p-2"
              >
                -
              </button>
              <span className="text-sm text-gray-600">{Math.round(mapScale * 100)}%</span>
              <button
                onClick={() => setMapScale(Math.min(2, mapScale + 0.1))}
                className="btn btn-outline p-2"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="relative w-full h-[600px] overflow-auto bg-gray-50 rounded-lg">
            <div className="absolute inset-0">
              {parkingSlots.map((slot) => (
                <div
                  key={slot._id}
                  style={getSlotStyle(slot)}
                  className={getSlotColor(slot)}
                  onClick={() => handleSlotClick(slot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{slot.slotNumber}</span>
                    <span className={`badge ${
                      slot.status === 'empty' ? 'badge-empty' : 
                      slot.status === 'booked' ? 'badge-booked' : 
                      'badge-occupied'
                    }`}>
                      {slot.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {slot.section}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {slot.type}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Car size={16} className={
                      slot.status === 'empty' ? 'text-gray-300' : 
                      slot.status === 'booked' ? 'text-amber-500' : 
                      'text-red-500'
                    } />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Booking dialog */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Successful!</h3>
                <p className="text-gray-600 mb-6">
                  You have successfully booked Slot {selectedSlot.slotNumber}.
                </p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => navigate('/bookings')}
                    className="btn btn-primary"
                  >
                    View My Bookings
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Book Parking Slot</h3>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-md">
                  <div className="flex items-start">
                    <MapPin size={20} className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <div className="font-medium text-gray-800">
                        Slot {selectedSlot.slotNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        Building {selectedSlot.building}, Floor {selectedSlot.floor}
                      </div>
                      <div className="text-sm text-gray-600">
                        Section {selectedSlot.section}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        Type: {selectedSlot.type}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  {user?.vehicleNumbers && user.vehicleNumbers.length > 0 ? (
                    <select
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="form-input"
                    >
                      {user.vehicleNumbers.map((vn) => (
                        <option key={vn} value={vn}>{vn}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="Enter vehicle number"
                        className="form-input"
                
                        required
                      />
                      <div className="text-sm text-gray-500">
                        <a href="/profile" className="text-blue-600 hover:underline">
                          Add vehicles to your profile
                        </a> for faster booking next time.
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setVehicleNumber('');
                    }}
                    className="btn btn-outline"
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookSlot}
                    className="btn btn-primary"
                    disabled={isBooking || !vehicleNumber}
                  >
                    {isBooking ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Booking...
                      </>
                    ) : 'Book Now'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;