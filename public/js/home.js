document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const resultsCount = document.getElementById('results-count');
    const paginationControls = document.getElementById('pagination-controls');

    let currentPage = 1;
    const itemsPerPage = 9;

    // Initial load
    fetchVehicles();

    // Filter form submission
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1;
        fetchVehicles();
    });

    async function fetchVehicles() {
        showLoader();

        try {
            const response = await fetch('http://localhost:3000/vehicles', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                console.log("Error al cargar vehiculos");
            }

            const allVehicles = await response.json();
            const formData = new FormData(filterForm);
            const brandFilter = formData.get('brand')?.toLowerCase();
            const modelFilter = formData.get('model')?.toLowerCase();

            let filtered = allVehicles;

            // Apply Filters
            if (brandFilter) {
                filtered = filtered.filter(v => v.brand.toLowerCase().includes(brandFilter));
            }
            if (modelFilter) {
                filtered = filtered.filter(v => v.model.toLowerCase().includes(modelFilter));
            }

            // Pagination Logic
            const total = filtered.length;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedItems = filtered.slice(startIndex, endIndex);

            renderVehicles(paginatedItems);
            renderPagination(total);
            resultsCount.textContent = `${total} Vehículos Encontrados`;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            vehiclesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem; display: block;"></i>
                    <p style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">No se pudieron cargar los vehículos</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Asegúrate de que el servidor esté encendido.</p>
                </div>
            `;
        }
    }

    function renderVehicles(vehicles) {
        if (!vehicles || vehicles.length === 0) {
            vehiclesGrid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">No se encontraron vehículos que coincidan con tu búsqueda.</div>';
            return;
        }

        const API_URL = 'http://localhost:3000';

        vehiclesGrid.innerHTML = vehicles.map(vehicle => {
            // Manejar la URL de la imagen (viniendo del backend puede ser /uploads/...)
            let imagePath = vehicle.imageUrl;
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
                // Si la ruta comienza con /uploads o similar y no es una URL completa
                imagePath = `${API_URL}${imagePath}`;
            }

            return `
            <div class="vehicle-card" data-id="${vehicle._id}">
                <div class="vehicle-img" style="background: url('${imagePath || ''}') center/cover no-repeat; height: 220px; position: relative;">
                    ${!imagePath ? '<i class="fas fa-car-side" style="font-size: 3rem; color: var(--border);"></i>' : ''}
                    <span class="status-badge ${vehicle.status === 'Disponible' ? 'status-available' : 'status-sold'}">
                        ${vehicle.status}
                    </span>
                </div>
                <div class="vehicle-info" style="padding: 1.5rem;">
                    <div class="vehicle-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <h2 class="vehicle-title" style="font-size: 1.2rem; font-weight: 700; color: #fff;">${vehicle.brand} ${vehicle.model}</h2>
                        <span class="vehicle-price" style="font-size: 1.25rem; font-weight: 800; color: var(--accent);">$${Number(vehicle.price).toLocaleString()}</span>
                    </div>
                    <div class="vehicle-details" style="display: flex; gap: 1.25rem; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
                        <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage || '0'} km</span>
                    </div>
                    <button class="btn btn-primary btn-block" style="margin-top: 0;" onclick="viewDetail('${vehicle._id}')">Ver Detalles</button>
                </div>
                <div class="vehicle-footer" style="padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div class="owner-info" style="font-size: 0.8rem; color: var(--text-secondary);">
                        Vendedor
                        <span style="display: block; color: #fff; font-weight: 600; font-size: 0.9rem; margin-top: 0.1rem;">${vehicle.user ? vehicle.user.name : 'Vendedor Privado'}</span>
                    </div>
                    <button class="btn-share" onclick="shareVehicle(${vehicle.id})" title="Copiar enlace" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    function renderPagination(total) {
        const totalPages = Math.ceil(total / itemsPerPage);

        if (totalPages <= 1) {
            paginationControls.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">
                    ${i}
                </button>
            `;
        }

        html += `
            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationControls.innerHTML = html;
    }

    window.changePage = (page) => {
        currentPage = page;
        fetchVehicles();
        // Scroll to results header
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
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
        // Usamos el query param ?id= para que la pagina de especificacion sepa qué auto cargar
        window.location.href = `/specification?id=${id}`;
    };

    function showLoader() {
        vehiclesGrid.innerHTML = `
            <div class="loader" style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--primary);"></i>
                <span style="color: var(--text-secondary);">Buscando los mejores autos...</span>
            </div>
        `;
    }

    // Auth check for navbar
    const token = localStorage.getItem('token');
    if (token) {
        const authLink = document.getElementById('auth-link');
        const registerLink = document.getElementById('register-link');
        const userMenu = document.getElementById('user-menu');

        if (authLink) authLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
