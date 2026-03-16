import { fetchVehicles, getFiltersFromForm, resolveVehicleImage } from './homeLogic.js';

document.addEventListener('DOMContentLoaded', async () => {
    const filterForm = document.getElementById('filter-form');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const resultsCount = document.getElementById('results-count');
    const paginationControls = document.getElementById('pagination-controls');

    let currentPage = 1;
    const itemsPerPage = 8;
    let currentFilters = null;

    loadVehicles();

    filterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentPage = 1;
        currentFilters = getFiltersFromForm(filterForm);
        await loadVehicles();
    });

    async function loadVehicles() {
        showLoader();

        try {
            const response = await fetchVehicles(currentFilters, currentPage, itemsPerPage);

            renderVehicles(response.data);
            renderPagination(response.total);
            resultsCount.textContent = `${response.total} Vehículos Encontrados`;


        } catch (error) {
            console.error('Error fetching vehicles:', error);
            vehiclesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    Ocurrió un error al cargar los vehículos.
                </div>
            `;
        }
    }

    function renderVehicles(vehicles) {
        if (!vehicles || vehicles.length === 0) {
            vehiclesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    No se encontraron vehículos que coincidan con tu búsqueda.
                </div>
            `;
            return;
        }

        vehiclesGrid.innerHTML = vehicles.map(vehicle => {
            const imagePath = resolveVehicleImage(vehicle.imageUrl);

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
                            <h2 class="vehicle-title" style="font-size: 1.2rem; font-weight: 700; color: #fff;">
                                ${vehicle.brand} ${vehicle.model}
                            </h2>
                            <span class="vehicle-price" style="font-size: 1.25rem; font-weight: 800; color: var(--accent);">
                                $${Number(vehicle.price).toLocaleString()}
                            </span>
                        </div>
                        <div class="vehicle-details" style="display: flex; gap: 1.25rem; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
                            <span><i class="fas fa-calendar"></i> ${vehicle.year}</span>
                            <span><i class="fas fa-tachometer-alt"></i> ${vehicle.mileage || '0'} km</span>
                        </div>
                        <button class="btn btn-primary btn-block" style="margin-top: 0;" onclick="viewDetail('${vehicle._id}')">
                            Ver Detalles
                        </button>
                    </div>
                    <div class="vehicle-footer" style="padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                        <div class="owner-info" style="font-size: 0.8rem; color: var(--text-secondary);">
                            Vendedor
                            <span style="display: block; color: #fff; font-weight: 600; font-size: 0.9rem; margin-top: 0.1rem;">
                                ${vehicle.ownerId ? vehicle.ownerId : 'Vendedor Privado'}
                            </span>
                        </div>
                        <button class="btn-share" onclick="shareVehicle('${vehicle._id}')" title="Copiar enlace" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
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

    window.changePage = async (page) => {
        currentPage = page;
        await loadVehicles();

        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.shareVehicle = (id) => {
        const url = `${window.location.origin}/specification?id=${id}`;
        navigator.clipboard.writeText(url).catch(err => {
            console.error('Error copying link:', err);
        });
    };

    window.viewDetail = (id) => {
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

    const inboxBtn = document.getElementById('inbox-btn');
    const inboxWindow = document.getElementById('inbox-window');
    const closeInboxBtn = document.getElementById('close-inbox');
    const inboxListView = document.getElementById('inbox-list-view');
    const inboxChatView = document.getElementById('inbox-chat-view');
    const backToListBtn = document.getElementById('back-to-list');
    const inboxListContainer = document.getElementById('inbox-list-container');

    try {
        if (!token) throw new Error('No hay sesión iniciada');

        let currentUserId = null;
        const userRes = await fetch('http://localhost:3000/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
            const user = await userRes.json();
            currentUserId = user.numberId;
        }

        const chats = await fetch('http://localhost:3000/chats/inbox', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!chats.ok) {
            throw new Error('Error al obtener el historial de chat');
        }

        const data = await chats.json();

        if (inboxListContainer) {
            if (data.length === 0) {
                inboxListContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No tienes mensajes.</div>';
            } else {
                inboxListContainer.innerHTML = data.map(chat => {
                    const isOwner = chat.ownerId === currentUserId;
                    const displayName = isOwner ? chat.interestedClientName : chat.ownerName;
                    
                    const words = displayName.trim().split(' ');
                    const initials = words.length > 1 
                        ? (words[0][0] + words[1][0]).toUpperCase() 
                        : displayName.substring(0, 2).toUpperCase();

                    return `
                        <div class="chat-item" onclick="openChat('${chat.chatId}', '${chat.vehicleId}', '${chat.ownerId}', '${chat.interestedClientId}', '${displayName}', '${initials}', 'var(--primary)')">
                            <div class="chat-item-avatar" style="background: var(--primary);">${initials}</div>
                            <div class="chat-item-info">
                                <div class="chat-item-name">${displayName}</div>
                                <div class="chat-item-last-msg">Vehículo: ${chat.vehiclePlate || 'Sin placa'}</div>
                            </div>
                            <div style="text-align: right;">
                                <div class="chat-item-time"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

    } catch (error) {
        console.error('Error obteniendo historial de chat:', error);
        if (inboxListContainer) {
            inboxListContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">Error al cargar los mensajes.</div>';
        }
    }

    if (inboxBtn && inboxWindow) {
        inboxBtn.addEventListener('click', () => {
            inboxWindow.classList.toggle('active');
            if (!inboxWindow.classList.contains('active')) {
                inboxListView.style.display = 'flex';
                inboxChatView.classList.remove('active');
            }
        });
    }

    if (closeInboxBtn && inboxWindow) {
        closeInboxBtn.addEventListener('click', () => {
            inboxWindow.classList.remove('active');
        });
    }

    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => {
            inboxListView.style.display = 'flex';
            inboxChatView.classList.remove('active');
        });
    }

    window.currentInboxChat = null;

    window.openChat = async (chatId, vehicleId, ownerId, interestedClientId, name, initials, color = 'var(--primary)') => {
        const activeName = document.getElementById('active-chat-name');
        const activeAvatar = document.getElementById('active-chat-avatar');
        
        if (activeName) activeName.textContent = name;
        if (activeAvatar) {
            activeAvatar.textContent = initials;
            activeAvatar.style.background = color;
        }

        window.currentInboxChat = { chatId, vehicleId, ownerId, interestedClientId, name };

        inboxListView.style.display = 'none';
        inboxChatView.classList.add('active');

        await renderInboxChatHistory();
        await updateInboxChatAvailability();
    };

    async function getInboxChatHistory() {
        if (!window.currentInboxChat) return null;
        const { vehicleId, interestedClientId } = window.currentInboxChat;
        const token = sessionStorage.getItem('token');
        if (!token) return null;

        const params = new URLSearchParams();
        params.append('vehicleId', vehicleId);
        params.append('interestedClientId', interestedClientId);

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

    async function sendInboxMessageToBackend(text) {
        if (!window.currentInboxChat) return null;
        const { chatId, vehicleId, ownerId, interestedClientId } = window.currentInboxChat;
        const token = sessionStorage.getItem('token');
        if (!token) return null;

        try {
            const userRes = await fetch('http://localhost:3000/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const currentUser = await userRes.json();
            
            const isOwner = currentUser.numberId === Number(ownerId);

            if (isOwner) {
                const lastQuestion = await fetch(`http://localhost:3000/chats/lastQuestion?chatId=${chatId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const lastQuestionText = await lastQuestion.text();
                if (!lastQuestion.ok) throw new Error(`Error en última pregunta: ${lastQuestionText}`);
                
                const lastQuestionData = lastQuestionText ? JSON.parse(lastQuestionText) : null;
                if (!lastQuestionData) throw new Error('La última pregunta regresó vacía del backend');

                const chat = {
                    vehicleId: vehicleId,
                    ownerId: Number(ownerId),
                    interestedClientId: Number(interestedClientId),
                    turn: "owner"
                };

                const answer = {
                    questionId: lastQuestionData._id || lastQuestionData.id,
                    vehicleOwnerId: Number(ownerId),
                    content: text
                };

                const response = await fetch(`http://localhost:3000/chats/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat: chat,
                        answer: answer
                    })
                });

                const respText = await response.text();
                if (!response.ok) {
                    let errPayload;
                    try { errPayload = JSON.parse(respText); } catch(e){}
                    throw new Error(errPayload?.message || respText || `Error HTTP ${response.status}`);
                }
                return respText ? JSON.parse(respText) : {};
            } else {
                const chat = {
                    vehicleId: vehicleId,
                    ownerId: Number(ownerId),
                    interestedClientId: currentUser.numberId,
                    turn: "client"
                };

                const question = {
                    chatId: chatId,
                    interestedClientId: currentUser.numberId,
                    content: text,
                    status: 'waiting'
                };

                const response = await fetch(`http://localhost:3000/chats/message`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ chat, question })
                });

                const respText = await response.text();
                if (!response.ok) {
                    let errPayload;
                    try { errPayload = JSON.parse(respText); } catch(e){}
                    throw new Error(errPayload?.message || respText || `Error HTTP ${response.status}`);
                }
                return respText ? JSON.parse(respText) : {};
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            alert(`Error al enviar el mensaje: ${error.message}`);
            return null;
        }
    }

    async function renderInboxChatHistory() {
        const chatMessages = document.getElementById('inbox-chat-messages');
        if (!chatMessages || !window.currentInboxChat) return;

        chatMessages.innerHTML = '<div style="text-align: center; padding: 1rem;"><i class="fas fa-spinner fa-spin"></i> Cargando mensajes...</div>';

        const chatHistory = await getInboxChatHistory();
        if (!chatHistory) {
             chatMessages.innerHTML = '';
             return;
        }

        chatMessages.innerHTML = '';

        const token = sessionStorage.getItem('token');
        const userRes = await fetch('http://localhost:3000/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const currentUser = await userRes.json();
        const { ownerId } = window.currentInboxChat;
        const isOwner = currentUser.numberId === Number(ownerId);

        for (const message of chatHistory) {
            if (message.question) {
                const questionDiv = document.createElement('div');
                questionDiv.className = isOwner ? 'message-received' : 'message-sent';
                questionDiv.textContent = message.question.content;
                chatMessages.appendChild(questionDiv);
            }

            if (message.answer) {
                const answerDiv = document.createElement('div');
                answerDiv.className = isOwner ? 'message-sent' : 'message-received';
                answerDiv.textContent = message.answer.content;
                chatMessages.appendChild(answerDiv);
            }
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function updateInboxChatAvailability() {
        const chatInput = document.getElementById('inbox-chat-input');
        const sendMsgBtn = document.getElementById('btn-send-inbox');
        if (!chatInput || !sendMsgBtn || !window.currentInboxChat) return;

        const { vehicleId, interestedClientId, ownerId } = window.currentInboxChat;
        const token = sessionStorage.getItem('token');
        if (!token) return;

        try {
            const userRes = await fetch('http://localhost:3000/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const currentUser = await userRes.json();
            const isOwner = currentUser.numberId === Number(ownerId);

            const params = new URLSearchParams();
            params.append('vehicleId', vehicleId);
            params.append('interestedClientId', interestedClientId);

            const response = await fetch(`http://localhost:3000/chats?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) return;
            const textResponse = await response.text();
            if (!textResponse) return;
            
            const chat = JSON.parse(textResponse);

            if (isOwner) {
                const canWrite = chat.turn === 'owner';
                chatInput.disabled = !canWrite;
                sendMsgBtn.disabled = !canWrite;
                chatInput.placeholder = canWrite ? 'Escribe una respuesta...' : 'Debes esperar a que el cliente escriba';
            } else {
                const canWrite = chat.turn === 'client';
                chatInput.disabled = !canWrite;
                sendMsgBtn.disabled = !canWrite;
                chatInput.placeholder = canWrite ? 'Escribe un mensaje...' : 'Debes esperar a que el vendedor responda';
            }
        } catch (error) {
            console.error(error);
        }
    }

    const sendInboxBtn = document.getElementById('btn-send-inbox');
    const inboxInput = document.getElementById('inbox-chat-input');
    const inboxChatMessages = document.getElementById('inbox-chat-messages');

    if (sendInboxBtn && inboxInput) {
        const sendInboxMessage = async () => {
            const text = inboxInput.value.trim();
            if (text === '') return;

            const msgDiv = document.createElement('div');
            msgDiv.className = 'message-sent';
            msgDiv.textContent = text;
            inboxChatMessages.appendChild(msgDiv);

            inboxInput.value = '';
            inboxChatMessages.scrollTop = inboxChatMessages.scrollHeight;

            const response = await sendInboxMessageToBackend(text);
            if(response) {
                 await renderInboxChatHistory();
                 await updateInboxChatAvailability();
            }
        };

        sendInboxBtn.addEventListener('click', sendInboxMessage);
        inboxInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendInboxMessage();
        });
    }

    if (token && inboxBtn) {
        inboxBtn.style.display = 'flex';
    } else if (inboxBtn) {
        inboxBtn.style.display = 'none';
    }

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

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
