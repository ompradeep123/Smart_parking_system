import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Building configurations
const buildings = [
  {
    name: 'A',
    floors: 3,
    sectionsPerFloor: ['North', 'South', 'East', 'West'],
    slotsPerSection: 15,
    specialSlots: {
      handicapped: 2,
      electric: 2,
      vip: 1
    }
  },
  {
    name: 'B',
    floors: 4,
    sectionsPerFloor: ['North', 'South'],
    slotsPerSection: 20,
    specialSlots: {
      handicapped: 3,
      electric: 4,
      vip: 2
    }
  },
  {
    name: 'C',
    floors: 2,
    sectionsPerFloor: ['Main', 'Wing'],
    slotsPerSection: 25,
    specialSlots: {
      handicapped: 4,
      electric: 5,
      compact: 10
    }
  }
];

// Initial seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await ParkingSlot.deleteMany();
    await Booking.deleteMany();
    
    console.log('Data cleared...');
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Create regular user
    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      vehicleNumbers: ['ABC123', 'XYZ789']
    });
    
    console.log('Users created...');
    
    let totalSlots = 0;
    
    // Create parking slots for each building
    for (const building of buildings) {
      for (let floor = 1; floor <= building.floors; floor++) {
        for (const section of building.sectionsPerFloor) {
          let slotCount = 0;
          const baseX = building.name.charCodeAt(0) * 100; // Different X offset for each building
          const baseY = floor * 100; // Different Y offset for each floor
          
          // Calculate special slots distribution
          const specialSlotsArray = [];
          for (const [type, count] of Object.entries(building.specialSlots)) {
            for (let i = 0; i < count; i++) {
              specialSlotsArray.push(type);
            }
          }
          
          // Create slots for this section
          for (let i = 1; i <= building.slotsPerSection; i++) {
            slotCount++;
            totalSlots++;
            
            // Determine slot type
            let type = 'standard';
            if (specialSlotsArray.length > 0 && Math.random() < 0.3) {
              const randomIndex = Math.floor(Math.random() * specialSlotsArray.length);
              type = specialSlotsArray.splice(randomIndex, 1)[0];
            }
            
            // Calculate grid position
            const row = Math.floor((i - 1) / 5);
            const col = (i - 1) % 5;
            const x = baseX + col * 30;
            const y = baseY + row * 40;
            
            // Create slot with unique number
            const slotNumber = `${building.name}${floor}${section[0]}${String(i).padStart(2, '0')}`;
            
            await ParkingSlot.create({
              slotNumber,
              building: building.name,
              floor,
              section,
              type,
              status: Math.random() > 0.7 ? 'occupied' : 'empty', // 30% occupied for demo
              coordinates: { x, y },
              dimensions: {
                width: type === 'handicapped' ? 1.5 : 1,
                height: type === 'handicapped' ? 1.5 : 1
              }
            });
          }
          
          console.log(`Created ${slotCount} slots in Building ${building.name}, Floor ${floor}, Section ${section}`);
        }
      }
    }
    
    console.log(`Total ${totalSlots} parking slots created...`);
    
    // Create some bookings
    const slots = await ParkingSlot.find({ status: 'occupied' });
    
    for (const slot of slots) {
      await Booking.create({
        user: user._id,
        parkingSlot: slot._id,
        vehicleNumber: user.vehicleNumbers[Math.floor(Math.random() * user.vehicleNumbers.length)],
        startTime: new Date(Date.now() - Math.floor(Math.random() * 10) * 60 * 60 * 1000), // 0-10 hours ago
        status: 'active'
      });
    }
    
    console.log(`${slots.length} bookings created...`);
    console.log('Data seeded successfully!');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();