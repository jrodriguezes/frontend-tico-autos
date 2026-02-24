document.addEventListener('DOMContentLoaded', () => {
    const stockGrid = document.getElementById('stock-grid');
    const stockEmpty = document.getElementById('stock-empty');
    const stockLoader = document.getElementById('stock-loader');
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const vehicleModal = document.getElementById('vehicle-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const vehicleForm = document.getElementById('vehicle-form');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalContent = document.querySelector('.modal-content');
    const logoutBtn = document.getElementById('logout-btn');

    // Image Upload Elements
    const imageInput = document.getElementById('v-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');
    const fileUploadLabel = document.querySelector('.file-upload-label');

    // Multi-step elements
    const formSlider = document.getElementById('form-slider');
    const nextStepBtn = document.getElementById('next-step');
    const prevStepBtn = document.getElementById('prev-step');
    const dot1 = document.getElementById('dot-1');
    const dot2 = document.getElementById('dot-2');

    // State
    const token = localStorage.getItem('token');

    // Mock Data for Interface Demo
    let myVehicles = [
        {
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            price: 25000,
            mileage: 15000,
            status: 'Disponible',
            plateId: 'ABC-123',
            imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000',
            observations: 'Único dueño, servicios de agencia.'
        },
        {
            id: 2,
            brand: 'Nissan',
            model: 'Sentra',
            year: 2026,
            price: 18500,
            mileage: 45000,
            status: 'Vendido',
            plateId: 'XYZ-987',
            imageUrl: 'https://es.nissanusa.com/content/dam/Nissan/us/vehicles/sentra/2026/overview/pfa/2026-nissan-sentra-driving-road-ocean-sunset-background.jpg',
            observations: 'En excelente estado cosmético.'
        }
    ];

    // Initial Render
    setTimeout(() => {
        renderStock();
    }, 1000);

    function renderStock() {
        stockLoader.style.display = 'none';

        if (myVehicles.length === 0) {
            stockGrid.style.display = 'none';
            stockEmpty.style.display = 'block';
            return;
        }

        stockEmpty.style.display = 'none';
        stockGrid.style.display = 'grid';

        stockGrid.innerHTML = myVehicles.map(vehicle => `
            <div class="admin-card" data-id="${vehicle.id}">
                <div class="admin-card-img" style="background: url('${vehicle.imageUrl}') center/cover no-repeat;">
                    ${!vehicle.imageUrl ? '<i class="fas fa-car-side"></i>' : ''}
                    <span class="status-badge ${vehicle.status === 'Disponible' ? 'status-available' : 'status-sold'}">
                        ${vehicle.status}
                    </span>
                </div>
                <div class="admin-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <h3 style="font-size: 1.25rem;">${vehicle.brand} ${vehicle.model}</h3>
                        <span style="color: var(--accent); font-weight: 800;">$${Number(vehicle.price).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">
                        <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                        <span><i class="fas fa-hashtag"></i> ${vehicle.plateId}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage || '0'} km</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; border-top: 1px solid var(--border); padding-top: 10px;">
                        ${vehicle.observations}
                    </p>
                </div>
                <div class="admin-card-actions">
                    <button class="btn-icon" onclick="editVehicle(${vehicle.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-success" onclick="toggleStatus(${vehicle.id})" title="${vehicle.status === 'Disponible' ? 'Marcar como Vendido' : 'Marcar como Disponible'}">
                        <i class="fas ${vehicle.status === 'Disponible' ? 'fa-check-circle' : 'fa-undo'}"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteVehicle(${vehicle.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Modal Operations
    window.openModal = (editId = null) => {
        vehicleForm.reset();
        document.getElementById('vehicle-id').value = '';

        if (editId) {
            const vehicle = myVehicles.find(v => v.id === editId);
            if (vehicle) {
                modalTitle.textContent = 'Editar Vehículo';
                document.getElementById('vehicle-id').value = vehicle.id;
                document.getElementById('v-brand').value = vehicle.brand;
                document.getElementById('v-model').value = vehicle.model;
                document.getElementById('v-year').value = vehicle.year;
                document.getElementById('v-price').value = vehicle.price;
                document.getElementById('v-mileage').value = vehicle.mileage;
                document.getElementById('v-status').value = vehicle.status;
                document.getElementById('v-plate').value = vehicle.plateId;
                document.getElementById('v-observations').value = vehicle.observations;

                if (vehicle.imageUrl) {
                    showPreview(vehicle.imageUrl);
                } else {
                    hidePreview();
                }
            }
        } else {
            modalTitle.textContent = 'Publicar Nuevo Vehículo';
            hidePreview();
        }

        vehicleModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Timeout to ensure content is rendered before measuring for height
        setTimeout(() => {
            goToStep(1);
        }, 10);
    };

    function goToStep(step) {
        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');

        if (step === 1) {
            formSlider.classList.remove('step-2-active');
            dot1.classList.add('active');
            dot2.classList.remove('active');
            modalSubtitle.textContent = 'Paso 1: Información básica del auto.';
            updateModalHeight(step1);
        } else {
            formSlider.classList.add('step-2-active');
            dot1.classList.remove('active');
            dot2.classList.add('active');
            modalSubtitle.textContent = 'Paso 2: Detalles y multimedia.';
            updateModalHeight(step2);
        }
    }

    function updateModalHeight(stepElement) {
        const header = document.querySelector('.modal-header-wrapper');
        const stepper = document.querySelector('.stepper-container');
        const height = header.offsetHeight + stepper.offsetHeight + stepElement.offsetHeight;
        modalContent.style.height = `${height}px`;
    }

    function closeModal() {
        vehicleModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modalContent.style.height = 'auto'; // Reset height
        setTimeout(() => {
            goToStep(1);
        }, 400);
    }

    // Navigation Step Listeners
    nextStepBtn.addEventListener('click', () => {
        if (document.getElementById('v-brand').checkValidity() &&
            document.getElementById('v-model').checkValidity() &&
            document.getElementById('v-year').checkValidity() &&
            document.getElementById('v-price').checkValidity()) {
            goToStep(2);
        } else {
            vehicleForm.reportValidity();
        }
    });

    prevStepBtn.addEventListener('click', () => goToStep(1));

    // Image Upload Logic
    imageInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                showPreview(e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hidePreview();
    });

    function showPreview(src) {
        imagePreview.src = src;
        imagePreviewContainer.style.display = 'block';
        fileUploadLabel.style.display = 'none';
        imageInput.required = false;
    }

    function hidePreview() {
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
        fileUploadLabel.style.display = 'flex';
        imageInput.value = '';
        imageInput.required = true;
    }

    // CRUD Operations (Mocked)
    window.editVehicle = (id) => {
        window.openModal(id);
    };

    window.toggleStatus = (id) => {
        const index = myVehicles.findIndex(v => v.id === id);
        if (index !== -1) {
            myVehicles[index].status = myVehicles[index].status === 'Disponible' ? 'Vendido' : 'Disponible';
            renderStock();
        }
    };

    window.deleteVehicle = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
            myVehicles = myVehicles.filter(v => v.id !== id);
            renderStock();
        }
    };

    // Form Submission
    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('vehicle-id').value;
        const vehicleData = {
            id: id ? parseInt(id) : Date.now(),
            brand: document.getElementById('v-brand').value,
            model: document.getElementById('v-model').value,
            year: parseInt(document.getElementById('v-year').value),
            price: parseFloat(document.getElementById('v-price').value),
            mileage: parseInt(document.getElementById('v-mileage').value) || 0,
            status: document.getElementById('v-status').value,
            plateId: document.getElementById('v-plate').value,
            imageUrl: imagePreview.src.startsWith('data:') || imagePreview.src.startsWith('http') ? imagePreview.src : '',
            observations: document.getElementById('v-observations').value
        };

        if (id) {
            const index = myVehicles.findIndex(v => v.id === parseInt(id));
            myVehicles[index] = vehicleData;
        } else {
            myVehicles.unshift(vehicleData);
        }

        renderStock();
        closeModal();
    });

    // Event Listeners
    addVehicleBtn.addEventListener('click', () => window.openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/home';
    });
});
