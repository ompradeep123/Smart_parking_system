import ParkingSlot from '../models/ParkingSlot.js';

// @desc    Get all parking slots
// @route   GET /api/parking
// @access  Public
export const getParkingSlots = async (req, res) => {
  try {
    const { status, floor, section, type } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (floor) query.floor = floor;
    if (section) query.section = section;
    if (type) query.type = type;
    
    const parkingSlots = await ParkingSlot.find(query).sort({ floor: 1, section: 1, slotNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: parkingSlots.length,
      data: parkingSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get parking slots by floor
// @route   GET /api/parking/floor/:floor
// @access  Public
export const getParkingSlotsByFloor = async (req, res) => {
  try {
    const { floor } = req.params;
    const { section, status } = req.query;
    
    // Build query
    const query = { floor };
    if (section) query.section = section;
    if (status) query.status = status;
    
    const parkingSlots = await ParkingSlot.find(query).sort({ section: 1, slotNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: parkingSlots.length,
      data: parkingSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single parking slot
// @route   GET /api/parking/:id
// @access  Public
export const getParkingSlotById = async (req, res) => {
  try {
    const parkingSlot = await ParkingSlot.findById(req.params.id);
    
    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parkingSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a parking slot
// @route   POST /api/parking
// @access  Private/Admin
export const createParkingSlot = async (req, res) => {
  try {
    const { slotNumber, floor, section, type, coordinates } = req.body;
    
    // Check if slot already exists
    const existingSlot = await ParkingSlot.findOne({ slotNumber });
    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Slot number already exists'
      });
    }
    
    const parkingSlot = await ParkingSlot.create({
      slotNumber,
      floor,
      section,
      type,
      coordinates,
      status: 'empty'
    });
    
    res.status(201).json({
      success: true,
      data: parkingSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a parking slot
// @route   PUT /api/parking/:id
// @access  Private/Admin
export const updateParkingSlot = async (req, res) => {
  try {
    const { slotNumber, floor, section, status, type, coordinates } = req.body;
    
    // Build update object
    const updateFields = {};
    if (slotNumber) updateFields.slotNumber = slotNumber;
    if (floor) updateFields.floor = floor;
    if (section) updateFields.section = section;
    if (status) updateFields.status = status;
    if (type) updateFields.type = type;
    if (coordinates) updateFields.coordinates = coordinates;
    
    updateFields.updatedAt = Date.now();
    
    const parkingSlot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parkingSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a parking slot
// @route   DELETE /api/parking/:id
// @access  Private/Admin
export const deleteParkingSlot = async (req, res) => {
  try {
    const parkingSlot = await ParkingSlot.findById(req.params.id);
    
    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }
    
    await parkingSlot.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Parking slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};