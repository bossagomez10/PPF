async function loadVehicles() {
    try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) throw new Error('Error al cargar vehículos');
        
        const vehicles = await response.json();
        const container = document.getElementById('vehiclesContainer');
        
        // Agregar barra de búsqueda
        const searchHTML = `
            <div class="col-12 mb-4">
                <div class="input-group">
                    <input type="text" id="searchVehicle" class="form-control" placeholder="Buscar vehículo por marca o modelo...">
                    <button class="btn btn-primary">
                        <i class="bi bi-search"></i> Buscar
                    </button>
                </div>
            </div>
        `;
        
        // Contenedor para los vehículos
        const vehiclesHTML = vehicles.map(vehicle => `
            <div class="col-md-4 mb-4 vehicle-card">
                <div class="card portfolio-item h-100">
                    <img src="${vehicle.imagen || '/images/default-car.jpg'}" 
                         class="card-img-top" 
                         alt="${vehicle.marca} ${vehicle.modelo}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                        <p class="card-text">ano: ${vehicle.ano}</p>
                        <button class="btn btn-primary" onclick="showVehiclePieces('${vehicle._id}')">
                            Ver Piezas
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = searchHTML + vehiclesHTML;
        
        // Agregar evento de búsqueda
        document.getElementById('searchVehicle').addEventListener('input', filterVehicles);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los vehículos');
    }
}

function filterVehicles(e) {
    const searchTerm = e.target.value.toLowerCase();
    const vehicles = document.querySelectorAll('.vehicle-card');
    
    vehicles.forEach(vehicle => {
        const title = vehicle.querySelector('.card-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            vehicle.style.display = '';
        } else {
            vehicle.style.display = 'none';
        }
    });
}

async function showVehiclePieces(vehicleId) {
    try {
        const response = await fetch(`/api/pieces?vehicleId=${vehicleId}`);
        if (!response.ok) throw new Error('Error al cargar piezas');
        
        const pieces = await response.json();
        console.log('Piezas cargadas:', pieces);

        // Crear o actualizar modal
        let piecesModal = document.getElementById('piecesModal');
        if (!piecesModal) {
            const modalHTML = `
                <div class="modal fade" id="piecesModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Piezas del Vehículo</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Imagen</th>
                                                <th>Nombre</th>
                                                <th>Dimensiones</th>
                                                <th>Valor Material</th>
                                                <th>Valor Instalado</th>
                                            </tr>
                                        </thead>
                                        <tbody id="piecesTableBody"></tbody>
                                    </table>
                                </div>
                                ${pieces.length === 0 ? '<div class="alert alert-info">No hay piezas registradas para este vehículo</div>' : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            piecesModal = document.getElementById('piecesModal');
        }

        const tbody = document.getElementById('piecesTableBody');
        tbody.innerHTML = pieces.map(piece => `
            <tr>
                <td>
                    ${piece.imagen ? 
                        `<img src="${piece.imagen}" alt="${piece.nombre}" style="width: 100px; height: 60px; object-fit: cover;">` : 
                        '<div class="text-muted">Sin imagen</div>'}
                </td>
                <td>${piece.nombre || 'N/A'}</td>
                <td>${(piece.ancho || 0).toFixed(2)}m x ${(piece.largo || 0).toFixed(2)}m</td>
                <td>$${piece.costos?.material?.toLocaleString() || '0'}</td>
                <td>$${piece.costos?.totalInstalado?.toLocaleString() || '0'}</td>
            </tr>
        `).join('');

        const modal = new bootstrap.Modal(piecesModal);
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar las piezas del vehículo');
    }
}

// Manejar el login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            
            if (user.rol === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/calculator.html';
            }
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
});

// Inicializar la página
document.addEventListener('DOMContentLoaded', loadVehicles);