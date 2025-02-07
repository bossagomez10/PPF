const BASE_URL = window.location.origin;  // Cambia tu URL base actual

// Verificación de autenticación
async function checkAuth() {
   try {
       const user = JSON.parse(localStorage.getItem('user'));
       if (!user || user.rol !== 'admin') {
           window.location.href = '/login.html';
           return false;
       }
       return true;
   } catch (error) {
       console.error('Error en checkAuth:', error);
       window.location.href = '/login.html';
       return false;
   }
}

// Mostrar secciones
function showSection(sectionId, event) {
   if (event) event.preventDefault();
   
   // Actualizar título
   document.querySelector('h1.h2').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

   if (sectionId === 'dashboard') {
       loadInstallers();
       loadVehicles();
       loadPieces();
       //loadQuotes();
       
       document.getElementById('instaladores-section').style.display = 'block';
       document.getElementById('vehiculos-section').style.display = 'block';
       document.getElementById('cotizaciones-section').style.display = 'block';
       document.getElementById('piezas-section').style.display = 'block';
   } else {
       document.getElementById('instaladores-section').style.display = 'none';
       document.getElementById('vehiculos-section').style.display = 'none';
       document.getElementById('cotizaciones-section').style.display = 'none';
       document.getElementById('piezas-section').style.display = 'none';

       const selectedSection = document.getElementById(`${sectionId}-section`);
       if (selectedSection) {
           selectedSection.style.display = 'block';
           
           switch(sectionId) {
               case 'instaladores':
                   loadInstallers();
                   break;
               case 'vehiculos':
                   loadVehicles();
                   break;
               case 'piezas':
                   loadPieces();
                   break;
               case 'cotizaciones':
                   loadQuotes();
                   break;
           }
       }
   }

   document.querySelectorAll('.nav-link').forEach(link => {
       link.classList.remove('active');
   });
   const activeLink = document.querySelector(`[href="#${sectionId}"]`);
   if (activeLink) {
       activeLink.classList.add('active');
   }
}

// En la sección Event Listeners, agrega:
document.getElementById('installerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const installerData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        rol: 'instalador',
        factorDescuento: parseFloat(formData.get('factorDescuento'))
    };
    if (formData.get('password')) {
        installerData.password = formData.get('password');
    }

    try {
        const id = formData.get('id');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${BASE_URL}/api/users/${id}` : `${BASE_URL}/api/users`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(installerData)
        });

        if (!response.ok) throw new Error('Error al guardar instalador');
        await loadInstallers();
        this.reset();
        bootstrap.Modal.getInstance(document.getElementById('installerModal')).hide();
        alert('Instalador guardado exitosamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar instalador');
    }
});


async function editInstaller(installerId) {
    try {
        const response = await fetch(`${BASE_URL}/api/users/${installerId}`);
        const installer = await response.json();
        
        document.getElementById('installerForm').querySelector('input[name="id"]').value = installer._id;
        document.getElementById('installerForm').querySelector('input[name="nombre"]').value = installer.nombre;
        document.getElementById('installerForm').querySelector('input[name="email"]').value = installer.email;
        document.getElementById('installerForm').querySelector('input[name="factorDescuento"]').value = installer.factorDescuento;
        
        new bootstrap.Modal(document.getElementById('installerModal')).show();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar instalador');
    }
}

async function deleteInstaller(installerId) {
    if (!confirm('¿Seguro que desea eliminar este instalador?')) return;
    try {
        const response = await fetch(`${BASE_URL}/api/users/${installerId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar instalador');
        await loadInstallers();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar instalador');
    }
}
// Función para calcular valores
function calculateValues() {
    const form = document.getElementById('pieceForm');
    const ancho = parseFloat(form.querySelector('input[name="ancho"]').value);
    const largo = parseFloat(form.querySelector('input[name="largo"]').value);
    const horasInstalacion = parseFloat(form.querySelector('input[name="horasInstalacion"]').value);

    try {
        let linearMeters = Math.min(ancho, largo);
        if (ancho > 1.5 || largo > 1.5) {
            linearMeters = Math.max(ancho, largo);
        }

        const squareMeters = linearMeters * 1.5;
        const utilization = ancho * largo;
        const areaUsed = squareMeters - utilization;
        const utilizationValue = areaUsed * 247000;

        const materialCost = linearMeters * 370000;
        const risk = materialCost * 0.10;
        const labor = horasInstalacion * 35000;
        const approximation = linearMeters * 50000;
        const discountOnUtilization = -utilizationValue * 0.70;

        const totalSinInstalar = (materialCost + risk + approximation + discountOnUtilization) / 0.7;
        const totalInstalado = (materialCost + risk + labor + approximation + discountOnUtilization) / 0.7;

        // Actualizar UI
        document.getElementById('calculationResults').classList.remove('d-none');
        document.getElementById('metrosLineales').textContent = `${linearMeters.toFixed(2)} m`;
        document.getElementById('metrosCuadrados').textContent = `${squareMeters.toFixed(2)} m²`;
        document.getElementById('areaUtilizada').textContent = `${utilization.toFixed(2)} m²`;
        document.getElementById('aprovechamiento').textContent = `${areaUsed.toFixed(2)} m²`;
        document.getElementById('costoMaterial').textContent = `$${materialCost.toLocaleString()}`;
        document.getElementById('costoRiesgo').textContent = `$${risk.toLocaleString()}`;
        document.getElementById('costoManoObra').textContent = `$${labor.toLocaleString()}`;
        document.getElementById('costoAproximacion').textContent = `$${approximation.toLocaleString()}`;
        document.getElementById('totalSinInstalar').textContent = `$${Math.round(totalSinInstalar).toLocaleString()}`;
        document.getElementById('totalInstalado').textContent = `$${Math.round(totalInstalado).toLocaleString()}`;
            } catch (error) {
        console.error('Error:', error);
        alert('Error en cálculos');
    }
}
// Cargar instaladores
async function loadInstallers() {
   try {
       const response = await fetch(`${BASE_URL}/api/users`);
       if (!response.ok) throw new Error('Error al cargar instaladores');
       
       const users = await response.json();
       const tbody = document.getElementById('installersTable');
       
       tbody.innerHTML = users.map(user => `
           <tr>
               <td>${user.nombre || ''}</td>
               <td>${user.email || ''}</td>
               <td>${user.rol || ''}</td>
               <td>${user.factorDescuento || ''}</td>
               <td>
                   <button onclick="editInstaller('${user._id}')" class="btn btn-sm btn-primary me-1">
                       <i class="bi bi-pencil"></i>
                   </button>
                   <button onclick="deleteInstaller('${user._id}')" class="btn btn-sm btn-danger">
                       <i class="bi bi-trash"></i>
                   </button>
               </td>
           </tr>
       `).join('');
   } catch (error) {
       console.error('Error:', error);
       alert('Error al cargar instaladores');
   }
}

