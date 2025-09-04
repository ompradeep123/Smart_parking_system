import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide a vehicle number'],
    trim: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'free'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate duration when booking is completed
bookingSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.endTime) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.ceil(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;