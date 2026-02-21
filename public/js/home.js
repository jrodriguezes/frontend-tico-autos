document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const resultsCount = document.getElementById('results-count');
    const paginationControls = document.getElementById('pagination-controls');
    
    let currentPage = 1;
    let totalPages = 1;

    // API Base URL
    const API_URL = 'http://localhost:3000/api/vehicles';

    // Initial load
    fetchVehicles();

    // Filter form submission
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1; // Reset to first page on search
        fetchVehicles();
    });

    async function fetchVehicles() {
        showLoader();
        
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();
        
        // Add filters to query params
        for (const [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }
        
        // Add pagination
        params.append('page', currentPage);
        params.append('limit', 9);

        try {
            const response = await fetch(`${API_URL}?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                renderVehicles(data.vehicles);
                renderPagination(data.total, data.page, data.limit);
                resultsCount.textContent = `${data.total} Vehículos Encontrados`;
            } else {
                vehiclesGrid.innerHTML = `<div class="error-msg">Error al cargar vehículos: ${data.message || 'Error desconocido'}</div>`;
            }
        } catch (error) {
            console.error('Fetch error:', error);
            vehiclesGrid.innerHTML = `<div class="error-msg">Error de conexión con el servidor de base de datos</div>`;
        }
    }

    function renderVehicles(vehicles) {
        if (!vehicles || vehicles.length === 0) {
            vehiclesGrid.innerHTML = '<div class="no-results">No se encontraron vehículos que coincidan con tu búsqueda.</div>';
            return;
        }

        vehiclesGrid.innerHTML = vehicles.map(vehicle => `
            <div class="vehicle-card" data-id="${vehicle.id}">
                <div class="vehicle-img">
                    <i class="fas fa-car-side"></i>
                    <span class="status-badge status-${vehicle.status.toLowerCase()}">${vehicle.status}</span>
                </div>
                <div class="vehicle-info">
                    <div class="vehicle-header">
                        <h2 class="vehicle-title">${vehicle.brand} ${vehicle.model}</h2>
                        <span class="vehicle-price">$${Number(vehicle.price).toLocaleString()}</span>
                    </div>
                    <div class="vehicle-details">
                        <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage || '0'} km</span>
                    </div>
                    <button class="btn btn-primary btn-block" onclick="viewDetail(${vehicle.id})">Ver Detalles</button>
                </div>
                <div class="vehicle-footer">
                    <div class="owner-info">
                        Vendedor
                        <span>${vehicle.user ? vehicle.user.name : 'Vendedor Privado'}</span>
                    </div>
                    <button class="btn-share" onclick="shareVehicle(${vehicle.id})" title="Copiar enlace">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function renderPagination(total, page, limit) {
        totalPages = Math.ceil(total / limit);
        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>
            `;
        }

        html += `
            <button class="page-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationControls.innerHTML = html;
    }

    window.changePage = (page) => {
        currentPage = page;
        fetchVehicles();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.shareVehicle = (id) => {
        const url = `${window.location.origin}/vehicles/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('¡Enlace copiado al portapapeles!');
        }).catch(err => {
            console.error('Error copying link:', err);
        });
    };

    window.viewDetail = (id) => {
        // Redirigir al detalle (cuando esté implementado)
        alert('Redirigiendo al detalle del vehículo ' + id);
        // window.location.href = `/vehicles/${id}`;
    };

    function showLoader() {
        vehiclesGrid.innerHTML = '<div class="loader"><i class="fas fa-circle-notch fa-spin"></i> Cargando vehículos...</div>';
    }

    // Auth check for navbar
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-link').style.display = 'none';
        document.getElementById('register-link').style.display = 'none';
        document.getElementById('user-menu').style.display = 'flex';
        // Mocking user name from token (ideally decode JWT)
        document.getElementById('username-display').textContent = 'Mi Cuenta';
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
    });
});
