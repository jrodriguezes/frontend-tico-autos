document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = '/home';
        return;
    }

    const vehicle = await getVehicleById(id);

    if (vehicle) {
        // Displays de texto
        if (document.getElementById('seller-name')) {
            document.getElementById('seller-name').textContent = vehicle.ownerId;
        }

        if (document.getElementById('v-title-display')) {
            document.getElementById('v-title-display').textContent = `${vehicle.brand} ${vehicle.model}`;
        }
        if (document.getElementById('v-price-display')) {
            document.getElementById('v-price-display').textContent = `$${Number(vehicle.price).toLocaleString()}`;
        }
        if (document.getElementById('v-brand-display')) {
            document.getElementById('v-brand-display').textContent = vehicle.brand;
        }
        if (document.getElementById('v-model-display')) {
            document.getElementById('v-model-display').textContent = vehicle.model;
        }
        if (document.getElementById('v-year-display')) {
            document.getElementById('v-year-display').textContent = vehicle.year;
        }
        if (document.getElementById('v-mileage-display')) {
            document.getElementById('v-mileage-display').textContent = `${Number(vehicle.mileage || 0).toLocaleString()} km`;
        }
        if (document.getElementById('v-plate-display')) {
            document.getElementById('v-plate-display').textContent = vehicle.plateId || '-';
        }
        if (document.getElementById('v-detail-price')) {
            document.getElementById('v-detail-price').textContent = `$${Number(vehicle.price).toLocaleString()}`;
        }
        if (document.getElementById('v-observations-display')) {
            document.getElementById('v-observations-display').textContent = vehicle.observations || 'Sin observaciones adicionales.';
        }

        // Status Badge
        const statusBadge = document.getElementById('v-status-badge');
        if (statusBadge) {
            statusBadge.textContent = vehicle.status;
            statusBadge.className = `status-indicator ${vehicle.status === 'Disponible' ? 'status-available' : 'status-sold'}`;
        }

        // Inputs ocultos (compatibilidad)
        if (document.getElementById('v-brand')) document.getElementById('v-brand').value = vehicle.brand;
        if (document.getElementById('v-model')) document.getElementById('v-model').value = vehicle.model;
        if (document.getElementById('v-year')) document.getElementById('v-year').value = vehicle.year;
        if (document.getElementById('v-price')) document.getElementById('v-price').value = vehicle.price;
        if (document.getElementById('v-mileage')) document.getElementById('v-mileage').value = vehicle.mileage;
        if (document.getElementById('v-status')) document.getElementById('v-status').value = vehicle.status;
        if (document.getElementById('v-plateId')) document.getElementById('v-plateId').value = vehicle.plateId;
        if (document.getElementById('v-observations')) document.getElementById('v-observations').value = vehicle.observations;

        // Manejo de la imagen
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('image-placeholder');

        const imagePath = vehicle.imageUrl || vehicle.image;
        if (imagePath && preview) {
            const fullImageUrl = imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
            preview.src = fullImageUrl;
            preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }

        // Seller Info
        if (vehicle.user && vehicle.user.name) {
            const sellerName = document.getElementById('seller-name');
            const sellerAvatar = document.getElementById('seller-avatar');
            if (sellerName) sellerName.textContent = vehicle.user.name;
            if (sellerAvatar) sellerAvatar.textContent = vehicle.user.name.charAt(0).toUpperCase();
        }
    }

    // Auth check for navbar
    const token = sessionStorage.getItem('token');
    if (token) {
        const authLink = document.getElementById('auth-link');
        const registerLink = document.getElementById('register-link');
        const userMenu = document.getElementById('user-menu');

        if (authLink) authLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('token');
        window.location.reload();
    });

    // --- Contact & Chat Logic ---
    const contactBtn = document.getElementById('contact-seller');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const sendMsgBtn = document.getElementById('send-msg');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const userToken = sessionStorage.getItem('token');

            if (!userToken) {
                // Si no está registrado, al login
                window.location.href = '/login';
            } else {
                // Si está logueado, abrir chat
                chatWindow.classList.add('active');

                // Actualizar info del vendedor en el chat
                const currentSellerName = document.getElementById('seller-name')?.textContent;
                if (currentSellerName) {
                    document.getElementById('chat-seller-name').textContent = currentSellerName;
                    document.getElementById('chat-seller-avatar').textContent = currentSellerName.charAt(0).toUpperCase();
                }
            }
        });
    }

    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    if (sendMsgBtn && chatInput) {
        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (text === '') return;

            // Crear burbuja de mensaje enviado
            const msgDiv = document.createElement('div');
            msgDiv.className = 'message-sent';
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);

            // Limpiar input y scroll
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Mock de respuesta automática (después integrarás backend)
            setTimeout(() => {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'message-received';
                replyDiv.textContent = "¡Entendido! Te responderé lo antes posible.";
                chatMessages.appendChild(replyDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        };

        sendMsgBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

async function getVehicleById(id) {
    try {
        const response = await fetch('http://localhost:3000/vehicles/specification/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Error al obtener los detalles del vehículo.');
        return null;
    }
}
