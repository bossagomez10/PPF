import 'dotenv/config'  // Esta línea carga las variables de entorno
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

// Importaciones de modelos
import User from './back/User.js';
import Vehicle from './back/Vehicle.js';
import Quote from './back/Quote.js';
import Piece from './back/Piece.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resto de tu código permanece igual

// Configuración de Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de multer para subida temporal
const upload = multer({ dest: 'uploads/' });

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('public/uploads'));

app.use((req, res, next) => {
 console.log(`${req.method} ${req.url}`);
 next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ppf-calculator')
 .then(() => console.log('MongoDB conectado'))
 .catch(err => console.log('Error MongoDB:', err));

// Rutas base
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/calculator', (req, res) => res.sendFile(path.join(__dirname, 'public', 'calculator.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Auth
app.post('/api/auth/login', async (req, res) => {
 try {
   const { email, password } = req.body;
   const user = await User.findOne({ email, password });
   if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });
   res.json(user);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

// Users CRUD
app.get('/api/users', async (req, res) => {
 try {
   const users = await User.find();
   res.json(users);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

app.get('/api/users/:id', async (req, res) => {
 try {
   const user = await User.findById(req.params.id);
   if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
   res.json(user);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

app.post('/api/users', async (req, res) => {
 try {
   const user = new User(req.body);
   await user.save();
   res.status(201).json(user);
 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

app.put('/api/users/:id', async (req, res) => {
 try {
   const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
   res.json(user);
 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

app.delete('/api/users/:id', async (req, res) => {
 try {
   await User.findByIdAndDelete(req.params.id);
   res.json({ message: 'Usuario eliminado' });
 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

// Vehicles CRUD
app.post('/api/vehicles', upload.single('imagen'), async (req, res) => {
  try {
    let imagenUrl = ''; // URL por defecto

    // Si se sube una imagen
    if (req.file) {
      // Subir imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'vehicles',
        transformation: [
          { width: 800, crop: "limit" },
          { quality: "auto" }
        ]
      });

      // Borrar archivo temporal
      fs.unlinkSync(req.file.path);

      // Obtener URL segura de Cloudinary
      imagenUrl = result.secure_url;
    }

    // Crear datos del vehículo
    const vehicleData = {
      ...req.body,
      imagen: imagenUrl  // Guardar URL en la base de datos
    };

    // Guardar en MongoDB
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/vehicles', async (req, res) => {
 try {
   const vehicles = await Vehicle.find();
   res.json(vehicles);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

app.get('/api/vehicles/:id', async (req, res) => {
 try {
   const vehicle = await Vehicle.findById(req.params.id);
   if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
   res.json(vehicle);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

app.put('/api/vehicles/:id', upload.single('imagen'), async (req, res) => {
 try {
   const vehicle = await Vehicle.findById(req.params.id);

   // Si se sube nueva imagen
   if (req.file) {
     // Subir nueva imagen
     const result = await cloudinary.uploader.upload(req.file.path, {
       folder: 'vehicles',
       transformation: [
         { width: 800, crop: "limit" },
         { quality: "auto" }
       ]
     });

     // Borrar archivo temporal
     fs.unlinkSync(req.file.path);

     // Si había imagen anterior, eliminarla de Cloudinary
     if (vehicle.imagen) {
       // Extraer public_id de la URL anterior
       const publicId = vehicle.imagen.split('/').pop().split('.')[0];
       await cloudinary.uploader.destroy(`vehicles/${publicId}`);
     }

     // Actualizar URL
     vehicle.imagen = result.secure_url;
   }

   // Actualizar otros campos
   vehicle.marca = req.body.marca || vehicle.marca;
   vehicle.modelo = req.body.modelo || vehicle.modelo;

   await vehicle.save();
   res.json(vehicle);
 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

app.delete('/api/vehicles/:id', async (req, res) => {
 try {
   const vehicle = await Vehicle.findById(req.params.id);

   // Si tiene imagen, eliminarla de Cloudinary
   if (vehicle.imagen) {
     const publicId = vehicle.imagen.split('/').pop().split('.')[0];
     await cloudinary.uploader.destroy(`vehicles/${publicId}`);
   }

   // Eliminar piezas asociadas
   await Piece.deleteMany({ vehicleId: req.params.id });
   
   // Eliminar vehículo
   await Vehicle.findByIdAndDelete(req.params.id);
   res.json({ message: 'Vehículo y piezas eliminados' });
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

// Pieces CRUD
app.post('/api/pieces', upload.single('imagen'), async (req, res) => {
  try {
    let imagenUrl = ''; // URL por defecto

    // Si se sube una imagen
    if (req.file) {
      // Subir imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pieces',
        transformation: [
          { width: 500, crop: "limit" },
          { quality: "auto" }
        ]
      });

      // Borrar archivo temporal
      fs.unlinkSync(req.file.path);

      // Obtener URL segura de Cloudinary
      imagenUrl = result.secure_url;
    }

    // Crear datos de la pieza
    const pieceData = {
      ...req.body,
      imagen: imagenUrl,
      costos: JSON.parse(req.body.costos || '[]') // Parsear costos
    };

    // Guardar en MongoDB
    const piece = new Piece(pieceData);
    await piece.save();

    res.status(201).json(piece);
  } catch (error) {
    console.error('Error al guardar pieza:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/pieces', async (req, res) => {
 try {
   const { vehicleId } = req.query;
   const query = vehicleId ? { vehicleId } : {};
   const pieces = await Piece.find(query).populate('vehicleId');
   res.json(pieces);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

app.get('/api/pieces/:id', async (req, res) => {
 try {
   const piece = await Piece.findById(req.params.id).populate('vehicleId');
   if (!piece) return res.status(404).json({ message: 'Pieza no encontrada' });
   res.json(piece);
 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

app.put('/api/pieces/:id', upload.single('imagen'), async (req, res) => {
 try {
   const piece = await Piece.findById(req.params.id);

   // Si se sube nueva imagen
   if (req.file) {
     // Subir nueva imagen
     const result = await cloudinary.uploader.upload(req.file.path, {
       folder: 'pieces',
       transformation: [
         { width: 500, crop: "limit" },
         { quality: "auto" }
       ]
     });

     // Borrar archivo temporal
     fs.unlinkSync(req.file.path);

     // Si había imagen anterior, eliminarla de Cloudinary
     if (piece.imagen) {
       // Extraer public_id de la URL anterior
       const publicId = piece.imagen.split('/').pop().split('.')[0];
       await cloudinary.uploader.destroy(`pieces/${publicId}`);
     }

     // Actualizar URL
     piece.imagen = result.secure_url;
   }

   // Actualizar otros campos
   piece.nombre = req.body.nombre || piece.nombre;
   piece.vehicleId = req.body.vehicleId || piece.vehicleId;
   piece.costos = JSON.parse(req.body.costos || JSON.stringify(piece.costos));

   await piece.save();
   res.json(piece);
 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

app.delete('/api/pieces/:id', async (req, res) => {
 try {
   const piece = await Piece.findById(req.params.id);

   // Si tiene imagen, eliminarla de Cloudinary
   if (piece.imagen) {
     const publicId = piece.imagen.split('/').pop().split('.')[0];
     await cloudinary.uploader.destroy(`pieces/${publicId}`);
   }

   // Eliminar pieza
   await Piece.findByIdAndDelete(req.params.id);
   res.json({ message: 'Pieza eliminada' });
 } catch (error) {
   res.status(400).json({ error: error.message });
 }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));