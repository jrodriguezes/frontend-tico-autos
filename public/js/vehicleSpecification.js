import {
    getVehicleById,
    getCurrentUser,
    getChatHistory,
    getCurrentChat,
    sendMessageToBackend,
    getUserNameById
} from './vehicleSpecificationLogic.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const vehicleId = params.get('id');

    if (!vehicleId) {
        window.location.href = '/home';
        return;
    }

    const contactBtn = document.getElementById('contact-seller');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const sendMsgBtn = document.getElementById('send-msg');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    const token = sessionStorage.getItem('token');
    const currentUser = await getCurrentUser();
    const vehicle = await getVehicleById(vehicleId);
    const userName = await getUserNameById(vehicle.ownerId);

    if (!vehicle) {
        alert('Error al obtener los detalles del vehículo.');
        return;
    }

    renderVehicle(vehicle, userName);
    setupNavbar(token);
    setupLogout();

    if (currentUser && vehicle.ownerId === currentUser.numberId && contactBtn) {
        contactBtn.disabled = true;
        contactBtn.textContent = 'Eres el dueño de este vehículo';
    }

    contactBtn?.addEventListener('click', async () => {
        const userToken = sessionStorage.getItem('token');

        if (!userToken) {
            window.location.href = '/login';
            return;
        }

        chatWindow?.classList.add('active');

        const currentSellerName = document.getElementById('seller-name')?.textContent;
        if (currentSellerName) {
            document.getElementById('chat-seller-name').textContent = currentSellerName;
            document.getElementById('chat-seller-avatar').textContent = currentSellerName.charAt(0).toUpperCase();
        }

        await renderChatHistory();
        await updateChatAvailability();
    });

    closeChatBtn?.addEventListener('click', () => {
        chatWindow?.classList.remove('active');
    });

    if (sendMsgBtn && chatInput) {
        const sendMessage = async () => {
            const text = chatInput.value.trim();
            if (text === '') return;

            const response = await sendMessageToBackend({
                vehicleId,
                sellerId: document.getElementById('seller-id')?.textContent,
                text
            });

            if (response) {
                chatInput.value = '';
                await renderChatHistory();
                await updateChatAvailability();
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        sendMsgBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    async function renderChatHistory() {
        if (!chatMessages || !currentUser) return;

        const history = await getChatHistory(vehicleId, currentUser.numberId);
        chatMessages.innerHTML = '';

        for (const message of history) {
            if (message.question) {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'message-sent';
                questionDiv.textContent = message.question.content;
                chatMessages.appendChild(questionDiv);
            }

            if (message.answer) {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'message-received';
                answerDiv.textContent = message.answer.content;
                chatMessages.appendChild(answerDiv);
            }
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function updateChatAvailability() {
        if (!chatInput || !sendMsgBtn || !currentUser) return;

        const sellerId = Number(document.getElementById('seller-id')?.textContent);
        const isOwner = currentUser.numberId === sellerId;

        const chat = await getCurrentChat(vehicleId, currentUser.numberId);

        if (!chat) {
            if (isOwner) {
                chatInput.disabled = true;
                sendMsgBtn.disabled = true;
                chatInput.placeholder = 'Debes esperar a que un cliente inicie el chat';
            } else {
                chatInput.disabled = false;
                sendMsgBtn.disabled = false;
                chatInput.placeholder = 'Escribe tu primer mensaje...';
            }
            return;
        }

        if (isOwner) {
            const canWrite = chat.turn === 'owner';
            chatInput.disabled = !canWrite;
            sendMsgBtn.disabled = !canWrite;
            chatInput.placeholder = canWrite
                ? 'Escribe una respuesta...'
                : 'Debes esperar a que el cliente escriba';
        } else {
            const canWrite = chat.turn === 'client';
            chatInput.disabled = !canWrite;
            sendMsgBtn.disabled = !canWrite;
            chatInput.placeholder = canWrite
                ? 'Escribe un mensaje...'
                : 'Debes esperar a que el vendedor responda';
        }
    }
});

function renderVehicle(vehicle, userName) {
    setText('seller-id', vehicle.ownerId);
    setText('seller-name', userName.name);
    setText('v-title-display', `${vehicle.brand} ${vehicle.model}`);
    setText('v-price-display', `$${Number(vehicle.price).toLocaleString()}`);
    setText('v-brand-display', vehicle.brand);
    setText('v-model-display', vehicle.model);
    setText('v-year-display', vehicle.year);
    setText('v-mileage-display', `${Number(vehicle.mileage || 0).toLocaleString()} km`);
    setText('v-plate-display', vehicle.plateId || '-');
    setText('v-detail-price', `$${Number(vehicle.price).toLocaleString()}`);
    setText('v-observations-display', vehicle.observations || 'Sin observaciones adicionales.');

    setValue('v-brand', vehicle.brand);
    setValue('v-model', vehicle.model);
    setValue('v-year', vehicle.year);
    setValue('v-price', vehicle.price);
    setValue('v-mileage', vehicle.mileage);
    setValue('v-status', vehicle.status);
    setValue('v-plateId', vehicle.plateId);
    setValue('v-observations', vehicle.observations);

    const statusBadge = document.getElementById('v-status-badge');
    if (statusBadge) {
        statusBadge.textContent = vehicle.status;
        statusBadge.className = `status-indicator ${vehicle.status === 'Disponible' ? 'status-available' : 'status-sold'}`;
    }

    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('image-placeholder');
    const imagePath = vehicle.imageUrl || vehicle.image;

    if (imagePath && preview) {
        const fullImageUrl = imagePath.startsWith('http')
            ? imagePath
            : `http://localhost:3000${imagePath}`;
        preview.src = fullImageUrl;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    }

    if (vehicle.user?.name) {
        setText('seller-name', vehicle.user.name);
        setText('seller-avatar', vehicle.user.name.charAt(0).toUpperCase());
    }
}

function setupNavbar(token) {
    const authLink = document.getElementById('auth-link');
    const registerLink = document.getElementById('register-link');
    const userMenu = document.getElementById('user-menu');

    if (token) {
        if (authLink) authLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    }
}

function setupLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('token');
        window.location.reload();
    });
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '';
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? '';
}