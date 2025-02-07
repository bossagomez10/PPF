import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'instalador','cliente constante','cliente final'], required: true },
  factorDescuento: { type: Number, default: 1 }
});

export default mongoose.model('User', userSchema);