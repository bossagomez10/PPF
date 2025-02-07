import mongoose from 'mongoose';

const pieceSchema = new mongoose.Schema({
 vehicleId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Vehicle',
   required: true
 },
 nombre: {
   type: String, 
   required: true
 },
 imagen: String,
 ancho: {
   type: Number,
   required: true
 },
 largo: {
   type: Number,
   required: true
 },
 horasInstalacion: {
   type: Number,
   required: true
 },
 metricas: {
   metrosLineales: Number,
   metrosCuadrados: Number, 
   areaUtilizada: Number,
   aprovechamiento: Number,
   valorAprovechamiento: Number
 },
 costos: {
   material: Number,
   riesgo: Number,
   manoObra: Number,
   aproximacion: Number, 
   descuentoAprovechamiento: Number,
   totalSinInstalar: Number,
   totalInstalado: Number
 }
}, {
 timestamps: true
});

export default mongoose.model('Piece', pieceSchema);