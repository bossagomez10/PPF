import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  cliente: { type: String, required: false },
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  ancho: { type: Number, required: true },
  alto: { type: Number, required: true },
  horasInstalacion: { type: Number, required: false },
  precioMaterial: { type: Number, required: false },
  precioInstalacion: { type: Number, required: false },
  precioTotal: { type: Number, required: false },
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model('Quote', quoteSchema);