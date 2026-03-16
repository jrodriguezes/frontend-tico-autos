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
        if (document.getElementById('seller-id')) {
            document.getElementById('seller-id').textContent = vehicle.ownerId;
        }

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
        contactBtn.addEventListener('click', async () => {
            const userToken = sessionStorage.getItem('token');

            if (!userToken) {
                // Si no esta registrado, al login
                window.location.href = '/login';
            }

            if (userToken) {
                // Si esta logueado, abrir chat
                chatWindow.classList.add('active');

                // Actualizar info del vendedor en el chat
                const currentSellerName = document.getElementById('seller-name')?.textContent;
                if (currentSellerName) {
                    document.getElementById('chat-seller-name').textContent = currentSellerName;
                    document.getElementById('chat-seller-avatar').textContent = currentSellerName.charAt(0).toUpperCase();
                }

                await renderChatHistory();
                await updateChatAvailability();
            }
        });
    }

    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    if (sendMsgBtn && chatInput) {
        const sendMessage = async () => {
            const text = chatInput.value.trim();
            if (text === '') return;

            const response = await sendMessageToBackend(chatInput.value);

            if (response) {
                chatInput.value = '';
                await renderChatHistory();
                await updateChatAvailability();
            }

            // Limpiar input y scroll
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        sendMsgBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    const currentUser = await getCurrentUser();

    if (vehicle.ownerId === currentUser.numberId) {
        contactBtn.disabled = true;
        contactBtn.textContent = 'Eres el dueño de este vehiculo';
        return;
    }
}
);

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
async function getCurrentUser() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('http://localhost:3000/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        return null;
    }
}

async function getChatHistory() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    const params = new URLSearchParams();

    const getUrlParams = new URLSearchParams(window.location.search);
    const vehicleId = getUrlParams.get('id');

    params.append('vehicleId', vehicleId);

    const currentUser = await getCurrentUser()
    params.append('interestedClientId', currentUser.numberId);

    try {
        const response = await fetch(`http://localhost:3000/chats/history?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error('Error obteniendo historial de chat:', error);
        return null;
    }
}

async function sendMessageToBackend(text) {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) { return null };

        const urlParams = new URLSearchParams(window.location.search);

        const vehicleId = urlParams.get('id');

        const sellerId = document.getElementById('seller-id').textContent;

        const currentUser = await getCurrentUser();

        let status = "";
        if (currentUser.numberId == sellerId) {
            status = "owner";

            const params = new URLSearchParams();
            params.append('vehicleId', vehicleId);
            params.append('interestedClientId', interestedClientId);

            const chatId = await fetch(`http://localhost:3000/chats?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })

            try {
                const lastQuestion = await fetch('http://localhost:3000/chats/lastQuestion', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chatId: chatId.id,
                    })
                })

                const response = await fetch(`http://localhost:3000/chats/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        questionId: lastQuestion.id,
                        vehicleOwnerId: sellerId,
                        content: text,
                    })
                })

                if (!response.ok) {
                    throw new Error(`Error en el servidor: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Error obteniendo historial de chat:', error);
                alert('Error al obtener el historial de chat.');
            }

        } else if (currentUser.numberId != sellerId) {
            status = "client";

            const chat = {
                vehicleId: vehicleId,
                ownerId: sellerId,
                interestedClientId: currentUser.numberId,
                turn: status
            }

            const interestedClientId = currentUser.numberId;
            const content = text;

            const params = new URLSearchParams();
            params.append('vehicleId', vehicleId);
            params.append('interestedClientId', interestedClientId);

            const chatId = await fetch(`http://localhost:3000/chats?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })

            const question = {
                chatId: chatId.id,
                interestedClientId: interestedClientId,
                content: content,
                status: 'waiting'
            }

            try {
                const response = await fetch(`http://localhost:3000/chats/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat,
                        question
                    })
                })

                if (!response.ok) {
                    throw new Error(`Error en el servidor: ${response.status}`);
                }

                return await response.json();

            } catch (error) {
                console.error('Error enviando mensaje:', error);
                alert('Error al enviar el mensajee.');
            }
        }

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        alert('Error al enviar el mensajey.');
    }
}

async function renderChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const chatHistory = await getChatHistory();
    if (!chatHistory) return;

    chatMessages.innerHTML = '';

    for (const message of chatHistory) {
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
    const chatInput = document.getElementById('chat-input');
    const sendMsgBtn = document.getElementById('send-msg');
    const sellerId = Number(document.getElementById('seller-id')?.textContent);
    const currentUser = await getCurrentUser();

    if (!chatInput || !sendMsgBtn || !currentUser || !sellerId) return;

    const isOwner = currentUser.numberId === sellerId;
    const chat = await getCurrentChat();

    // Si no existe chat todavía
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

async function getCurrentChat() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const vehicleId = new URLSearchParams(window.location.search).get('id');
    if (!vehicleId) return null;

    const params = new URLSearchParams();
    params.append('vehicleId', vehicleId);
    params.append('interestedClientId', currentUser.numberId);

    try {
        const response = await fetch(`http://localhost:3000/chats?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 404) return null;
        if (!response.ok) return null;

        const text = await response.text();
        if (!text) return null;

        return JSON.parse(text);
    } catch (error) {
        console.error('Error obteniendo chat actual:', error);
        return null;
    }
}