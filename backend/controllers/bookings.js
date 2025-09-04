import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { parkingSlotId, vehicleNumber } = req.body;
    
    // Check if parking slot exists
    const parkingSlot = await ParkingSlot.findById(parkingSlotId);
    if (!parkingSlot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }
    
    // Check if parking slot is available
    if (parkingSlot.status !== 'empty') {
      return res.status(400).json({
        success: false,
        message: 'Parking slot is not available'
      });
    }
    
    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      parkingSlot: parkingSlotId,
      vehicleNumber,
      startTime: new Date(),
      status: 'active'
    });
    
    // Update parking slot status to 'booked'
    parkingSlot.status = 'booked';
    await parkingSlot.save();
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('parkingSlot', 'slotNumber floor section')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('parkingSlot', 'slotNumber floor section')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('parkingSlot', 'slotNumber floor section');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    booking.status = status;
    
    // If completing or cancelling the booking, update the slot status
    if (status === 'completed' || status === 'cancelled') {
      booking.endTime = new Date();
      
      // Update parking slot status
      const parkingSlot = await ParkingSlot.findById(booking.parkingSlot);
      if (parkingSlot) {
        parkingSlot.status = 'empty';
        await parkingSlot.save();
      }
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete a booking
// @route   PUT /api/bookings/:id/complete
// @access  Private
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is owner
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this booking'
      });
    }
    
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }
    
    booking.status = 'completed';
    booking.endTime = new Date();
    
    // Update parking slot status
    const parkingSlot = await ParkingSlot.findById(booking.parkingSlot);
    if (parkingSlot) {
      parkingSlot.status = 'empty';
      await parkingSlot.save();
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is owner
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }
    
    booking.status = 'cancelled';
    booking.endTime = new Date();
    
    // Update parking slot status
    const parkingSlot = await ParkingSlot.findById(booking.parkingSlot);
    if (parkingSlot) {
      parkingSlot.status = 'empty';
      await parkingSlot.save();
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};