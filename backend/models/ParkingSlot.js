import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Please provide a slot number'],
    unique: true,
    trim: true
  },
  building: {
    type: String,
    required: [true, 'Please provide a building name'],
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Please provide a floor number']
  },
  section: {
    type: String,
    required: [true, 'Please provide a section'],
    trim: true
  },
  status: {
    type: String,
    enum: ['empty', 'booked', 'occupied'],
    default: 'empty'
  },
  type: {
    type: String,
    enum: ['standard', 'handicapped', 'electric', 'compact', 'vip'],
    default: 'standard'
  },
  coordinates: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  dimensions: {
    width: {
      type: Number,
      default: 1
    },
    height: {
      type: Number,
      default: 1
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
parkingSlotSchema.index({ building: 1, floor: 1, section: 1 });
parkingSlotSchema.index({ status: 1 });
parkingSlotSchema.index({ type: 1 });

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

export default ParkingSlot;