// Cargar vehículos
async function loadVehicles() {
    try {
        const response = await fetch(`${BASE_URL}/api/vehicles`);
        if (!response.ok) throw new Error('Error al cargar vehículos');
        
        const vehicles = await response.json();
        const tbody = document.getElementById('vehiclesTable');
        
        tbody.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td>
                    ${vehicle.imagen ? 
                        `<img src="${vehicle.imagen}" alt="${vehicle.marca}" style="width: 100px; height: 60px; object-fit: cover;">` : 
                        'Sin imagen'}
                </td>
                <td>${vehicle.marca}</td>
                <td>${vehicle.modelo}</td>
                <td>${vehicle.ano}</td>
                <td>
                    <button onclick="editVehicle('${vehicle._id}')" class="btn btn-sm btn-primary me-1">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteVehicle('${vehicle._id}')" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar vehículos');
    }
 }
// Cargar piezas
async function loadPieces() {
    try {
        const response = await fetch(`${BASE_URL}/api/pieces`);
        if (!response.ok) throw new Error('Error al cargar piezas');
        
        const pieces = await response.json();
        const tbody = document.getElementById('piecesTable');
        
        tbody.innerHTML = pieces.map(piece => `
            <tr>
                <td>${piece.imagen ? `<img src="${piece.imagen}" alt="${piece.nombre}" style="width: 100px; height: 60px; object-fit: cover;">` : 'Sin imagen'}</td>
                
                <td>${piece.vehicleId?.marca} ${piece.vehicleId?.modelo}</td>
                <td>${piece.nombre}</td>
                <td>${piece.ancho}m x ${piece.largo}m</td>
                <td>${piece.horasInstalacion}</td>
                <td>
                    <button onclick="editPiece('${piece._id}')" class="btn btn-sm btn-primary me-1">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deletePiece('${piece._id}')" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar piezas');
    }
 }
// Cargar cotizaciones
async function loadQuotes() {
   try {
       const response = await fetch(`${BASE_URL}/api/quotes`);
       if (!response.ok) throw new Error('Error al cargar cotizaciones');
       
       const quotes = await response.json();
       const tbody = document.getElementById('quotesTable');
       
       tbody.innerHTML = quotes.map(quote => `
           <tr>
               <td>${new Date(quote.fecha).toLocaleDateString()}</td>
               <td>${quote.instaladorNombre || ''}</td>
               <td>${quote.vehiculoMarca || ''} ${quote.vehiculoModelo || ''}</td>
               <td>$${quote.total ? quote.total.toLocaleString() : ''}</td>
               <td>
                   <span class="badge bg-${quote.estado === 'completada' ? 'success' : 'warning'}">
                       ${quote.estado === 'completada' ? 'Completada' : 'Pendiente'}
                   </span>
               </td>
               <td>
                   <button onclick="updateQuoteStatus('${quote._id}', 'completada')" 
                           class="btn btn-sm btn-success" 
                           ${quote.estado === 'completada' ? 'disabled' : ''}>
                       <i class="bi bi-check-lg"></i>
                   </button>
               </td>
           </tr>
       `).join('');
   } catch (error) {
       console.error('Error:', error);
       alert('Error al cargar cotizaciones');
   }
}

// Vehículos CRUD
async function editVehicle(vehicleId) {
   try {
       const response = await fetch(`${BASE_URL}/api/vehicles/${vehicleId}`);
       if (!response.ok) throw new Error('Error al obtener datos del vehículo');
       
       const vehicle = await response.json();
       const form = document.getElementById('vehicleForm');
       form.querySelector('input[name="id"]').value = vehicle._id;
       form.querySelector('input[name="marca"]').value = vehicle.marca;
       form.querySelector('input[name="modelo"]').value = vehicle.modelo;
       form.querySelector('input[name="ano"]').value = vehicle.ano;

       const modal = new bootstrap.Modal(document.getElementById('vehicleModal'));
       modal.show();
   } catch (error) {
       console.error('Error:', error);
       alert('Error al cargar datos del vehículo');
   }
}

async function deleteVehicle(vehicleId) {
   if (!confirm('¿Está seguro de eliminar este vehículo?')) return;
   try {
       const response = await fetch(`${BASE_URL}/api/vehicles/${vehicleId}`, {
           method: 'DELETE'
       });
       if (!response.ok) throw new Error('Error al eliminar vehículo');
       await loadVehicles();
       alert('Vehículo eliminado exitosamente');
   } catch (error) {
       console.error('Error:', error);
       alert('Error al eliminar vehículo');
   }
}

// Piezas CRUD
async function editPiece(pieceId) {
   try {
       const response = await fetch(`${BASE_URL}/api/pieces/${pieceId}`);
       if (!response.ok) throw new Error('Error al obtener datos de la pieza');
       
       const piece = await response.json();
       const form = document.getElementById('pieceForm');
       await loadVehiclesForSelect();
       
       form.querySelector('input[name="id"]').value = piece._id;
       form.querySelector('select[name="vehicleId"]').value = piece.vehicleId._id;
       form.querySelector('input[name="nombre"]').value = piece.nombre;
       form.querySelector('input[name="ancho"]').value = piece.ancho;
       form.querySelector('input[name="largo"]').value = piece.largo;
       form.querySelector('input[name="horasInstalacion"]').value = piece.horasInstalacion;

       const modal = new bootstrap.Modal(document.getElementById('pieceModal'));
       modal.show();
   } catch (error) {
       console.error('Error:', error);
       alert('Error al cargar datos de la pieza');
   }
}

async function deletePiece(pieceId) {
   if (!confirm('¿Está seguro de eliminar esta pieza?')) return;
   try {
       const response = await fetch(`${BASE_URL}/api/pieces/${pieceId}`, {
           method: 'DELETE'
       });
       if (!response.ok) throw new Error('Error al eliminar pieza');
       await loadPieces();
       alert('Pieza eliminada exitosamente');
   } catch (error) {
       console.error('Error:', error);
       alert('Error al eliminar pieza');
   }
}

async function loadVehiclesForSelect() {
   try {
       const response = await fetch(`${BASE_URL}/api/vehicles`);
       if (!response.ok) throw new Error('Error al cargar vehículos');
       
       const vehicles = await response.json();
       const select = document.querySelector('select[name="vehicleId"]');
       
       select.innerHTML = `
           <option value="">Seleccione un vehículo</option>
           ${vehicles.map(v => `
               <option value="${v._id}">${v.marca} ${v.modelo} (${v.ano})</option>
           `).join('')}
       `;
   } catch (error) {
       console.error('Error:', error);
       alert('Error al cargar lista de vehículos');
   }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
   checkAuth();
   showSection('dashboard');
   
   // Eventos de los botones
   document.getElementById('newInstallerBtn').addEventListener('click', () => {
       document.getElementById('installerForm').reset();
       new bootstrap.Modal(document.getElementById('installerModal')).show();
   });

   document.getElementById('newVehicleBtn').addEventListener('click', () => {
    const form = document.getElementById('vehicleForm');
    form.reset();
    form.querySelector('input[name="id"]').value = '';
    new bootstrap.Modal(document.getElementById('vehicleModal')).show();
});

document.getElementById('newPieceBtn').addEventListener('click', async () => {
    const form = document.getElementById('pieceForm');
    form.reset();
    form.querySelector('input[name="id"]').value = '';
    await loadVehiclesForSelect();
    new bootstrap.Modal(document.getElementById('pieceModal')).show();
});

   // Form submissions
   /*document.getElementById('vehicleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    try {
        const id = formData.get('id');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${BASE_URL}/api/vehicles/${id}` : `${BASE_URL}/api/vehicles`;

        const response = await fetch(url, {
            method,
            body: formData
        });

        if (!response.ok) throw new Error('Error al guardar vehículo');
        await loadVehicles();
        this.reset();
        bootstrap.Modal.getInstance(document.getElementById('vehicleModal')).hide();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el vehículo');
    }
});*/
// admin.js - Vehicle form submit handler
document.getElementById('vehicleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData();
    
    // Obtener el ID si existe (edición)
    const id = this.querySelector('[name="id"]').value;
    
    formData.append('marca', this.querySelector('[name="marca"]').value);
    formData.append('modelo', this.querySelector('[name="modelo"]').value);
    formData.append('ano', this.querySelector('[name="ano"]').value);

    const imageFile = this.querySelector('[name="imagen"]').files[0];
    if (imageFile) {
        formData.append('imagen', imageFile);
    }

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${BASE_URL}/api/vehicles/${id}` : `${BASE_URL}/api/vehicles`;
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (!response.ok) throw new Error('Error al guardar vehículo');

        await loadVehicles();
        this.reset();
        bootstrap.Modal.getInstance(document.getElementById('vehicleModal')).hide();
        alert(id ? 'Vehículo actualizado exitosamente' : 'Vehículo guardado exitosamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar vehículo: ' + error.message);
    }
});


document.getElementById('pieceForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener el ID si existe (edición)
    const id = this.querySelector('[name="id"]').value;
    
    // Obtener valores del formulario
    const formData = new FormData();
    formData.append('vehicleId', this.querySelector('[name="vehicleId"]').value);
    formData.append('nombre', this.querySelector('[name="nombre"]').value);
    
    // Obtener dimensiones y horas
    const ancho = parseFloat(this.querySelector('[name="ancho"]').value);
    const largo = parseFloat(this.querySelector('[name="largo"]').value);
    const horasInstalacion = parseFloat(this.querySelector('[name="horasInstalacion"]').value);
    
    formData.append('ancho', ancho);
    formData.append('largo', largo);
    formData.append('horasInstalacion', horasInstalacion);
    
    // Calcular métricas y costos
    let linearMeters = Math.min(ancho, largo);
    if (ancho > 1.5 || largo > 1.5) {
        linearMeters = Math.max(ancho, largo);
    }
 
    const squareMeters = linearMeters * 1.5;
    const utilization = ancho * largo;
    const areaUsed = squareMeters - utilization;
    const utilizationValue = areaUsed * 247000;
 
    const materialCost = linearMeters * 370000;
    const risk = materialCost * 0.10;
    const labor = horasInstalacion * 35000;
    const approximation = linearMeters * 50000;
    const discountOnUtilization = -utilizationValue * 0.70;
 
    const totalSinInstalar = (materialCost + risk + approximation + discountOnUtilization) / 0.7;
    const totalInstalado = (materialCost + risk + labor + approximation + discountOnUtilization) / 0.7;
 
    // Crear objetos de métricas y costos
    const metricas = {
        metrosLineales: linearMeters,
        metrosCuadrados: squareMeters,
        areaUtilizada: utilization,
        aprovechamiento: areaUsed
    };
 
    const costos = {
        material: materialCost,
        riesgo: risk,
        manoObra: labor,
        aproximacion: approximation,
        totalSinInstalar: Math.round(totalSinInstalar),
        totalInstalado: Math.round(totalInstalado)
    };
 
    formData.append('metricas', JSON.stringify(metricas));
    formData.append('costos', JSON.stringify(costos));
    
    // Agregar imagen si existe
    const imageFile = this.querySelector('[name="imagen"]').files[0];
    if (imageFile) {
        formData.append('imagen', imageFile);
    }
 
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${BASE_URL}/api/pieces/${id}` : `${BASE_URL}/api/pieces`;
 
        const response = await fetch(url, {
            method: method,
            body: formData
        });
 
        if (!response.ok) throw new Error('Error al guardar pieza');
 
        await loadPieces();
        this.reset();
        document.getElementById('calculationResults').classList.add('d-none');
        bootstrap.Modal.getInstance(document.getElementById('pieceModal')).hide();
        alert(id ? 'Pieza actualizada exitosamente' : 'Pieza guardada exitosamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar pieza');
    }
 });
});

function logout() {
   localStorage.removeItem('user');
   window.location.href = '/login.html';
}
