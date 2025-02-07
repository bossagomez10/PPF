// models/Vehicle.js
import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  marca: {
    type: String,
    required: true
  },
  modelo: {
    type: String,
    required: true
  },
  ano: {
    type: Number,
    required: true
  },
  imagen: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Vehicle', vehicleSchema);