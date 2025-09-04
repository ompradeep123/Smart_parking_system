import React, { useState, useEffect } from 'react';
import { parkingService } from '../../services/api';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

interface ParkingSlot {
  _id: string;
  slotNumber: string;
  floor: number;
  section: string;
  status: 'empty' | 'booked' | 'occupied';
  type: 'standard' | 'handicapped' | 'electric' | 'compact';
  coordinates: {
    x: number;
    y: number;
  };
}

interface SlotFormData {
  slotNumber: string;
  floor: number;
  section: string;
  type: string;
  coordinates: {
    x: number;
    y: number;
  };
}

const initialFormData: SlotFormData = {
  slotNumber: '',
  floor: 1,
  section: 'A',
  type: 'standard',
  coordinates: {
    x: 0,
    y: 0
  }
};

const ManageParking: React.FC = () => {
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterFloor, setFilterFloor] = useState<number | ''>('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<SlotFormData>(initialFormData);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Fetch parking slots
  useEffect(() => {
    fetchParkingSlots();
  }, []);
  
  const fetchParkingSlots = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params: any = {};
      if (filterFloor !== '') params.floor = filterFloor;
      if (filterSection) params.section = filterSection;
      if (filterStatus) params.status = filterStatus;
      
      const response = await parkingService.getAllSlots(params);
      setParkingSlots(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching parking slots:', error);
      setErrorMessage('Failed to load parking slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateSlot = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const response = await parkingService.createSlot(formData);
      
      setParkingSlots([...parkingSlots, response.data]);
      setShowAddForm(false);
      setFormData(initialFormData);
      setSuccessMessage('Parking slot created successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error creating parking slot:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to create parking slot');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateSlot = async () => {
    if (!editingSlotId) return;
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      const response = await parkingService.updateSlot(editingSlotId, formData);
      
      // Update the slot in state
      const updatedSlots = parkingSlots.map(slot => 
        slot._id === editingSlotId ? response.data : slot
      );
      
      setParkingSlots(updatedSlots);
      setShowEditForm(false);
      setEditingSlotId(null);
      setFormData(initialFormData);
      setSuccessMessage('Parking slot updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error updating parking slot:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update parking slot');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSlot = async (id: string) => {
    try {
      await parkingService.deleteSlot(id);
      
      // Remove the slot from state
      setParkingSlots(parkingSlots.filter(slot => slot._id !== id));
      
      setConfirmDelete(null);
      setSuccessMessage('Parking slot deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting parking slot:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to delete parking slot');
    }
  };
  
  const handleEditClick = (slot: ParkingSlot) => {
    setFormData({
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      section: slot.section,
      type: slot.type,
      coordinates: {
        x: slot.coordinates.x,
        y: slot.coordinates.y
      }
    });
    setEditingSlotId(slot._id);
    setShowEditForm(true);
    setShowAddForm(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'x' || name === 'y') {
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates,
          [name]: parseInt(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'floor' ? parseInt(value) : value
      });
    }
  };
  
  const handleFilter = () => {
    fetchParkingSlots();
  };
  
  const resetFilters = () => {
    setFilterFloor('');
    setFilterSection('');
    setFilterStatus('');
    setSearch('');
    fetchParkingSlots();
  };
  
  // Filter slots based on search term
  const filteredSlots = parkingSlots.filter(slot => 
    slot.slotNumber.toLowerCase().includes(search.toLowerCase()) ||
    `floor ${slot.floor}`.includes(search.toLowerCase()) ||
    `section ${slot.section}`.toLowerCase().includes(search.toLowerCase()) ||
    slot.status.toLowerCase().includes(search.toLowerCase()) ||
    slot.type.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Parking Slots</h1>
        <p className="text-gray-600 mt-1">Add, edit, or remove parking slots</p>
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
      
      {/* Action buttons */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowEditForm(false);
            setFormData(initialFormData);
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add New Parking Slot
        </button>
      </div>
      
      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-800">Add New Parking Slot</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot Number
                </label>
                <input
                  type="text"
                  name="slotNumber"
                  value={formData.slotNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., 1A01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="standard">Standard</option>
                  <option value="handicapped">Handicapped</option>
                  <option value="electric">Electric</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  X Coordinate
                </label>
                <input
                  type="number"
                  name="x"
                  value={formData.coordinates.x}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Y Coordinate
                </label>
                <input
                  type="number"
                  name="y"
                  value={formData.coordinates.y}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSlot}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit form */}
      {showEditForm && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-800">Edit Parking Slot</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot Number
                </label>
                <input
                  type="text"
                  name="slotNumber"
                  value={formData.slotNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="standard">Standard</option>
                  <option value="handicapped">Handicapped</option>
                  <option value="electric">Electric</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  X Coordinate
                </label>
                <input
                  type="number"
                  name="x"
                  value={formData.coordinates.x}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Y Coordinate
                </label>
                <input
                  type="number"
                  name="y"
                  value={formData.coordinates.y}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingSlotId(null);
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateSlot}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this parking slot? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSlot(confirmDelete)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and search */}
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
                  placeholder="Search by slot number, floor, section, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <select
                  value={filterFloor}
                  onChange={(e) => setFilterFloor(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="form-input"
                >
                  <option value="">All Floors</option>
                  {[1, 2, 3, 4, 5].map(floor => (
                    <option key={floor} value={floor}>Floor {floor}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Sections</option>
                  {['A', 'B', 'C', 'D', 'E'].map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Statuses</option>
                  <option value="empty">Empty</option>
                  <option value="booked">Booked</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="btn btn-outline"
              >
                Reset
              </button>
              <button
                onClick={handleFilter}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading parking slots...</p>
          </div>
        ) : filteredSlots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSlots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{slot.slotNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin size={16} className="text-gray-400 mr-1" />
                        Floor {slot.floor}, Section {slot.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{slot.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge 
                        ${slot.status === 'empty' ? 'badge-empty' : 
                           slot.status === 'booked' ? 'badge-booked' : 
                           'badge-occupied'}`}>
                        {slot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEditClick(slot)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(slot._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
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
            <h3 className="text-gray-800 font-medium mb-1">No parking slots found</h3>
            <p className="text-gray-500 text-sm mb-4">
              Try adjusting your filters or create new parking slots.
            </p>
            <button
              onClick={resetFilters}
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

export default ManageParking;